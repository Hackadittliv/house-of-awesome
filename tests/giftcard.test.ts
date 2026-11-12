import { afterEach, describe, expect, it, vi } from "vitest";

import { findCopyViolations } from "../scripts/copy-rules.mjs";
import {
  GIFT_CARD_MAX_SEK,
  GIFT_CARD_MIN_SEK,
  GIFT_CARD_OFFER_LINE,
  GIFT_CARD_PROMO_UNREACHABLE,
  giftCardCheckoutPayload,
  giftCardMetadata,
  giftCardThanksText,
  isGiftCardOfferOpen,
  parseGiftCardPromoPreview,
  previewGiftCardPromo,
  readGiftCardReceipt,
  validateGiftCard,
} from "@/lib/giftcard/giftcard";

const base = { amountSek: 1000, buyerEmail: "a@b.se" };

describe("presentkort", () => {
  it("följer LIA:s beloppsgränser", () => {
    expect(validateGiftCard({ ...base, amountSek: GIFT_CARD_MIN_SEK })).toBeNull();
    expect(validateGiftCard({ ...base, amountSek: GIFT_CARD_MAX_SEK })).toBeNull();
    expect(validateGiftCard({ ...base, amountSek: GIFT_CARD_MIN_SEK - 1 })).toBe("amount");
    expect(validateGiftCard({ ...base, amountSek: GIFT_CARD_MAX_SEK + 1 })).toBe("amount");
    expect(validateGiftCard({ ...base, amountSek: 250.5 })).toBe("amount");
  });

  it("kräver köparens e-post och validerar mottagare", () => {
    expect(validateGiftCard({ ...base, buyerEmail: "x" })).toBe("email");
    expect(validateGiftCard({ ...base, recipientEmail: "nope" })).toBe("recipientEmail");
    expect(validateGiftCard({ ...base, message: "x".repeat(401) })).toBe("tooLong");
  });

  it("skickar bara tillåtna metadatafält", () => {
    const m = giftCardMetadata({ ...base, buyerEmail: " A@B.se ", recipientName: " Eva ", recipientEmail: "", message: "Grattis" });
    expect(m).toEqual({ gift_card_amount_sek: "1000", purchaser_email: "a@b.se", recipient_name: "Eva", gift_message: "Grattis" });
    const allowed = ["gift_card_amount_sek", "purchaser_email", "purchaser_name", "recipient_email", "recipient_name", "gift_message"];
    expect(Object.keys(m).every((k) => allowed.includes(k))).toBe(true);
  });
});

const paidMetadata = { gift_card_amount_sek: "1000", purchaser_email: "a@b.se" };
const checkoutArgs = {
  email: "a@b.se",
  metadata: paidMetadata,
  returnUrl: "https://houseofawesome.se/presentkort/tack?session_id={CHECKOUT_SESSION_ID}",
  requestId: "req-1",
};

describe("kampanjkodens klocka och texter", () => {
  it("gäller inklusive sista sekunden i Stockholm och är stängd sekunden efter", () => {
    expect(isGiftCardOfferOpen(new Date("2027-11-12T22:59:59.000Z"))).toBe(true);
    expect(isGiftCardOfferOpen(new Date("2027-11-12T23:00:00.000Z"))).toBe(false);
    expect(isGiftCardOfferOpen(new Date("2026-11-12T12:00:00.000Z"))).toBe(true);
  });

  it("lovar inget med förbjudna ord", () => {
    for (const text of [GIFT_CARD_OFFER_LINE, GIFT_CARD_PROMO_UNREACHABLE]) {
      expect(findCopyViolations(text)).toEqual([]);
      expect(text).not.toMatch(/(?<!\p{L})(men|sjukt)(?!\p{L})/iu);
      expect(text.toLowerCase()).not.toContain("på riktigt");
    }
    expect(GIFT_CARD_PROMO_UNREACHABLE).not.toMatch(/20\s*%/);
  });
});

describe("förhandsvisning av kampanjkod", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("visar serverns giltiga svar", async () => {
    const requests: Array<{ url: string; body: string }> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
        requests.push({ url: String(url), body: String(init?.body ?? "") });
        return Response.json({
          valid: true,
          code: "AWESOME2027",
          displayCode: "Awesome2027",
          bonusPercent: 20,
          paidSek: 1000,
          valueSek: 1200,
          endsAt: "2027-11-12 23:59:59",
          timeZone: "Europe/Stockholm",
          message: "Du betalar 1 000 kr – presentkortet blir värt 1 200 kr",
        });
      }),
    );
    const preview = await previewGiftCardPromo({ promoCode: "  awesome2027 ", amountSek: 1000 });
    expect(preview).toMatchObject({
      state: "valid",
      displayCode: "Awesome2027",
      paidSek: 1000,
      valueSek: 1200,
      message: "Du betalar 1 000 kr – presentkortet blir värt 1 200 kr",
    });
    expect(requests[0]?.url).toContain("/functions/v1/validate-gift-card-promo");
    const body = JSON.parse(requests[0]?.body ?? "{}");
    expect(body).toEqual({ promoCode: "awesome2027", amountSek: 1000, priceId: "gift_card_custom" });
    expect(JSON.stringify(body)).not.toContain("1200");
  });

  it("visar ogiltig kod utan att räkna ett värde", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ valid: false, reason: "expired", message: "Koden Awesome2027 gällde till 12 november 2027." })),
    );
    await expect(previewGiftCardPromo({ promoCode: "Awesome2027", amountSek: 1000 })).resolves.toEqual({
      state: "invalid",
      reason: "expired",
      message: "Koden Awesome2027 gällde till 12 november 2027.",
    });
  });

  it("lovar ingen bonus när endpointen saknas eller svaret är ofullständigt", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("missing", { status: 404 })));
    await expect(previewGiftCardPromo({ promoCode: "Awesome2027", amountSek: 1000 })).resolves.toEqual({ state: "unreachable" });

    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new Error("network"))));
    await expect(previewGiftCardPromo({ promoCode: "Awesome2027", amountSek: 1000 })).resolves.toEqual({ state: "unreachable" });

    expect(parseGiftCardPromoPreview({ valid: true, bonusPercent: 20, paidSek: 1000 })).toEqual({ state: "unreachable" });
    expect(parseGiftCardPromoPreview({ valid: false, reason: "unknown", message: "Koden stämmer inte." })).toEqual({
      state: "invalid",
      reason: "unknown",
      message: "Koden stämmer inte.",
    });
  });
});

describe("checkout utan nominellt värde", () => {
  it("lämnar payloaden oförändrad när koden saknas", () => {
    expect(giftCardCheckoutPayload(checkoutArgs)).toEqual({
      priceId: "gift_card_custom",
      customerEmail: "a@b.se",
      returnUrl: checkoutArgs.returnUrl,
      quantity: 1,
      requestId: "req-1",
      metadata: paidMetadata,
    });
    expect(giftCardCheckoutPayload({ ...checkoutArgs, promoCode: "   " })).not.toHaveProperty("promoCode");
  });

  it("skickar koden och det betalda beloppet, aldrig ett nominellt värde", () => {
    const payload = giftCardCheckoutPayload({
      ...checkoutArgs,
      metadata: { ...paidMetadata, gift_card_value_sek: "1200", valueSek: "1200", nominal: "1200" },
      promoCode: " Awesome2027 ",
    });
    expect(payload.promoCode).toBe("Awesome2027");
    expect(payload.metadata).toEqual(paidMetadata);
    const serialized = JSON.stringify(payload);
    expect(serialized).not.toContain("1200");
    expect(serialized).not.toMatch(/valueSek|nominal|face|bonus/i);
    expect(readGiftCardReceipt({ paidSek: 1000, valueSek: 1200, promoCode: "AWESOME2027", bonusPercent: 20 })).toEqual({
      paidSek: 1000,
      valueSek: 1200,
      promoCode: "AWESOME2027",
      bonusPercent: 20,
    });
    expect(giftCardThanksText(readGiftCardReceipt({ paidSek: 1000, valueSek: 1200, promoCode: "AWESOME2027", bonusPercent: 20 }))).toMatch(/1[\s\u00a0\u202f]?200 kr/);
    expect(giftCardThanksText(readGiftCardReceipt({ paidSek: 1000, valueSek: 1000, promoCode: "AWESOME2027", bonusPercent: 0 }))).toBeNull();
  });
});
