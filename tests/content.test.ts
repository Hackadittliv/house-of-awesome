import { describe, expect, it } from "vitest";

import servicesCopy from "../content/services.json";
import {
  formatPriceLabel,
  getBookableServices,
  getMemberships,
  getServices,
  servicesSnapshot,
} from "@/lib/content";

describe("tjänster", () => {
  it("visar alla publika tjänster från LIA:s ögonblicksbild", () => {
    const shown = new Set(getBookableServices().map((service) => service.slug));
    for (const event of servicesSnapshot.services) {
      expect(shown, `saknar HOA-text för ${event.slug} i content/services.json`).toContain(event.slug);
    }
  });

  it("har bara bokningsbara texter för tjänster som finns i LIA", () => {
    const live = new Set(servicesSnapshot.services.map((event) => event.slug));
    const bookableCopy = servicesCopy.filter((copy) => copy.kind === "bookable");
    for (const copy of bookableCopy) {
      expect(live, `${copy.slug} finns inte i LIA:s bokning`).toContain(copy.slug);
    }
  });

  it("har unika slugs", () => {
    const slugs = getServices().map((service) => service.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("har längd och pris från LIA för varje bokningsbar tjänst", () => {
    for (const service of getBookableServices()) {
      expect(service.durationMinutes).toBeGreaterThan(0);
      expect(service.priceLabel).toBeTruthy();
    }
  });

  it("har de fyra medlemskapen med pris", () => {
    const plans = getMemberships();
    expect(plans.map((plan) => plan.priceId)).toEqual([
      "hoa_gym_monthly",
      "hoa_longevity_monthly",
      "hoa_longevity_plus_monthly",
      "hoa_longevity_max_monthly",
    ]);
    for (const plan of plans) expect(plan.pricePerMonth).toBeGreaterThan(0);
  });
});

describe("formatPriceLabel", () => {
  it("skriver om klippkortspriser utan bindestreck", () => {
    expect(formatPriceLabel("Från 900 kr (10-kort), styckpris 1 000 kr")).toBe(
      "1 000 kr per gång, eller 900 kr per gång med klippkort för 10 gånger",
    );
  });

  it("lämnar enkla priser orörda", () => {
    expect(formatPriceLabel("Gratis")).toBe("Gratis");
    expect(formatPriceLabel("1 500 kr")).toBe("1 500 kr");
    expect(formatPriceLabel(null)).toBeNull();
  });

  it("tar bort bindestreck även i okända format", () => {
    expect(formatPriceLabel("400 kr med 5-kort")).toBe("400 kr med klippkort med 5 gånger");
  });
});
