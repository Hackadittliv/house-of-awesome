// @vitest-environment happy-dom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GiftCardForm } from "@/components/giftcard/GiftCardForm";
import { GiftCardThanksValue } from "@/components/giftcard/GiftCardThanksValue";
import {
  GIFT_CARD_OFFER_LINE,
  GIFT_CARD_PROMO_DEBOUNCE_MS,
  GIFT_CARD_PROMO_UNREACHABLE,
  GIFT_CARD_RECEIPT_STORAGE_KEY,
  formatSek,
} from "@/lib/giftcard/giftcard";

vi.mock("@/components/booking/EmbeddedCheckout", () => ({
  EmbeddedCheckout: () => null,
}));

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

type Call = { url: string; body: Record<string, unknown> };

let root: Root | undefined;
let calls: Call[] = [];
let endpointDown = false;

function installFetch() {
  calls = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      const body = init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : {};
      calls.push({ url: String(url), body });
      if (String(url).includes("validate-gift-card-promo")) {
        if (endpointDown) return new Response("missing", { status: 404 });
        const code = String(body.promoCode ?? "").trim().toUpperCase();
        if (code === "AWESOME2027") {
          const paid = Number(body.amountSek);
          const value = Math.round(paid * 1.2);
          return Response.json({
            valid: true,
            code: "AWESOME2027",
            displayCode: "Awesome2027",
            bonusPercent: 20,
            paidSek: paid,
            valueSek: value,
            endsAt: "2027-11-12 23:59:59",
            timeZone: "Europe/Stockholm",
            message: `Du betalar ${formatSek(paid).replace(" kr", "")} kr. Presentkortet blir värt ${formatSek(value)}.`,
          });
        }
        return Response.json({ valid: false, reason: "unknown", message: "Koden stämmer inte." });
      }
      if (String(url).includes("create-checkout")) {
        const paid = Number((body.metadata as { gift_card_amount_sek?: string } | undefined)?.gift_card_amount_sek);
        const giftCard = typeof body.promoCode === "string"
          ? { paidSek: paid, valueSek: Math.round(paid * 1.2), promoCode: "AWESOME2027", bonusPercent: 20 }
          : undefined;
        return Response.json({ clientSecret: "cs_test_secret", ...(giftCard ? { giftCard } : {}) });
      }
      return new Response("missing", { status: 404 });
    }),
  );
}

afterEach(() => {
  act(() => {
    root?.unmount();
  });
  root = undefined;
  document.body.replaceChildren();
  endpointDown = false;
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function renderForm() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root!.render(createElement(GiftCardForm));
  });
  return container;
}

async function setField(container: ParentNode, id: string, value: string) {
  const input = container.querySelector<HTMLInputElement>(`#${id}`);
  expect(input).not.toBeNull();
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  await act(async () => {
    setter?.call(input, value);
    input!.dispatchEvent(new Event("input", { bubbles: true }));
    input!.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

async function openPromo(container: ParentNode) {
  const toggle = [...container.querySelectorAll("button")].find((button) => button.textContent?.trim() === "Har du en kampanjkod?");
  expect(toggle).toBeTruthy();
  await act(async () => {
    toggle!.click();
  });
}

async function settlePreview() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, GIFT_CARD_PROMO_DEBOUNCE_MS + 80));
  });
}

function checkoutCalls() {
  return calls.filter((call) => call.url.includes("create-checkout"));
}

function nominalFree(body: Record<string, unknown>, paidSek: string) {
  const serialized = JSON.stringify(body);
  expect(serialized).not.toMatch(/valueSek|nominal|face|bonus/i);
  expect(body.metadata).toMatchObject({ gift_card_amount_sek: paidSek });
  if (paidSek === "1000") expect(serialized).not.toContain("1200");
}

describe("presentkortsformulärets kampanjkod", () => {
  it("visar erbjudandet sista giltiga sekunden och döljer raden direkt efter", async () => {
    installFetch();
    const lastSecond = new Date("2027-11-12T22:59:59.000Z");
    const afterDeadline = new Date("2027-11-12T23:00:00.000Z");
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(lastSecond);
    const open = await renderForm();
    expect(open.querySelector("[data-testid=giftcard-offer]")?.textContent).toBe(GIFT_CARD_OFFER_LINE);

    vi.setSystemTime(afterDeadline);
    act(() => {
      root?.unmount();
    });
    const closed = await renderForm();
    expect(closed.querySelector("[data-testid=giftcard-offer]")).toBeNull();
    expect(closed.textContent).toContain("Har du en kampanjkod?");
  });

  it("visar serverns meddelande för en giltig kod och uppdaterar det när beloppet ändras", async () => {
    installFetch();
    const container = await renderForm();
    await openPromo(container);
    await setField(container, "gc-promo", "  Awesome2027 ");
    await settlePreview();
    const valid = container.querySelector("[data-testid=giftcard-promo-valid]");
    expect(valid?.textContent).toContain(formatSek(1200));
    expect(valid?.querySelector("svg")).not.toBeNull();

    const preset = [...container.querySelectorAll("button")].find(
      (button) => button.getAttribute("aria-pressed") !== null && button.textContent?.includes("500"),
    );
    await act(async () => {
      preset!.click();
    });
    await settlePreview();
    expect(container.querySelector("[data-testid=giftcard-promo-valid]")?.textContent).toContain(formatSek(600));
    expect(container.querySelector("[data-testid=giftcard-promo-valid]")?.textContent).not.toContain(formatSek(1200));
    expect(container.querySelector("button[type=submit]")?.textContent).toContain(formatSek(500));
  });

  it("visar ett lugnt meddelande för en ogiltig kod och köpet går igenom utan koden", async () => {
    installFetch();
    const container = await renderForm();
    await openPromo(container);
    await setField(container, "gc-promo", "NOPE");
    await setField(container, "gc-bemail", "a@b.se");
    await settlePreview();
    expect(container.querySelector("[data-testid=giftcard-promo-invalid]")?.textContent).toContain("Koden stämmer inte.");

    await act(async () => {
      container.querySelector<HTMLFormElement>("form")!.requestSubmit();
    });
    const checkout = checkoutCalls();
    expect(checkout).toHaveLength(1);
    expect(checkout[0]?.body.promoCode).toBeUndefined();
    nominalFree(checkout[0]!.body, "1000");
    expect(container.querySelector("[data-testid=giftcard-promo-note]")?.textContent).toContain("Koden stämmer inte.");
  });

  it("lovar ingen bonus när valideringen är nere och köpet utan kod fungerar", async () => {
    endpointDown = true;
    installFetch();
    const container = await renderForm();
    await openPromo(container);
    await setField(container, "gc-promo", "Awesome2027");
    await setField(container, "gc-bemail", "a@b.se");
    await settlePreview();
    const status = container.querySelector("[data-testid=giftcard-promo-unreachable]");
    expect(status?.textContent).toContain(GIFT_CARD_PROMO_UNREACHABLE);
    expect(status?.textContent).not.toMatch(/20\s*%/);
    expect(status?.textContent).not.toContain(formatSek(1200));

    await act(async () => {
      container.querySelector<HTMLFormElement>("form")!.requestSubmit();
    });
    const checkout = checkoutCalls();
    expect(checkout).toHaveLength(1);
    expect(checkout[0]?.body).not.toHaveProperty("promoCode");
    nominalFree(checkout[0]!.body, "1000");
    expect(Object.keys(checkout[0]!.body).sort()).toEqual(["customerEmail", "metadata", "priceId", "quantity", "requestId", "returnUrl"]);
  });

  it("skickar koden och det betalda beloppet när förhandsvisningen är giltig", async () => {
    installFetch();
    const container = await renderForm();
    await openPromo(container);
    await setField(container, "gc-promo", "Awesome2027");
    await setField(container, "gc-bemail", "a@b.se");
    await settlePreview();
    await act(async () => {
      container.querySelector<HTMLFormElement>("form")!.requestSubmit();
    });
    const checkout = checkoutCalls();
    expect(checkout).toHaveLength(1);
    expect(checkout[0]?.body.promoCode).toBe("Awesome2027");
    nominalFree(checkout[0]!.body, "1000");
    expect(container.querySelector("[data-testid=giftcard-promo-note]")).toBeNull();
    expect(container.textContent).toContain(formatSek(1200));
    expect(container.textContent).toContain(formatSek(1000));
  });
});

describe("tacksida", () => {
  it("visar värdet bara när kvittot från servern finns", async () => {
    sessionStorage.setItem(
      GIFT_CARD_RECEIPT_STORAGE_KEY,
      JSON.stringify({ paidSek: 1000, valueSek: 1200, promoCode: "AWESOME2027", bonusPercent: 20 }),
    );
    const container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root!.render(createElement(GiftCardThanksValue));
    });
    expect(container.querySelector("[data-testid=giftcard-thanks-value]")?.textContent).toContain(formatSek(1200));
    expect(container.textContent).toContain(formatSek(1000));
  });
});
