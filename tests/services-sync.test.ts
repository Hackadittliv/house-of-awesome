import { writeFile } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("node:fs/promises", () => ({ writeFile: vi.fn() }));

const event = (duration: number, slug = "shared") => ({
  slug,
  title_sv: "Testtjänst",
  description_sv: "LIA:s beskrivning",
  duration_minutes: duration,
  price_label_sv: "950 kr",
  inquiry_only: false,
  image_url: null,
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

describe("RPC-synkning med klinik", () => {
  it.each(["", "/"])("hämtar båda klinikerna och normaliserar URL med suffix '%s'", async (suffix) => {
    vi.stubEnv("LIA_SUPABASE_URL", `http://127.0.0.1:54321${suffix}`);
    const fetchMock = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify([event(10)])))
      .mockResolvedValueOnce(new Response(JSON.stringify([event(45), event(60, "annan-tjanst")])));
    vi.stubGlobal("fetch", fetchMock);

    await import("../scripts/sync-services.mjs");

    expect(fetchMock.mock.calls).toEqual(["lia", "hoa"].map((clinic) => [
      "http://127.0.0.1:54321/rest/v1/rpc/list_public_booking_event_types",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: "test-key", Authorization: "Bearer test-key" },
        body: JSON.stringify({ p_clinic_slug: clinic }),
      },
    ]));
    expect(writeFile).toHaveBeenCalledTimes(1);
    const [target, data] = vi.mocked(writeFile).mock.calls[0];
    expect(String(target)).toMatch(/content\/services\.snapshot\.json$/u);
    const snapshot = JSON.parse(String(data));
    expect(snapshot.source).toContain("list_public_booking_event_types för lia och hoa");
    expect(snapshot.services).toEqual([
      { clinic: "lia", slug: "shared", title_sv: "Testtjänst", duration_minutes: 10, price_label_sv: "950 kr", inquiry_only: false, image_url: null, sort_order: 0 },
      { clinic: "hoa", slug: "shared", title_sv: "Testtjänst", duration_minutes: 45, price_label_sv: "950 kr", inquiry_only: false, image_url: null, sort_order: 0 },
      { clinic: "hoa", slug: "annan-tjanst", title_sv: "Testtjänst", duration_minutes: 60, price_label_sv: "950 kr", inquiry_only: false, image_url: null, sort_order: 1 },
    ]);
  });

  it("behåller en tom klinik separat från den andra klinikens tjänster", async () => {
    vi.stubGlobal("fetch", vi.fn<typeof fetch>()
      .mockResolvedValueOnce(new Response("[]"))
      .mockResolvedValueOnce(new Response(JSON.stringify([event(45, "healing-emht")]))));

    await import("../scripts/sync-services.mjs");

    expect(JSON.parse(String(vi.mocked(writeFile).mock.calls[0][1])).services).toMatchObject([
      { slug: "healing-emht", clinic: "hoa", sort_order: 0 },
    ]);
  });

  it.each(["lia", "hoa"])("behåller snapshoten när RPC-anropet för %s misslyckas", async (clinic) => {
    const fetchMock = vi.fn<typeof fetch>();
    if (clinic === "hoa") fetchMock.mockResolvedValueOnce(new Response(JSON.stringify([event(10)])));
    fetchMock.mockResolvedValueOnce(new Response("Otillgänglig", { status: 503 }));
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(process, "exit").mockImplementation(() => { throw new Error("process.exit(1)"); });

    await expect(import("../scripts/sync-services.mjs")).rejects.toThrow("process.exit(1)");
    expect(process.exit).toHaveBeenCalledWith(1);
    expect(writeFile).not.toHaveBeenCalled();
  });
});
