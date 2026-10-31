import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import BesokPage from "@/app/besok/page";
import FaqPage from "@/app/faq/page";
import LongevityResorPage from "@/app/longevity-resor/page";
import MedlemskapPage from "@/app/medlemskap/page";
import HomePage from "@/app/page";
import TjansterPage from "@/app/tjanster/page";
import { ServiceCard } from "@/components/ServiceCard";
import { Card } from "@/components/v2/ui";
import { getServices } from "@/lib/content";

const render = (component: () => React.ReactNode) => renderToStaticMarkup(createElement(component));

// Kortytor: sidorna (utom bokningen) och kortkomponenterna. Sidhuvudets meny och
// samtyckesbannern är ingen kortyta och ingår inte.
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return /^(boka|avboka)$/.test(name) ? [] : files(path);
    return path.endsWith(".tsx") ? [path] : [];
  });
}
const cardSurfaces = [...files("src/app"), ...files("src/components/v2"), "src/components/ServiceCard.tsx", "src/components/FaqList.tsx"];

/** Alla strängar i filen, även klasslistor i konstanter som cardClass. */
function classStrings(source: string): string[] {
  return [...source.matchAll(/"([^"\n]*)"|`([^`]*)`/g)].map((m) => m[1] ?? m[2]);
}

/** Elementen direkt under roten, i ordning, med JSON-LD som tomma script. */
function topLevel(html: string): string[] {
  const source = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "<script></script>");
  const tags: string[] = [];
  let depth = 0;
  for (const m of source.matchAll(/<(\/?)([a-z][a-z0-9]*)\b[^>]*?(\/?)>/g)) {
    if (m[1]) depth--;
    else {
      if (depth === 0) tags.push(m[0]);
      if (!m[3]) depth++;
    }
  }
  return tags;
}

describe("kortregeln", () => {
  it.each(cardSurfaces)("%s har inga mörka tonade kort eller inramade bilder", (file) => {
    for (const cls of classStrings(readFileSync(file, "utf8"))) {
      const box = /\brounded-(xl|2xl|3xl|lia)\b/.test(cls);
      expect(box && /\bbg-hoa-(secondary|card)\b/.test(cls), `mörk kortbox: ${cls}`).toBe(false);
      expect(/\bborder-hoa-gold\/\d+/.test(cls) && /\b(aspect-|overflow-hidden)/.test(cls), `bild med egen ram: ${cls}`).toBe(false);
    }
  });

  it("ger Card ytans kortstil och bilden kant i kant utan ram", () => {
    const html = renderToStaticMarkup(createElement(Card, { title: "Tryckkammare", text: "Text", image: { src: "/images/rodljus.webp", alt: "Rödljus" } }));
    expect(html.match(/<article\b[^>]*>/)?.[0]).toContain("hoa-card");
    const media = html.match(/<div class="([^"]*)"[^>]*>\s*<img/)?.[1] ?? "";
    expect(media).toBe("hoa-card-media");
  });

  it("låter tjänstekortet följa kortregeln med en titel som är minst 44 px hög", () => {
    const html = renderToStaticMarkup(createElement(ServiceCard, { service: getServices()[0], placement: "test" }));
    expect(html.match(/<article\b[^>]*>/)?.[0]).toContain("hoa-card");
    expect(html).not.toMatch(/bg-hoa-secondary|border-hoa-gold\/20/);
    expect(html.match(/<h3\b[^>]*>\s*<a\b[^>]*>/)?.[0]).toContain("min-h-11");
  });

  it("lägger framhävda mörka kort bara i ljusa band", () => {
    for (const page of [HomePage, MedlemskapPage, LongevityResorPage]) {
      const html = render(page);
      const islands = [...html.matchAll(/<article\b[^>]*hoa-surface-dark[^>]*>/g)];
      expect(islands.length).toBeGreaterThan(0);
      for (const island of islands) {
        const section = html.slice(html.lastIndexOf("<section", island.index), html.indexOf(">", html.lastIndexOf("<section", island.index)) + 1);
        expect(section, island[0]).toContain("hoa-surface-light");
      }
    }
  });

  it("visar hundnotisen som en rad utan box", () => {
    const html = render(HomePage);
    const note = [...html.matchAll(/<p\b([^>]*)>(?:(?!<\/p>)[\s\S])*Vi har en hund i huset\./g)][0];
    expect(note, "hundnotisen").toBeDefined();
    expect(note[1]).not.toMatch(/rounded|border|bg-/);
  });

  it.each([
    ["/tjanster", TjansterPage],
    ["/besok", BesokPage],
    ["/faq", FaqPage],
  ])("%s har korten på ett krämband som avslutar main", (_, page) => {
    const elements = topLevel(render(page)).filter((tag) => !tag.startsWith("<script"));
    expect(elements.at(-1)).toMatch(/^<section\b[^>]*hoa-surface-light/);
  });
});
