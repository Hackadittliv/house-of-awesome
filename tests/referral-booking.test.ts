// @vitest-environment happy-dom
import { act, createElement, Fragment, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ pathname: "/" }));
const stripe = vi.hoisted(() => ({ mount: vi.fn(), destroy: vi.fn(), create: vi.fn() }));
vi.mock("next/navigation", () => ({ usePathname: () => navigation.pathname, useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("@/lib/booking/config", async (original) => ({
  ...await original<typeof import("@/lib/booking/config")>(),
  liaSupabaseUrl: "https://backend.example.invalid", liaSupabaseAnonKey: "public-synthetic-key", stripePublishableKey: "pk_test_synthetic", bookingEnabled: true,
}));
vi.mock("@stripe/stripe-js", () => ({ loadStripe: async () => ({ createEmbeddedCheckoutPage: stripe.create }) }));

import { ReferralAccountLink } from "@/components/ReferralLink";
import { SiteHeader } from "@/components/SiteHeader";
import { AssessmentExperience } from "@/components/assessment/AssessmentExperience";
import { GiftCardForm } from "@/components/giftcard/GiftCardForm";
import { RequestForm } from "@/components/booking/RequestForm";
import { createStudionBooking } from "@/lib/booking/api";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { ASSESSMENT_ORIGIN, ASSESSMENT_TIMEOUT_MS } from "@/lib/assessment";
import { setReferralCode, readReferralCode } from "@/lib/referral";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const bookingId = "c2400000-0000-4000-8000-000000000001";
const bodies: { endpoint: string; body: Record<string, unknown> }[] = [];
let root: Root;
let container: HTMLDivElement;
let failCheckout: boolean;
let statusReply: () => Response;

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  delete (window as Window & { __hoaDocumentPath?: string }).__hoaDocumentPath;
  window.history.replaceState({}, "", "/?ref=laabcdefgh&email=private&access_token=private");
  bodies.length = 0;
  failCheckout = false;
  statusReply = () => Response.json({ enabled: true });
  (window as unknown as { happyDOM: { settings: { disableIframePageLoading: boolean } } }).happyDOM.settings.disableIframePageLoading = true;
  stripe.mount.mockClear(); stripe.destroy.mockClear();
  stripe.create.mockReset().mockImplementation(async ({ fetchClientSecret }: { fetchClientSecret: () => Promise<string> }) => {
    expect(await fetchClientSecret()).toBe("cs_secret_synthetic");
    return { mount: stripe.mount, destroy: stripe.destroy };
  });
  const reportError = console.error;
  vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    if (args[0] instanceof DOMException && args[0].message.endsWith("Iframe page loading is disabled.")) return;
    reportError(...args);
  });
  vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
    if (url.endsWith("/rest/v1/rpc/amb_reach_public_status")) {
      expect(init?.referrerPolicy).toBe("no-referrer");
      expect(init?.credentials).toBe("omit");
      expect(init?.body).toBe("{}");
      expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer public-synthetic-key");
      return statusReply();
    }
    expect(url.startsWith("https://backend.example.invalid/functions/v1/")).toBe(true);
    const endpoint = url.split("/").at(-1)!;
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    const bearer = body.event_type_slug === "studion-hyra" ? "instructor-synthetic" : "public-synthetic-key";
    expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer " + bearer);
    bodies.push({ endpoint, body });
    if (endpoint === "request-consultation") return Response.json({ ok: true });
    if (endpoint === "get-availability") return Response.json({ event_type: { slug: "synthetic-60", title_sv: "Syntetisk bokning", duration_minutes: 60, location_type: "in_person", requires_payment: true, price_id: "synthetic_price", phone_required: false }, slots: [{ start: "2030-01-02T10:00:00Z", end: "2030-01-02T11:00:00Z" }] });
    if (endpoint === "create-booking") return Response.json({ booking_id: bookingId, cancel_token: "SYNTHETIC-CANCEL-CAPABILITY", starts_at: "2030-01-02T10:00:00Z", ends_at: "2030-01-02T11:00:00Z", requires_payment: true, price_id: "synthetic_price" });
    if (endpoint === "create-checkout") return failCheckout ? Response.json({ error: "synthetic unavailable" }, { status: 503 }) : Response.json({ clientSecret: "cs_secret_synthetic" });
    throw new Error("Unexpected synthetic endpoint");
  }));
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  document.body.replaceChildren();
  window.localStorage.clear();
  window.sessionStorage.clear();
  vi.restoreAllMocks(); vi.unstubAllGlobals();
  vi.useRealTimers();
});

async function route(path: string, page?: ReactNode) {
  window.history.replaceState({}, "", path);
  navigation.pathname = window.location.pathname;
  await act(async () => root.render(createElement(Fragment, null,
    createElement(ReferralAccountLink), createElement(SiteHeader, { bookingHref: "/boka", menu: [{ label: "Behovsanalys", href: "/behovsanalys" }] }), page)));
}
async function click(text: string) {
  const button = [...container.querySelectorAll("button")].find((button) => button.textContent?.includes(text));
  expect(button).toBeTruthy();
  await act(async () => button!.click());
}
async function message(iframe: HTMLIFrameElement, data: Record<string, unknown>, origin = ASSESSMENT_ORIGIN, source?: MessageEventSource | null) {
  // No external document is loaded; provide the current frame identity locally.
  if (!iframe.contentWindow) Object.defineProperty(iframe, "contentWindow", { value: {} as Window });
  await act(async () => window.dispatchEvent(new MessageEvent("message", {
    origin, source: source === undefined ? iframe.contentWindow : source, data: { type: "lia:assessment", version: 1, flow: "personal", channel: new URL(iframe.src).searchParams.get("channel"), event: "complete", ...data },
  })));
}
async function openAssessment() {
  await route(window.location.pathname + window.location.search);
  expect(container.textContent).toContain("Se vilka tjänster du kan använda tipskoden för");
  await route("/tjanster?ref=LAABCDEFGH");
  const entry = [...container.querySelectorAll("a")].find((a) => a.textContent === "Behovsanalys");
  expect(entry?.getAttribute("href")).toBe("/behovsanalys?ref=LAABCDEFGH");
  await route(entry!.getAttribute("href")!, createElement(AssessmentExperience));
  await click("Min hälsa och återhämtning");
  const iframe = container.querySelector("iframe")!;
  expect(new URL(iframe.src).searchParams.get("ref")).toBe("LAABCDEFGH");
  return iframe;
}
async function fillBooking() {
  const ref = readReferralCode();
  await route("/boka/synthetic-60" + (ref ? `?ref=${ref}` : ""), createElement(BookingFlow, { slug: "synthetic-60", serviceName: "Syntetisk bokning", healthDeclaration: false }));
  await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="slot"]')!.click());
  await fillFields({ name: "Syntetisk Person", email: "synthetic@example.invalid" });
}

async function fillFields(values: Record<string, string>) {
  for (const [name, value] of Object.entries(values)) {
    const input = container.querySelector<HTMLInputElement>(`input[name="${name}"]`)!;
    await act(async () => {
      Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")!.set!.call(input, value);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }
}
async function submitBooking() {
  const choice = container.querySelector<HTMLInputElement>('input[name="confirm-referral"]');
  if (choice && !choice.checked) await act(async () => choice.click());
  await act(async () => container.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })));
}

describe("HOA till LIA-form och bokningskassa", () => {
  it.each(["LAABCDEFGH", "LA23456789", null])("skickar serverbekräftat val %s genom den verkliga komponentkedjan", async (acceptedReferralCode) => {
    const iframe = await openAssessment();
    await message(iframe, { acceptedReferralCode });
    expect(readReferralCode()).toBe(acceptedReferralCode);
    expect(container.querySelector("iframe")).toBe(iframe);
    await fillBooking();
    await submitBooking();
    expect(bodies.find(({ endpoint }) => endpoint === "create-booking")?.body).toMatchObject({ ...(acceptedReferralCode ? { ambassadorCode: acceptedReferralCode } : {}), guest_name: "Syntetisk Person", guest_email: "synthetic@example.invalid" });
    const checkout = bodies.find(({ endpoint }) => endpoint === "create-checkout")!.body;
    expect(checkout).toMatchObject({ ...(acceptedReferralCode ? { ambassadorCode: acceptedReferralCode } : {}), metadata: { booking_id: bookingId } });
    if (!acceptedReferralCode) expect(checkout).not.toHaveProperty("ambassadorCode");
    expect(checkout).not.toHaveProperty("cancel_token");
    expect(checkout.metadata).not.toHaveProperty("ambassadorCode");
    expect(stripe.mount).toHaveBeenCalledOnce();
    expect(window.localStorage.length).toBe(0);
    expect(new URLSearchParams(window.location.search).has("email")).toBe(false);
  });

  it("ignorerar falska, gamla och äldre kompletta meddelanden utan att byta kod", async () => {
    const iframe = await openAssessment();
    for (const data of [{ channel: "old", acceptedReferralCode: "LABCDEFGHJ" }, { flow: "equipment", acceptedReferralCode: null }, { acceptedReferralCode: "person@example.invalid" }, {}, { event: "ready", acceptedReferralCode: "LABCDEFGHJ" }]) {
      await message(iframe, data);
      expect(readReferralCode()).toBe("LAABCDEFGH");
    }
    await message(iframe, { acceptedReferralCode: "LABCDEFGHJ" }, "https://lifeisawesome.se.evil.example");
    await message(iframe, { acceptedReferralCode: null }, ASSESSMENT_ORIGIN, {} as Window);
    expect(readReferralCode()).toBe("LAABCDEFGH");
    await click("Byt inriktning");
    await click("Utrustning för hem eller verksamhet");
    const replacement = container.querySelector("iframe")!;
    expect(replacement).not.toBe(iframe);
    await message(iframe, { acceptedReferralCode: "LAABCDEFGL" });
    expect(readReferralCode()).toBe("LAABCDEFGH");
    await message(replacement, { flow: "equipment", acceptedReferralCode: "LAABCDEFGJ" });
    expect(readReferralCode()).toBe("LAABCDEFGJ");
  });

  it("återanvänder bokningens inskickade kod vid betalningsretry efter ett senare kodbyte", async () => {
    const iframe = await openAssessment();
    await message(iframe, { acceptedReferralCode: "LA23456789" });
    await fillBooking();
    failCheckout = true;
    await submitBooking();
    await act(async () => { setReferralCode("LAABCDEFGK"); });
    failCheckout = false;
    await submitBooking();
    expect(bodies.filter(({ endpoint }) => endpoint === "create-booking")).toHaveLength(1);
    expect(bodies.filter(({ endpoint }) => endpoint === "create-checkout").map(({ body }) => body.ambassadorCode)).toEqual(["LA23456789", "LA23456789"]);
    expect(readReferralCode()).toBe("LAABCDEFGK");
    expect(stripe.mount).toHaveBeenCalledOnce();
  });

  it.each(["LA23456789", null])("uppdaterar reservlänk och ny ram när bekräftat val ändras till %s", async (acceptedReferralCode) => {
    vi.useFakeTimers();
    const iframe = await openAssessment();
    await act(async () => { vi.advanceTimersByTime(ASSESSMENT_TIMEOUT_MS); });
    // A different completed form/tab can update the shared public choice while this frame is unavailable.
    await act(async () => { setReferralCode(acceptedReferralCode); });
    const fallback = [...container.querySelectorAll("a")].find((a) => a.textContent?.includes("Öppna formuläret"))!;
    expect(new URL(fallback.href).searchParams.get("ref")).toBe(acceptedReferralCode);
    await click("Försök igen");
    const replacement = container.querySelector("iframe")!;
    expect(replacement).not.toBe(iframe);
    expect(new URL(replacement.src).searchParams.get("ref")).toBe(acceptedReferralCode);
    await message(iframe, { acceptedReferralCode: "LAABCDEFGL" });
    expect(readReferralCode()).toBe(acceptedReferralCode);
  });

  it("skickar tipset med en manuell förfrågan efter information och med vald mottagarrutt", async () => {
    await route("/boka/forfragan/rebecca?ref=LAABCDEFGH", createElement(RequestForm, { serviceSlug: "healing-emht", serviceName: "Healing", route: "rebecca" }));
    expect(container.querySelector<HTMLButtonElement>('button[type="submit"]')?.disabled).toBe(true);
    await fillFields({ first_name: "Test", last_name: "Person", email: "synthetic@example.invalid", phone: "000000000" });
    await act(async () => container.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
    await submitBooking();
    expect(bodies).toEqual([{ endpoint: "request-consultation", body: expect.objectContaining({
      ambassadorCode: "LAABCDEFGH", route: "rebecca", site: "hoa", flow: "hoa_request", source_slug: "hoa:healing-emht",
      privacy_notice_acknowledged: true, email: "synthetic@example.invalid",
    }) }]);
  });

  it("skickar koden för köparen av ett presentkort utanför metadata och returlänk", async () => {
    await route("/butik?ref=LAABCDEFGH", createElement(GiftCardForm));
    await fillFields({ "gc-bname": "Köpare", "gc-bemail": "buyer@example.invalid" });
    await act(async () => container.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
    await fillFields({ "gc-rname": "Mottagare", "gc-remail": "recipient@example.invalid" });
    await submitBooking();
    expect(bodies).toEqual([{ endpoint: "create-checkout", body: expect.objectContaining({
      ambassadorCode: "LAABCDEFGH", priceId: "gift_card_custom", customerEmail: "buyer@example.invalid",
      metadata: expect.objectContaining({ recipient_email: "recipient@example.invalid" }),
    }) }]);
    expect(bodies[0].body.metadata).not.toHaveProperty("ambassadorCode");
    expect(bodies[0].body.returnUrl).not.toMatch(/ref=|LAABCDEFGH|example.invalid/);
  });

  it("skickar koden med en instruktörs egen autentiserade bokning", async () => {
    await createStudionBooking({ name: "Test", email: "instructor@example.invalid", startAt: "2030-01-02T10:00:00Z",
      notes: "", hours: 2, accessToken: "instructor-synthetic", ambassadorCode: "LAABCDEFGH" });
    expect(bodies[0]).toMatchObject({ endpoint: "create-booking", body: { ambassadorCode: "LAABCDEFGH", event_type_slug: "studion-hyra", site: "hoa" } });
    expect(bodies[0].body).not.toHaveProperty("accessToken");
  });

  it("utelämnar koden utan tipskontext och lånar inte Studions separata instruktörssession", async () => {
    window.sessionStorage.setItem("hoa-studion-session", JSON.stringify({ accessToken: "SYNTHETIC-STUDION-TOKEN", email: "instructor@example.invalid", expiresAt: Date.now() + 60_000 }));
    await route("/");
    await fillBooking();
    await submitBooking();
    expect(bodies.filter(({ endpoint }) => ["create-booking", "create-checkout"].includes(endpoint)).map(({ body }) => body.ambassadorCode)).toEqual([undefined, undefined]);
  });
});

describe("programmets offentliga status", () => {
  it.each(["paused","missing","invalid"] as const)("bevarar vanlig gästförfrågan utan tips- eller kontouppgifter vid %s", async mode => {
    statusReply = () => mode === "missing" ? new Response("", {status:404}) : Response.json({ enabled: mode === "paused" ? false : "true" });
    await route("/boka/forfragan?ref=LAABCDEFGH", createElement(RequestForm, { serviceSlug: "synthetic", serviceName: "Syntetisk", route: "rebecca" }));
    await act(async () => { window.dispatchEvent(new Event("focus")); });
    expect(readReferralCode()).toBeNull();
    expect(container.textContent).not.toContain("Har du ett LIA-konto");
    expect(container.querySelector('input[name="confirm-referral"]')).toBeNull();
    expect(container.querySelector('a[href*="LAABCDEFGH"]')).toBeNull();
    await fillFields({ first_name:"Test",last_name:"Person",email:"synthetic@example.invalid",phone:"000000000" });
    await act(async () => container.querySelector<HTMLInputElement>('input[type="checkbox"]')!.click());
    await submitBooking();
    const recorded = bodies.find(call => call.endpoint === "request-consultation");
    expect(recorded).toBeTruthy(); expect(recorded!.body).not.toHaveProperty("ambassadorCode");
  });
  it("låter samma gäst avstå en föreslagen tipskod medan programmet är aktivt", async () => {
    await route("/boka/forfragan?ref=LAABCDEFGH", createElement(RequestForm, { serviceSlug: "synthetic", serviceName: "Syntetisk", route: "rebecca" }));
    await act(async () => { window.dispatchEvent(new Event("focus")); });
    const checkbox=container.querySelector<HTMLInputElement>('input[name="confirm-referral"]');
    expect(checkbox?.checked).toBe(false);
    await fillFields({ first_name:"Test",last_name:"Person",email:"synthetic@example.invalid",phone:"000000000" });
    await act(async () => container.querySelector<HTMLInputElement>('input[required][type="checkbox"]')!.click());
    await act(async () => container.querySelector("form")!.dispatchEvent(new Event("submit",{bubbles:true,cancelable:true})));
    expect(bodies[0].body).not.toHaveProperty("ambassadorCode");
  });
});
