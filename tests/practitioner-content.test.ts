import { existsSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import TreatmentsPage from "@/app/behandlingar-och-samtal/page";
import HomePage from "@/app/page";
import { GET } from "@/app/llms.txt/route";
import { offerGroup } from "@/lib/nav";
import { PORTRAITS } from "@/lib/people";
import { REBECCA } from "@/lib/rebecca";
import { SANDRA } from "@/lib/sandra";
import { businessJsonLd } from "@/lib/seo";
import { findCopyViolations } from "../scripts/copy-rules.mjs";

describe("healing och massage efter förfrågan", () => {
  it("visar aktuella priser från personernas data i kort och presentation", () => {
    const html = renderToStaticMarkup(createElement(TreatmentsPage));
    for (const person of [REBECCA, SANDRA]) {
      for (const option of person.options) {
        expect(html.split(`>${option.price}<`).length - 1).toBe(2);
        expect(html.split(option.label).length - 1).toBe(2);
      }
      expect(html).toContain(`href="${person.requestPath}"`);
    }
    expect(html).not.toMatch(/950 kr|750 kr|75 min|Sandra Kåwert|Lisa Dalwér|manuella-behandlingar/);
    expect(html).toContain("1 500 kr"); // Coachning och vägledning behåller sina priser.
    expect(html).toContain(SANDRA.intro);
    expect(html).toContain(SANDRA.description.replaceAll('"', "&quot;"));
    expect(html).toContain('alt="Sandra Bengts, friskvårdsmassör"');
    expect(existsSync(`public${PORTRAITS.sandra.src}`)).toBe(true);
  });

  it("länkar till Sandra från menyn och till båda formulären från startsidan", () => {
    expect(offerGroup.items.flatMap((item) => item.sections ?? [])).toContainEqual({
      href: "/behandlingar-och-samtal#massage", label: "Massage hos Sandra",
    });
    const html = renderToStaticMarkup(createElement(HomePage));
    expect(html).toContain("Healing hos Rebecca och massage hos Sandra bokas efter förfrågan.");
    expect(html).toContain(`href="${REBECCA.requestPath}"`);
    expect(html).toContain(`href="${SANDRA.requestPath}"`);
    expect(html).not.toContain("Healing, coachning och samtal");
  });

  it("publicerar alla fem alternativ under förfrågningar i llms.txt", async () => {
    const text = await GET().text();
    const inquiry = text.split("## Tjänster efter förfrågan")[1].split("## Medlemskap")[0];
    for (const person of [REBECCA, SANDRA]) {
      expect(inquiry).toContain(person.name);
      expect(inquiry).toContain(person.requestPath);
      for (const option of person.options) expect(inquiry).toContain(`${option.label}, ${option.price}`);
    }
    expect(inquiry).toContain(SANDRA.location);
    expect(inquiry).not.toMatch(/950 kr|750 kr|75 min/);
  });

  it("publicerar korrekta SEK-priser och förfrågningslänkar i JSON-LD", () => {
    const catalog = businessJsonLd()["@graph"][0].hasOfferCatalog;
    const offers = catalog!.itemListElement.filter((offer) => "price" in offer);
    expect(offers.map((offer) => offer.price)).toEqual([1050, 1550, 650, 550, 800]);
    for (const offer of offers) {
      expect(offer).toMatchObject({
        priceCurrency: "SEK",
        url: expect.stringMatching(/\/boka\/forfragan\/(rebecca|sandra)$/),
        itemOffered: { description: expect.stringContaining("Bokas efter förfrågan.") },
      });
      expect(offer.itemOffered).not.toHaveProperty("potentialAction");
    }
  });

  it("följer språkreglerna i datamodulerna", () => {
    for (const person of [REBECCA, SANDRA]) {
      const copy = [person.intro, person.service, ...person.options.map((o) => `${o.label}, ${o.price}`)];
      for (const text of copy) expect(findCopyViolations(text)).toEqual([]);
    }
    expect(findCopyViolations(SANDRA.description)).toEqual([]);
  });
});
