import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import TreatmentPage from "@/app/behandlingar-och-samtal/page";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { findCopyViolations } from "../scripts/copy-rules.mjs";
import {
  formatDuration,
  getBookableServices,
  getInquiryServices,
  getService,
  getServices,
  servicesSnapshot,
  site,
} from "@/lib/content";
import { bookingUrl } from "@/lib/links";
import { REBECCA } from "@/lib/rebecca";
import { serviceJsonLd } from "@/lib/seo";
import type { LiaEventType } from "@/lib/types";

const bookingConfig = vi.hoisted(() => ({ bookingEnabled: true }));
vi.mock("@/lib/booking/config", () => bookingConfig);

const slug = "healing-emht";
const originalEvents = [...servicesSnapshot.services];

// Testvärden, fristående från Rebeccas verkliga upplägg i LIA.
const eventFixture: LiaEventType = {
  slug,
  clinic: "hoa",
  title_sv: "EMHT testupplägg",
  duration_minutes: 32,
  price_label_sv: "123 kr",
  location_type: "meet",
  requires_payment: false,
  sort_order: 19,
};

beforeEach(() => {
  bookingConfig.bookingEnabled = true;
  servicesSnapshot.services = originalEvents.filter((event) => event.slug !== slug);
});

afterEach(() => {
  servicesSnapshot.services = [...originalEvents];
});

describe("Rebeccas direktbokning", () => {
  it("har exakt en bokningsbar tjänst även innan LIA-snapshoten innehåller slugen", () => {
    expect(getService(slug)).toMatchObject({ slug, clinic: "hoa", kind: "bookable", bookable: true });
    expect(getServices().filter((service) => service.slug === slug)).toHaveLength(1);
    expect(getBookableServices().filter((service) => service.slug === slug)).toHaveLength(1);
    expect(getInquiryServices().map((service) => service.slug)).not.toContain(slug);
  });

  it("visar 45 minuter på plats för 950 kr även utan snapshotdata", () => {
    const service = getService(slug)!;
    expect(service.durationMinutes).toBe(45);
    expect(service.priceLabel).toBe("950 kr");
    expect(service.location).toBe("in_person");
    expect(service.shortName).toBe("Healing hos Rebecca");
    expect(service.lead).toContain("Healing 45 min på plats");
    expect(service.lead).toContain("950 kr, betalning på plats");
    expect(service.payment).toBe("on_site");
    expect(formatDuration(service)).toBe("45 minuter");
    expect(serviceJsonLd(service).areaServed).toBe(site.address.city);
    expect(new URL(serviceJsonLd(service).potentialAction!.target, site.url).pathname).toBe(REBECCA.requestPath);
  });

  it.each(["in_person", "meet", "phone"] as const)("använder LIA:s värden när snapshoten får upplägget %s", (locationType) => {
    servicesSnapshot.services.push({ ...eventFixture, location_type: locationType });

    const service = getService(slug)!;
    expect(service).toMatchObject({
      clinic: "hoa",
      bookable: true,
      kind: "bookable",
      durationMinutes: 32,
      priceLabel: "123 kr",
      location: locationType === "in_person" ? "in_person" : "digital",
    });
    expect(serviceJsonLd(service).areaServed).toBe(locationType === "in_person" ? site.address.city : "Sverige");
    expect(getServices().filter((item) => item.slug === slug)).toHaveLength(1);
    expect(getInquiryServices().map((item) => item.slug)).not.toContain(slug);
    const bookedSlugs = getBookableServices().map((item) => item.slug);
    expect(bookedSlugs.indexOf(slug)).toBeGreaterThan(bookedSlugs.indexOf("hbot-80"));
    expect(bookedSlugs.indexOf(slug)).toBeLessThan(bookedSlugs.indexOf("ihht-50"));
  });

  it("behåller förfrågningsflödet för andra tjänster som saknas i snapshoten", () => {
    servicesSnapshot.services = servicesSnapshot.services.filter((event) => event.slug !== "hbot-60");

    expect(getService("hbot-60")).toMatchObject({ kind: "inquiry", bookable: false, priceLabel: null, durationMinutes: null });
    expect(getBookableServices().map((service) => service.slug)).not.toContain("hbot-60");
    expect(getInquiryServices().filter((service) => service.slug === "hbot-60")).toHaveLength(1);
  });

  it("behåller tomt pris från en befintlig LIA-post", () => {
    servicesSnapshot.services.push({ ...eventFixture, price_label_sv: null });
    expect(getService(slug)!.priceLabel).toBeNull();
  });

  it("behåller uttryckliga förfrågningstjänster även om de finns i snapshoten", () => {
    servicesSnapshot.services.push({ ...eventFixture, slug: "inbody", clinic: "lia" });

    expect(getService("inbody")).toMatchObject({ kind: "inquiry", bookable: false, priceLabel: null, durationMinutes: null });
    expect(getBookableServices().map((service) => service.slug)).not.toContain("inbody");
    expect(getServices().filter((service) => service.slug === "inbody")).toHaveLength(1);
  });

  it("pekar Rebeccas CTA på samma slug som den lokala bokningen", () => {
    expect(REBECCA.requestPath).toBe("/boka/healing-emht");
    expect(REBECCA.cta).toBe("Boka healing 45 min på plats");
    expect(bookingUrl(slug, "rebecca", true)).toBe(REBECCA.requestPath);

    const page = readFileSync(new URL("../src/app/behandlingar-och-samtal/page.tsx", import.meta.url), "utf8");
    expect(page).toMatch(/<CtaLink\s+href=\{REBECCA\.requestPath\}[^>]*>\{REBECCA\.cta\}<\/CtaLink>/u);
  });

  it.each([true, false])("för Rebeccas alternativ och CTA genom bookingUrl, inbäddat: %s", (enabled) => {
    bookingConfig.bookingEnabled = enabled;
    const expected = (placement: string) => enabled
      ? "/boka/healing-emht"
      : `https://lifeisawesome.se/boka/healing-emht?clinic=hoa&utm_source=houseofawesome&utm_medium=referral&utm_campaign=hoa_site&utm_content=${placement}`;
    expect(REBECCA.options[0].href).toBe(expected("rebecca_option"));
    expect(REBECCA.requestPath).toBe(expected("rebecca"));
    expect(REBECCA.options.slice(1).map((option) => option.href)).toEqual([
      "/boka/forfragan/rebecca", "/boka/forfragan/rebecca",
    ]);

    const html = renderToStaticMarkup(createElement(TreatmentPage));
    const links = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gu)]
      .map((match) => ({ href: match[1].replaceAll("&amp;", "&"), text: match[2] }));
    expect(links).toContainEqual({ href: expected("rebecca_option"), text: REBECCA.options[0].label });
    expect(links).toContainEqual({ href: expected("rebecca"), text: REBECCA.cta });
  });

  it.each([undefined, null, "lia"])("använder reservvärden när EMHT bara finns i klinik %s", (clinic) => {
    servicesSnapshot.services.push({ ...eventFixture, clinic });
    expect(getService(slug)).toMatchObject({ clinic: "hoa", durationMinutes: 45, priceLabel: "950 kr", location: "in_person" });
  });

  it.each([false, true])("skiljer samma slug mellan kliniker oavsett ordning, omvänd: %s", (reverse) => {
    const events = [eventFixture, { ...eventFixture, clinic: "lia", duration_minutes: 99, price_label_sv: "99 kr", sort_order: -1 }];
    servicesSnapshot.services.push(...(reverse ? events.reverse() : events));
    expect(getService(slug)).toMatchObject({ clinic: "hoa", durationMinutes: 32, priceLabel: "123 kr" });
    const bookedSlugs = getBookableServices().map((service) => service.slug);
    expect(bookedSlugs.indexOf(slug)).toBeGreaterThan(bookedSlugs.indexOf("hbot-80"));
    expect(bookedSlugs.indexOf(slug)).toBeLessThan(bookedSlugs.indexOf("ihht-50"));
  });

  it.each([undefined, null, "lia"])("behåller standardklinikens HBOT med snapshotklinik %s", (clinic) => {
    const hbot = servicesSnapshot.services.find((event) => event.slug === "hbot-60")!;
    servicesSnapshot.services = servicesSnapshot.services.filter((event) => event.slug !== "hbot-60");
    servicesSnapshot.services.push({ ...hbot, clinic }, { ...hbot, clinic: "hoa", duration_minutes: 99, price_label_sv: "99 kr" });
    expect(getService("hbot-60")).toMatchObject({ durationMinutes: hbot.duration_minutes, bookable: true });
  });

  it("gör aldrig en LIA-tjänst bokningsbar med enbart HOA:s snapshotpost", () => {
    servicesSnapshot.services = servicesSnapshot.services.filter((event) => event.slug !== "hbot-60");
    servicesSnapshot.services.push({ ...eventFixture, slug: "hbot-60", clinic: "hoa" });
    expect(getService("hbot-60")).toMatchObject({ kind: "inquiry", bookable: false, priceLabel: null, durationMinutes: null });
  });

  it("leder distans och 75 minuter till Rebeccas förfrågningssida", () => {
    expect(REBECCA.options.map((option) => option.href)).toEqual([
      "/boka/healing-emht",
      "/boka/forfragan/rebecca",
      "/boka/forfragan/rebecca",
    ]);
    expect(REBECCA.inquiryPath).toBe("/boka/forfragan/rebecca");
    expect(REBECCA.options[0]).toMatchObject({ label: "Healing 45 min på plats", price: "950 kr" });
  });

  it("behåller reservsidans mottagarrutt och val av upplägg", () => {
    const page = readFileSync(new URL("../src/app/boka/forfragan/rebecca/page.tsx", import.meta.url), "utf8");
    const form = page.match(/<RequestForm\b[\s\S]*?\/>/u)?.[0];

    expect(form).toContain('serviceSlug="healing-emht"');
    expect(form).toContain('route="rebecca"');
    expect(form).toContain("options={REBECCA.options.map(");
    expect(REBECCA.options).toHaveLength(3);
    expect(page).toContain("mailto:${REBECCA.fallbackEmail}");
  });

  it("följer samtliga språkregler i den nya tjänstetexten och CTA:n", () => {
    const service = getService(slug)!;
    const copy = [service.name, service.shortName, service.lead, ...service.body, ...service.points, REBECCA.cta, REBECCA.inquiryCta].join(" ");

    expect(findCopyViolations(copy)).toEqual([]);
    expect(copy).not.toMatch(/(?<!\p{L})(sjukt|på\s+riktigt|men)(?!\p{L})/iu);
    expect(copy).not.toMatch(/(?<!\p{L})inte(?!\p{L})/iu);
  });
});
