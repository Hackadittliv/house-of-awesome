import { describe, expect, it } from "vitest";

import { GIFT_CARD_MAX_SEK, GIFT_CARD_MIN_SEK, giftCardMetadata, validateGiftCard } from "@/lib/giftcard/giftcard";

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
