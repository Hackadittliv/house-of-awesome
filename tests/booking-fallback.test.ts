import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { BookingUnavailable } from "@/components/booking/BookingUnavailable";
import ServicePage from "@/app/tjanster/[slug]/page";
import { getBookableServices } from "@/lib/content";
import { bookingUrl, liaBookingUrl } from "@/lib/links";
import { serviceJsonLd } from "@/lib/seo";

vi.mock("@/lib/booking/config", () => ({ bookingEnabled: false }));

describe("klinik i reservlänkar", () => {
  it.each(getBookableServices())("$slug behåller klinik och UTM genom alla reservlänkar", (service) => {
    const expected = (placement: string) => `https://lifeisawesome.se/boka/${service.slug}?${service.slug === "healing-emht" ? "clinic=hoa&" : ""}utm_source=houseofawesome&utm_medium=referral&utm_campaign=hoa_site&utm_content=${placement}`;

    expect(liaBookingUrl(service.slug, "fallback")).toBe(expected("fallback"));
    expect(bookingUrl(service.slug, "fallback", false)).toBe(expected("fallback"));
    expect(bookingUrl(service.slug, "fallback", true)).toBe(`/boka/${service.slug}`);
    expect(serviceJsonLd(service).potentialAction?.target).toBe(expected("jsonld"));

    const html = renderToStaticMarkup(createElement(BookingUnavailable, { slug: service.slug }));
    const href = html.match(/href="([^"]+)"/u)?.[1].replaceAll("&amp;", "&");
    expect(href).toBe(expected("booking_fallback"));
  });

  it.each([null, "okand-tjanst"])("lägger ingen klinik på reservlänken för %s", (slug) => {
    const url = new URL(liaBookingUrl(slug, "fallback"));
    expect(url.searchParams.has("clinic")).toBe(false);
  });

  it.each([
    ["healing-emht", "Du bokar via Life Is Awesome och betalar på plats."],
    ["hbot-60", "Bokning och betalning sker hos Life Is Awesome, som driver House of Awesome."],
  ])("%s visar tjänstens betalningstext", async (slug, expected) => {
    const page = await ServicePage({ params: Promise.resolve({ slug }), searchParams: Promise.resolve({}) });
    const html = renderToStaticMarkup(page);
    expect(html).toContain(expected);
    if (slug === "healing-emht") expect(html).not.toContain("Bokning och betalning sker hos Life Is Awesome");
  });
});
