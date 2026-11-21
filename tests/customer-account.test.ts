import { afterEach, describe, expect, it, vi } from "vitest";
import { createBooking, createCheckout, createGiftCardCheckout, requestConsultation } from "@/lib/booking/api";
import { customerToken, signInCustomer } from "@/lib/booking/customer-account";

vi.mock("@/lib/booking/config", async original => ({ ...await original<object>(), liaSupabaseUrl: "https://local.invalid", liaSupabaseAnonKey: "synthetic-public" }));
const email = "buyer@cross-site.invalid";
const goodUser = { id: "c2400000-0000-4000-8000-000000000001", email, email_confirmed_at: "2026-01-01", is_anonymous: false };
const token = "synthetic-buyer-only";
afterEach(() => vi.unstubAllGlobals());

describe("frivilligt LIA-konto i HOA:s vanliga formulär", () => {
  it.each([null, { ...goodUser, email_confirmed_at: null }, { ...goodUser, is_anonymous: true }])("kräver en bekräftad köpare hos Auth", async user => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ access_token: token, user, expires_in: 300 })));
    await expect(signInCustomer(email, "synthetic-only")).rejects.toThrow();
  });

  it("binder egen e-post och skickar endast köparens bearer till bokning, kassa, förfrågan och presentkort", async () => {
    const seen: { endpoint: string; auth: string | null; body: Record<string, unknown> }[] = [];
    vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
      const endpoint = new URL(url).pathname.split("/").pop()!;
      const body = JSON.parse(String(init.body));
      if (endpoint === "token") {
        expect(url).toBe("https://local.invalid/auth/v1/token?grant_type=password");
        expect(init.cache).toBe("no-store"); expect(init.referrerPolicy).toBe("no-referrer");
        return Response.json({ user: goodUser, access_token: token, expires_in: 300, refresh_token: "unused" });
      }
      seen.push({ endpoint, auth: new Headers(init.headers).get("authorization"), body });
      return Response.json({ clientSecret: "local", ok: true, booking_id: "local" });
    }));
    const account = await signInCustomer(email, "fixture-password");
    expect(customerToken(null, email)).toBeUndefined();
    expect(() => customerToken(account, "someone-else@example.invalid")).toThrow();
    expect(() => customerToken({ ...account, expiresAt: 0 }, email)).toThrow();
    const bookingId="c2400000-0000-4000-8000-000000000099";
    await createBooking({ account, email, name: "Test", phone:"", notes:"", eventTypeSlug: "synthetic", locationType:"in_person", startAt:"2030-01-02T10:00:00Z", utm:{} });
    await createCheckout({ account, email, bookingId, priceId: "test", returnUrl: "https://houseofawesome.se/boka/tack" });
    await requestConsultation({ account, email, firstName:"Test", lastName:"Kund", phone:"0700000000", message:"", sourceSlug:null, interestType:"other", honeypot:"", utm:{} });
    await createGiftCardCheckout({ account, email, metadata:{ gift_card_amount_sek:"1000", purchaser_name:"Test", purchaser_email:email }, returnUrl:"https://houseofawesome.se/presentkort/tack" });
    expect(seen.map(r => r.endpoint)).toEqual(["create-booking", "create-checkout", "request-consultation", "create-checkout"]);
    for (const call of seen) {
      expect(call.auth).toBe("Bearer " + token);
      expect(JSON.stringify(call.body)).not.toContain(token);
      expect(call.body).not.toHaveProperty("userId");
      expect(call.body).not.toHaveProperty("ambassadorCode");
    }
  });
});
