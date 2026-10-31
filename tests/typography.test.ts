import { readFileSync } from "node:fs";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FaqList } from "@/components/FaqList";
import { HeadingText } from "@/components/HeadingText";
import { PageHeader } from "@/components/PageHeader";
import { Card, Hero, Section } from "@/components/v2/ui";
import { headingFit, headingParts, longestWordEm } from "@/lib/heading";

const css = readFileSync("src/app/globals.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

/** Alla regler som "väljare { deklarationer }", även inuti @layer och @media. */
function rules(source: string) {
  return [...source.matchAll(/([^{};]+)\{([^{}]*)\}/g)].map((m) => ({
    selectors: m[1].split(",").map((s) => s.trim()),
    body: m[2],
  }));
}

function textOf(markup: string): string {
  return markup.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&");
}

const HEADINGS = ["h1", "h2", "h3", "h4", "h5", "h6"];

describe("rubrikreglerna i globals.css", () => {
  it("saknar automatisk avstavning och nödbrytning", () => {
    expect(css).not.toMatch(/hyphens:\s*auto/);
    expect(css).not.toMatch(/overflow-wrap:\s*anywhere/);
    expect(css).not.toMatch(/word-break:\s*break-(all|word)/);
  });

  it("låter inga rubriker brytas inne i ord och balanserar raderna", () => {
    const rule = rules(css).find((r) => HEADINGS.every((h) => r.selectors.includes(h)) && /hyphens/.test(r.body));
    expect(rule, "en regel för h1 till h6 som sätter hyphens").toBeDefined();
    expect(rule!.body).toMatch(/hyphens:\s*(manual|none)/);
    expect(rule!.body).toMatch(/overflow-wrap:\s*normal/);
    expect(rule!.body).toMatch(/word-break:\s*normal/);
    expect(rule!.body).toMatch(/text-wrap:\s*balance/);
    for (const extra of ["summary", "button", ".font-display"]) expect(rule!.selectors).toContain(extra);
  });

  it("ger ingen rubrikregel overflow-wrap eller hyphens som bryter ord", () => {
    for (const rule of rules(css).filter((r) => r.selectors.some((s) => /^(h[1-6]|summary|legend)\b/.test(s)))) {
      expect(rule.body).not.toMatch(/hyphens:\s*auto|overflow-wrap:\s*(anywhere|break-word)|word-break:\s*break/);
    }
  });

  it("skalar versalrubrikerna med clamp() och fit", () => {
    expect(css).toMatch(/--hoa-h1-size:\s*clamp\(/);
    expect(css).toMatch(/--hoa-h2-size:\s*clamp\(/);
    expect(css).toMatch(/min\(var\(--hoa-h1-size\),\s*100cqi \/ var\(--hoa-fit/);
  });
});

describe("rubrikhjälparen", () => {
  it("håller ihop ord med bindestreck och snedstreck utan att ändra texten", () => {
    for (const title of ["Hela huset i ett Zazen Scalar-fält", "Longevity-gym dygnet runt", "24/7-klinik", "Osäker på vad som passar dig?"]) {
      const html = renderToStaticMarkup(createElement(HeadingText, { text: title }));
      expect(textOf(html)).toBe(title);
      expect(html).not.toContain("\u2011");
    }
    const html = renderToStaticMarkup(createElement(HeadingText, { text: "Hela huset i ett Zazen Scalar-fält" }));
    expect(html).toContain('<span class="whitespace-nowrap">Scalar-fält</span>');
    expect(headingParts("Rödljus + PEMF").filter((p) => p.keep)).toEqual([]);
  });

  // Uppmätt i Chrome: Plus Jakarta Sans 700, versaler, letter-spacing -0,02em.
  it.each([
    ["Longevity-behandlingar", 13.832],
    ["Personuppgiftsansvarig", 13.811],
    ["Blodprovtagning", 9.947],
    ["Funktionsmedicin", 9.792],
    ["Integritetspolicy", 9.663],
    ["Scalar-fält", 6.702],
  ])("underskattar aldrig bredden på %s", (word, measured) => {
    expect(longestWordEm(word)).toBeGreaterThanOrEqual(measured);
    expect(headingFit(word)).toBeLessThan(measured * 1.1);
  });

  it("räknar bara det längsta ordet", () => {
    expect(longestWordEm("Hela huset i ett Zazen Scalar-fält")).toBe(longestWordEm("Scalar-fält"));
  });

  it("låter korttitlar och FAQ-frågor krympa för långa ord i stället för att brytas", () => {
    expect(css).toMatch(/\.hoa-card\s*\{[^}]*container-type:\s*inline-size/);
    const card = renderToStaticMarkup(createElement(Card, { title: "Partnerboenden i närområdet" }));
    expect(card).toMatch(/<h3 class="hoa-fit-text[^"]*" style="--hoa-fit:\s*[\d.]+">/);
    const faq = renderToStaticMarkup(createElement(FaqList, { items: [{ id: "x", question: "Behöver jag fylla i en hälsodeklaration?", answer: "Ja." }], heading: "h2" }));
    expect(faq).toMatch(/<details class="group @container">/);
    expect(faq).toMatch(/<h2 class="hoa-fit-text[^"]*" style="--hoa-fit:\s*[\d.]+">/);
    // Normal skiftläge räknas med gemenernas bredd, inte som versaler.
    expect(headingFit("hälsodeklaration?", false)).toBeLessThan(headingFit("hälsodeklaration?"));
    expect(longestWordEm("hälsodeklaration?", false)).toBeGreaterThanOrEqual(8.466);
  });

  it("sätter --hoa-fit och container i Hero, Section och PageHeader", () => {
    const pages = [
      renderToStaticMarkup(createElement(Hero, { title: "Longevity-behandlingar" })),
      renderToStaticMarkup(createElement(Section, { title: "Longevity-behandlingar" })),
      renderToStaticMarkup(createElement(PageHeader, { title: "Longevity-behandlingar", lead: "Text" })),
    ];
    for (const html of pages) {
      expect(html).toMatch(/class="@container[^"]*"/);
      expect(html).toMatch(/<h[12] class="hoa-h[12][^"]*" style="--hoa-fit:\s*1[45]\.\d+"/);
      expect(html).toContain('<span class="whitespace-nowrap">Longevity-behandlingar</span>');
    }
  });
});
