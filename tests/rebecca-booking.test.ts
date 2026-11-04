import { readFileSync } from "node:fs";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

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

const slug = "healing-emht";
const originalEvents = [...servicesSnapshot.services];

// Testvärden, fristående från Rebeccas verkliga upplägg i LIA.
const eventFixture: LiaEventType = {
  slug,
  title_sv: "EMHT testupplägg",
  duration_minutes: 32,
  price_label_sv: "123 kr",
  location_type: "meet",
  requires_payment: false,
  sort_order: 19,
};

beforeEach(() => {
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
    servicesSnapshot.services.push({ ...eventFixture, slug: "inbody" });

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

  it("för tjänstens klinik vidare genom BookingFlow till båda API-anropen", () => {
    const page = readFileSync(new URL("../src/app/boka/[slug]/page.tsx", import.meta.url), "utf8");
    const flow = readFileSync(new URL("../src/components/booking/BookingFlow.tsx", import.meta.url), "utf8");
    const component = page.match(/<BookingFlow\b[\s\S]*?\/>/u)?.[0];

    expect(component).toContain("clinic={service.clinic}");
    expect(flow).toMatch(/function BookingFlow\(\{[^}]*\bclinic\b/u);
    expect(flow).toMatch(/getAvailability\(slug,\s*fromDate,\s*toDate,\s*clinic\)/u);
    expect(flow).toMatch(/createBooking\(\{[^}]*\bclinic\s*[,}]/u);
    expect(flow).toMatch(/const requestKey = `[^`]*\$\{clinic\s*\?\?\s*""\}/u);
    expect(flow).toMatch(/\},\s*\[[^\]]*\bclinic\b[^\]]*\]\);/u);
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
