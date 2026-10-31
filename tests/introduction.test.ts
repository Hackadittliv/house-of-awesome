import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getRedirectUrl, unstable_getResponseFromNextConfig } from "next/experimental/testing/server";

import { INTRODUCTION_HREF, INTRODUCTION_SLUG } from "@/lib/booking/introduction";
import { getBookableServices, getInquiryServices, getService, getServices, servicesSnapshot } from "@/lib/content";
import { SHORT_CALL_SLUG } from "@/lib/links";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("introduktion före go-live", () => {
  it("är en tio minuters kostnadsfri samtalstjänst utan fabricerad snapshot-post", () => {
    expect(getService(INTRODUCTION_SLUG)).toMatchObject({
      name: "Kostnadsfri introduktion med Patrik", kind: "inquiry", category: "samtal",
      durationLabel: "10 minuter", bookable: false,
    });
    expect(getService(INTRODUCTION_SLUG)?.points).toContain("Gratis");
    expect(servicesSnapshot.services.some((event) => event.slug === INTRODUCTION_SLUG)).toBe(false);
  });

  it("är adresserbar i bokningen men saknas i tjänstelistor och tjänstesidornas statiska parametrar", async () => {
    for (const services of [getServices(), getBookableServices(), getInquiryServices()]) {
      expect(services.map((service) => service.slug)).not.toContain(INTRODUCTION_SLUG);
    }
    const booking = await import("@/app/boka/[slug]/page");
    const services = await import("@/app/tjanster/[slug]/page");
    expect(booking.generateStaticParams()).toContainEqual({ slug: INTRODUCTION_SLUG });
    expect(services.generateStaticParams()).not.toContainEqual({ slug: INTRODUCTION_SLUG });
  });

  it.each([false, true])("visar BookingUnavailable med bokningskonfiguration = %s", async (enabled) => {
    vi.stubEnv("NEXT_PUBLIC_LIA_SUPABASE_URL", enabled ? "http://127.0.0.1:54321" : "");
    vi.stubEnv("NEXT_PUBLIC_LIA_SUPABASE_ANON_KEY", enabled ? "local-test-only" : "");
    vi.resetModules();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { default: Page } = await import("@/app/boka/[slug]/page");
    const html = renderToStaticMarkup(await Page({ params: Promise.resolve({ slug: INTRODUCTION_SLUG }), searchParams: Promise.resolve({}) }));
    expect(html).toContain("Bokningen öppnar snart här");
    expect(html).toContain("Kontakta oss om introduktionen");
    expect(html).toContain('href="mailto:');
    expect(html).not.toContain(`lifeisawesome.se${INTRODUCTION_HREF}`);
    expect(html).not.toContain("<form");
    expect(html).not.toContain('role="alert"');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(["", "/", "?utm_source=test"])("undantar endast introduktionen från LIA-redirect: %s", async (suffix) => {
    vi.stubEnv("NEXT_PUBLIC_LIA_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_LIA_SUPABASE_ANON_KEY", "");
    vi.resetModules();
    const { default: nextConfig } = await import("../next.config");
    const response = await unstable_getResponseFromNextConfig({ url: `https://houseofawesome.se${INTRODUCTION_HREF}${suffix}`, nextConfig });
    expect(getRedirectUrl(response)).toBe(suffix === "/" ? `https://houseofawesome.se${INTRODUCTION_HREF}` : null);
    const existing = await unstable_getResponseFromNextConfig({ url: "https://houseofawesome.se/boka/forsta-halsosamtal", nextConfig });
    expect(getRedirectUrl(existing)).toContain("https://lifeisawesome.se/boka/forsta-halsosamtal");
    const similar = await unstable_getResponseFromNextConfig({ url: "https://houseofawesome.se/boka/kostnadsfri-introduktion-extra", nextConfig });
    expect(getRedirectUrl(similar)).toContain("https://lifeisawesome.se/boka/kostnadsfri-introduktion-extra");
  });

  it("behåller befintliga forsta-halsosamtal", () => {
    expect(SHORT_CALL_SLUG).toBe("forsta-halsosamtal");
    expect(getService(SHORT_CALL_SLUG)).toMatchObject({ bookable: true, durationMinutes: 10, priceLabel: "Gratis" });
    expect(servicesSnapshot.services.find((event) => event.slug === SHORT_CALL_SLUG)).toMatchObject({
      title_sv: "Kort samtal med Patrik", location_type: "meet", requires_payment: false,
    });
  });
});

describe("introduktionens LIA-kontrakt", () => {
  it.each([404, 409])("hanterar LIA-status %s utan kastat fel", async (status) => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ error: "Unavailable" }), { status })));
    const { getAvailability } = await import("@/lib/booking/api");
    await expect(getAvailability(INTRODUCTION_SLUG, "2026-11-02", "2026-11-08")).resolves.toEqual({ kind: "request_only" });
  });

  it("läser gratis Meet-tider och skapar bokning via LIA utan checkout-anrop", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ event_type: {
        slug: INTRODUCTION_SLUG, title_sv: "Kostnadsfri introduktion med Patrik", duration_minutes: 10,
        requires_payment: false, price_id: null, price_label_sv: "Gratis", location_type: "meet", phone_required: false,
      }, slots: [{ start: "2026-11-02T08:00:00Z", end: "2026-11-02T08:10:00Z" }] })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ booking_id: "local", requires_payment: false, price_id: null })));
    vi.stubGlobal("fetch", fetchMock);
    const { getAvailability, createBooking } = await import("@/lib/booking/api");
    const availability = await getAvailability(INTRODUCTION_SLUG, "2026-11-02", "2026-11-08");
    expect(availability).toMatchObject({ kind: "slots", eventType: { requires_payment: false, location_type: "meet" } });
    await expect(createBooking({ eventTypeSlug: INTRODUCTION_SLUG, startAt: "2026-11-02T08:00:00Z", name: "Lokalt test",
      email: "local@example.invalid", phone: "", notes: "", locationType: "meet", utm: {} })).resolves.toMatchObject({ requires_payment: false });
    expect(fetchMock.mock.calls.map(([url]) => String(url).split("/").pop())).toEqual(["get-availability", "create-booking"]);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toMatchObject({ event_type_slug: INTRODUCTION_SLUG, site: "hoa", location_type: "meet" });
  });
});
