// @vitest-environment happy-dom
import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BookingFlow } from "@/components/booking/BookingFlow";
import type { CustomerAccount } from "@/lib/booking/customer-account";

const member: CustomerAccount = { userId: "member", email: "member@example.invalid", accessToken: "member-test", expiresAt: Number.MAX_SAFE_INTEGER };
let account: CustomerAccount | null;
vi.mock("@/components/booking/CustomerAccountFlow", () => ({ CustomerAccountFlow: ({ children }: { children: (value: CustomerAccount | null) => ReactNode }) => children(account) }));
vi.mock("@/components/booking/ReferralChoice", () => ({ useReferralChoice: () => ({ field: null, accepted: null }) }));
vi.mock("@/components/booking/EmbeddedCheckout", () => ({ EmbeddedCheckout: () => createElement("div", { id: "checkout-open" }) }));
vi.mock("@/lib/booking/config", async original => ({ ...await original<object>(), liaSupabaseUrl: "https://backend.invalid", liaSupabaseAnonKey: "public-test", stripePublishableKey: "pk_test" }));
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let root: Root;
let container: HTMLDivElement;
let availableOre: number;
let payable: boolean;
let inquiryOnly: boolean;
let acceptCredit: boolean;
let quoteCalls: number;
let bookingCalls: number;
let checkoutBodies: Record<string, unknown>[];

beforeEach(() => {
  account = member;
  availableOre = 30000;
  payable = true;
  inquiryOnly = false;
  acceptCredit = true;
  quoteCalls = 0;
  bookingCalls = 0;
  checkoutBodies = [];
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
    const body = JSON.parse(String(init.body));
    const endpoint = url.split("/").at(-1);
    const slot = { start: "2030-01-03T11:00:00Z", end: "2030-01-03T11:20:00Z" };
    if (endpoint === "get-availability" && inquiryOnly) return Response.json({ error: "Förfrågan krävs" }, { status: 409 });
    if (endpoint === "get-availability") return Response.json({ event_type: { slug: "redlight-20", title_sv: "Rödljus", price_label_sv: "350 kr", duration_minutes: 20, location_type: "in_person", requires_payment: payable, price_id: payable ? "redlight" : null }, slots: [slot] });
    if (endpoint === "awesome-credit-quote") {
      expect(new Headers(init.headers).get("Authorization")).toBe("Bearer member-test");
      expect(body).toEqual({ clinicSlug: "lia", eventTypeSlug: "redlight-20" });
      quoteCalls++;
      if (availableOre === 0) return Response.json({ eligible: false });
      const appliedOre = Math.min(35000, availableOre);
      return Response.json({ priceOre: 35000, availableOre, appliedOre, remainingOre: 35000 - appliedOre, currency: "sek" });
    }
    if (endpoint === "create-booking") {
      bookingCalls++;
      return Response.json({ booking_id: "booking", starts_at: slot.start, cancel_token: "test", requires_payment: true, price_id: "redlight" });
    }
    if (endpoint === "create-checkout") {
      checkoutBodies.push(body);
      const credit = acceptCredit && body.useAwesomeCredit ? { appliedOre: body.expectedAwesomeCreditOre, remainingOre: 35000 - body.expectedAwesomeCreditOre } : undefined;
      return Response.json({ clientSecret: "local-test-session", awesomeCredit: credit });
    }
    throw new Error("Unrecognised request");
  }));
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

async function openForm() {
  await act(async () => root.render(createElement(BookingFlow, { slug: "redlight-20", serviceName: "Rödljus", healthDeclaration: false })));
  await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="slot"]')!.click());
}
const selectCredit = () => act(async () => container.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
const submit = () => act(async () => { container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })); });

describe("Awesome-kredit för en enskild behandling hos HOA", () => {
  it.each([[30000, 30000, 5000], [40000, 35000, 0]])("visar och skickar endast uttryckligen valt belopp med saldo %i öre", async (balance, applied, remaining) => {
    availableOre = balance;
    await openForm();
    expect(container.textContent).toContain(`Tillgängligt saldo: ${balance / 100} kr`);
    expect(container.textContent).toContain("Kvar att betala350 kr");
    await selectCredit();
    expect(container.textContent).toContain(`Vald Awesome-kredit${applied / 100} kr`);
    expect(container.textContent).toContain(`Kvar att betala${remaining / 100} kr`);
    await submit();
    expect(checkoutBodies).toHaveLength(1);
    expect(checkoutBodies[0]).toMatchObject({ useAwesomeCredit:true, expectedAwesomeCreditOre:applied, expectedBookingPriceOre:35000 });
    expect(container.querySelector("#checkout-open")).not.toBeNull();
  });

  it("behåller bokningen och kräver nytt godkännande om servern inte bekräftar avdraget", async () => {
    await openForm();
    await selectCredit();
    acceptCredit = false;
    availableOre = 10000;
    await submit();
    expect(container.querySelector("#checkout-open")).toBeNull();
    expect(quoteCalls).toBe(2);
    expect(container.textContent).toContain("Kvar att betala250 kr");
    expect(checkoutBodies).toHaveLength(1);
    acceptCredit = true;
    await submit();
    expect(bookingCalls).toBe(1);
    expect(checkoutBodies[1]).toMatchObject({ useAwesomeCredit:true, expectedAwesomeCreditOre:10000 });
    expect(container.querySelector("#checkout-open")).not.toBeNull();
  });

  it("öppnar aldrig en fullpriskassa i bakgrunden om krediten försvinner", async () => {
    await openForm();
    await selectCredit();
    acceptCredit = false;
    availableOre = 0;
    await submit();
    await submit();
    expect(checkoutBodies).toHaveLength(1);
    expect(container.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBe(true);
    expect(container.textContent).toContain("Det finns ingen Awesome-kredit att använda");
    expect(container.textContent).not.toContain("Kontrollera saldot igen");
    const ordinary = [...container.querySelectorAll("button")].find(button => button.textContent === "Välj ordinarie pris utan kredit")!;
    await act(async () => ordinary.click());
    await submit();
    expect(checkoutBodies[1]).not.toHaveProperty("useAwesomeCredit");
  });

  it("gör ingen kreditförfrågan för en behandling som bara kan beställas via förfrågan", async () => {
    inquiryOnly = true;
    await act(async () => root.render(createElement(BookingFlow, { slug: "redlight-20", serviceName: "Rödljus", healthDeclaration: false })));
    expect(container.textContent).toContain("Den här tjänsten bokas via förfrågan");
    expect(container.textContent).not.toContain("Awesome-kredit");
    expect(quoteCalls).toBe(0);
  });

  it.each(["gäst", "kostnadsfri tjänst", "tomt saldo", "avstår"])("bevarar vanlig bokning för %s", async scenario => {
    if (scenario === "gäst") account = null;
    if (scenario === "kostnadsfri tjänst") payable = false;
    if (scenario === "tomt saldo") availableOre = 0;
    await openForm();
    expect(quoteCalls).toBe(["avstår", "tomt saldo"].includes(scenario) ? 1 : 0);
    if (scenario !== "avstår") expect(container.querySelector('input[type="checkbox"]')).toBeNull();
    if (scenario === "avstår") {
      await submit();
      expect(checkoutBodies[0]).not.toHaveProperty("useAwesomeCredit");
      expect(checkoutBodies[0]).not.toHaveProperty("expectedBookingPriceOre");
    }
  });
});
