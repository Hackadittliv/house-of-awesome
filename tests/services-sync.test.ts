import { writeFile } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs/promises", () => ({ writeFile: vi.fn() }));

const event = (duration: number, sortOrder: number) => ({
  slug: "shared",
  title_sv: "Testtjänst",
  duration_minutes: duration,
  price_label_sv: "950 kr",
  location_type: "in_person",
  requires_payment: false,
  sort_order: sortOrder,
});

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv("LIA_SUPABASE_URL", "http://127.0.0.1:54321");
  vi.stubEnv("LIA_SUPABASE_ANON_KEY", "test-key");
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("REST-synkning med klinik", () => {
  it("hämtar publika aktiva tjänster med klinikens slug och behåller sort_order", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify([
      { ...event(10, 2), clinic: { slug: "lia" } },
      { ...event(45, 19), clinic: { slug: "hoa" } },
      { ...event(60, 30), slug: "ny-publik-tjanst", clinic: { slug: "hoa" } },
    ])));
    vi.stubGlobal("fetch", fetchMock);

    await import("../scripts/sync-services.mjs");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    const request = new URL(String(url));
    expect(request.origin).toBe("http://127.0.0.1:54321");
    expect(request.pathname).toBe("/rest/v1/booking_event_types");
    expect(Object.fromEntries(request.searchParams)).toEqual({
      select: "slug,title_sv,duration_minutes,price_label_sv,location_type,requires_payment,sort_order,clinic:booking_clinics(slug)",
      is_active: "eq.true",
      is_public: "eq.true",
      order: "sort_order",
    });
    expect(init).toEqual({ headers: { apikey: "test-key", Authorization: "Bearer test-key" } });
    expect(writeFile).toHaveBeenCalledTimes(1);
    const [target, data] = vi.mocked(writeFile).mock.calls[0];
    expect(String(target)).toMatch(/content\/services\.snapshot\.json$/u);
    expect(JSON.parse(String(data)).services).toEqual([
      { ...event(10, 2), clinic: "lia" },
      { ...event(45, 19), clinic: "hoa" },
      { ...event(60, 30), slug: "ny-publik-tjanst", clinic: "hoa" },
    ]);
  });

  it.each([null, undefined])("använder lia när klinikrelationen är %s", async (clinic) => {
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify([
      { ...event(10, 2), clinic },
    ]))));

    await import("../scripts/sync-services.mjs");

    expect(JSON.parse(String(vi.mocked(writeFile).mock.calls[0][1])).services).toEqual([
      { ...event(10, 2), clinic: "lia" },
    ]);
  });

  it("behåller snapshoten när REST-anropet misslyckas", async () => {
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(new Response("Otillgänglig", { status: 503 })));
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(process, "exit").mockImplementation(() => { throw new Error("process.exit(1)"); });

    await expect(import("../scripts/sync-services.mjs")).rejects.toThrow("process.exit(1)");
    expect(process.exit).toHaveBeenCalledWith(1);
    expect(writeFile).not.toHaveBeenCalled();
  });
});
