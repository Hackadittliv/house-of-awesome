import { readFile, writeFile } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs/promises", () => ({ readFile: vi.fn(), writeFile: vi.fn() }));

const event = (duration: number) => ({
  slug: "shared",
  title_sv: "Testtjänst",
  duration_minutes: duration,
  price_label_sv: "950 kr",
  location_type: "in_person",
  requires_payment: false,
});

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubEnv("LIA_SUPABASE_URL", "http://127.0.0.1:54321/");
  vi.stubEnv("LIA_SUPABASE_ANON_KEY", "test-key");
  vi.mocked(readFile)
    .mockResolvedValueOnce(JSON.stringify([
      { slug: "shared", kind: "bookable" },
      { slug: "shared", clinic: "hoa", kind: "bookable" },
      { slug: "inquiry", kind: "inquiry" },
    ]))
    .mockResolvedValueOnce(JSON.stringify({ services: [
      { slug: "shared", clinic: "hoa", sort_order: 19 },
      { slug: "shared", sort_order: 2 },
    ] }));
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("synkning per klinik", () => {
  it("hämtar varje klinik separat och sparar rätt fakta och sortering för samma slug", async () => {
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({ event_type: event(10), slots: [] })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ event_type: event(45), slots: [] })));
    vi.stubGlobal("fetch", fetchMock);

    await import("../scripts/sync-services.mjs");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    for (const [index, [url, init]] of fetchMock.mock.calls.entries()) {
      expect(url).toBe("http://127.0.0.1:54321/functions/v1/get-availability");
      expect(init?.method).toBe("POST");
      expect(JSON.parse(String(init?.body))).toEqual({
        event_type_slug: "shared",
        from_date: expect.any(String),
        to_date: expect.any(String),
        ...(index === 1 ? { clinic_slug: "hoa" } : {}),
      });
    }
    expect(writeFile).toHaveBeenCalledTimes(1);
    const [target, data] = vi.mocked(writeFile).mock.calls[0];
    expect(String(target)).toMatch(/content\/services\.snapshot\.json$/u);
    expect(JSON.parse(String(data)).services).toEqual([
      { ...event(10), clinic: "lia", sort_order: 2 },
      { ...event(45), clinic: "hoa", sort_order: 19 },
    ]);
  });

  it("behåller snapshoten när en klinik saknar direktbokning", async () => {
    vi.stubGlobal("fetch", vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify({ event_type: event(10), slots: [] })))
      .mockResolvedValueOnce(new Response("{}", { status: 409 })));

    await expect(import("../scripts/sync-services.mjs")).rejects.toThrow("409 för hoa/shared");
    expect(writeFile).not.toHaveBeenCalled();
  });

  it("behåller snapshoten om LIA svarar med en annan tjänst", async () => {
    vi.stubGlobal("fetch", vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ event_type: { ...event(10), slug: "wrong" } }))));

    await expect(import("../scripts/sync-services.mjs")).rejects.toThrow("saknar tjänstefakta för lia/shared");
    expect(writeFile).not.toHaveBeenCalled();
  });
});
