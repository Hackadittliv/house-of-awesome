import { afterEach, describe, expect, it, vi } from "vitest";

import { requestConsultation, type RequestInput } from "@/lib/booking/api";
import { SANDRA } from "@/lib/sandra";

const base: RequestInput = {
  firstName: "Test",
  lastName: "Person",
  email: "test@example.com",
  phone: "0700000000",
  interestType: "other",
  message: "",
  sourceSlug: "hoa:healing-emht",
  honeypot: "",
  utm: {},
};

function captureBody() {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  return () => JSON.parse(String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body));
}

afterEach(() => vi.unstubAllGlobals());

describe("förfrågningens mottagare", () => {
  it("skickar route rebecca när den anges", async () => {
    const body = captureBody();
    await requestConsultation({ ...base, route: "rebecca" });
    expect(body().route).toBe("rebecca");
    expect(JSON.stringify(body())).not.toContain("@gmail.com");
  });

  it("utelämnar route för vanliga förfrågningar", async () => {
    const body = captureBody();
    await requestConsultation(base);
    expect(body()).not.toHaveProperty("route");
  });

  it("skickar Sandras tjänst och upplägg till husets standardmottagare", async () => {
    const body = captureBody();
    const message = "Tjänst: Svensk klassisk massage hos Sandra Bengts\n\nUpplägg: Svensk klassisk massage 50 min, 800 kr";
    await requestConsultation({ ...base, sourceSlug: `hoa:${SANDRA.serviceSlug}`, message });
    expect(body()).not.toHaveProperty("route");
    expect(body()).toMatchObject({ source_slug: "hoa:massage-sandra", message, interest_type: "other", flow: "hoa_request" });
  });
});
