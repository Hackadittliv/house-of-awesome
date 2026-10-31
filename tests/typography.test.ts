import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import ServicePage from "@/app/tjanster/[slug]/page";
import TjansterPage from "@/app/tjanster/page";
import { FaqList } from "@/components/FaqList";
import { HeadingText } from "@/components/HeadingText";
import { PageHeader } from "@/components/PageHeader";
import { Card, Hero, Section } from "@/components/v2/ui";
import { getServices } from "@/lib/content";
import { headingFit, headingParts, longestWordEm } from "@/lib/heading";

const css = readFileSync("src/app/globals.css", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

/** Alla regler som "väljare { deklarationer }", även inuti @layer och @media, med position. */
function rules(source: string) {
  return [...source.matchAll(/([^{};]+)\{([^{}]*)\}/g)].map((m) => ({
    selectors: m[1].split(",").map((s) => s.trim()),
    body: m[2],
    index: m.index ?? 0,
  }));
}

/** Hela blocket efter `head {`, med nästlade block. */
function block(head: string): string {
  const start = css.indexOf(`${head} {`);
  expect(start, head).toBeGreaterThanOrEqual(0);
  let depth = 0;
  for (let i = css.indexOf("{", start); i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}" && --depth === 0) return css.slice(start, i + 1);
  }
  throw new Error(`${head} saknar avslutning`);
}

/** Värdet på en egen egenskap i :root, utan blanksteg i början och slutet. */
function token(name: string): string {
  const value = css.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1];
  expect(value, name).toBeDefined();
  return value!.trim();
}

const rem = (name: string) => Number(token(name).match(/^([\d.]+)rem$/)?.[1]);

/** clamp(a, b + c vw, d) i px vid fönsterbredden w och rotstorleken root (16 px vid normal text). */
function scale(name: string, unit: "rem" | "px") {
  const m = token(name).match(new RegExp(`^clamp\\(([\\d.]+)${unit}, ([\\d.]+)${unit} \\+ ([\\d.]+)vw, ([\\d.]+)${unit}\\)$`));
  expect(m, `${name} som clamp() i ${unit}`).not.toBeNull();
  const [min, base, vw, max] = m!.slice(1).map(Number);
  const k = (root: number) => (unit === "rem" ? root : 1);
  return (w: number, root = 16) => Math.min(Math.max(min * k(root), base * k(root) + (vw * w) / 100), max * k(root));
}

function textOf(markup: string): string {
  return markup.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&");
}

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? files(path) : path.endsWith(".tsx") ? [path] : [];
  });
}

const HEADINGS = ["h1", "h2", "h3", "h4", "h5", "h6"];
const KEEP = "inline-block max-w-full [text-decoration:inherit]";
const BOOKING = [...files("src/app/boka"), ...files("src/app/avboka"), ...files("src/components/booking")];

describe("rubrikreglerna i globals.css", () => {
  it("saknar automatisk avstavning och nödbrytning", () => {
    expect(css).not.toMatch(/hyphens:\s*auto/);
    expect(css).not.toMatch(/overflow-wrap:\s*anywhere/);
    expect(css).not.toMatch(/word-break:\s*break-(all|word)/);
  });

  it("avstavar inga rubriker och balanserar raderna", () => {
    const rule = rules(css).find((r) => HEADINGS.every((h) => r.selectors.includes(h)) && /hyphens/.test(r.body));
    expect(rule, "en regel för h1 till h6 som sätter hyphens").toBeDefined();
    expect(rule!.body).toMatch(/hyphens:\s*(manual|none)/);
    expect(rule!.body).toMatch(/overflow-wrap:\s*normal/);
    expect(rule!.body).toMatch(/word-break:\s*normal/);
    expect(rule!.body).toMatch(/text-wrap:\s*balance/);
    for (const extra of ["summary", "button", ".font-display"]) expect(rule!.selectors).toContain(extra);
  });

  it("ger h1 och h2 utan --hoa-fit overflow-wrap: break-word som reserv, efter regeln utan ordbrytning", () => {
    const all = rules(css);
    const noBreak = all.find((r) => HEADINGS.every((h) => r.selectors.includes(h)) && /overflow-wrap:\s*normal/.test(r.body))!;
    const reserve = all.find((r) => r.selectors.join() === "h1,h2" && /overflow-wrap:\s*break-word/.test(r.body));
    expect(reserve, "en regel för just h1 och h2 med overflow-wrap: break-word").toBeDefined();
    // Samma lager och specificitet: den senare regeln vinner för en h1 eller h2 utan klass eller stil.
    const layer = css.indexOf("@layer base {");
    expect(layer).toBeGreaterThanOrEqual(0);
    expect(noBreak.index).toBeGreaterThan(layer);
    expect(reserve!.index).toBeGreaterThan(noBreak.index);
    expect(reserve!.index).toBeLessThan(css.indexOf("@layer components {"));
  });

  it("bryter bara ord med break-word i h1/h2-reserven och fit-reglerna, aldrig med avstavning", () => {
    for (const rule of rules(css).filter((r) => r.selectors.some((s) => /^(h[1-6]|summary|legend)\b/.test(s)))) {
      expect(rule.body).not.toMatch(/hyphens:\s*auto|overflow-wrap:\s*anywhere|word-break:\s*break/);
      if (/overflow-wrap:\s*break-word/.test(rule.body)) expect(rule.selectors).toEqual(["h1", "h2"]);
    }
    for (const utility of ["hoa-h1", "hoa-h2", "hoa-h2-prose", "hoa-fit-text"]) {
      expect(block(`@utility ${utility}`)).toMatch(/overflow-wrap:\s*break-word/);
    }
  });

  it.each(BOOKING.filter((file) => /<h[12]\b/.test(readFileSync(file, "utf8"))))(
    "%s: h1 och h2 saknar fit och omfattas av reserven",
    (file) => {
      for (const m of readFileSync(file, "utf8").matchAll(/<(h[12])\b([^>]*)>/g)) {
        expect(m[2], `${m[1]} i ${file}`).not.toMatch(/hoa-h[12]|hoa-fit|fitStyle|font-display|subheading|overflow-wrap|break-|hyphens|whitespace-nowrap/);
      }
    },
  );

  it("täcker bekräftelsevyns tre h2 i Confirmation.tsx", () => {
    const source = readFileSync("src/components/booking/Confirmation.tsx", "utf8");
    expect([...source.matchAll(/<h2 className="text-2xl text-hoa-ink md:text-3xl">/g)]).toHaveLength(3);
    expect(BOOKING).toContain(join("src/components/booking/Confirmation.tsx"));
  });

  it("skalar versalrubrikerna med clamp() och fit", () => {
    expect(css).toMatch(/--hoa-h1-size:\s*clamp\(/);
    expect(css).toMatch(/--hoa-h2-size:\s*clamp\(/);
    expect(css).toMatch(/min\(var\(--hoa-h1-size\),\s*100cqi \/ var\(--hoa-fit/);
  });

  it.each(["h1", "h2", "h2-prose"])("har skalan för hoa-%s även i px vid normal textstorlek", (name) => {
    const inRem = scale(`--hoa-${name}-size`, "rem");
    const inPx = scale(`--hoa-${name}-size-100`, "px");
    for (const w of [280, 320, 390, 430, 640, 1024, 1440, 1920]) expect(inPx(w)).toBeCloseTo(inRem(w, 16), 6);
  });

  it.each(["h1", "h2", "h2-prose"])("ger hoa-%s golv, storleken vid normal text och fit", (name) => {
    const body = block(`@utility hoa-${name}`).replace(/\s+/g, " ");
    expect(body).toContain(
      `max( var(--hoa-${name}-floor), min(var(--hoa-${name}-size-100), (100cqi + 2rem - 32px) / var(--hoa-fit, 0.01)), min(var(--hoa-${name}-size), 100cqi / var(--hoa-fit, 0.01)) )`,
    );
  });

  it("ger hoa-fit-text halva grundstorleken som golv", () => {
    expect(block("@utility hoa-fit-text").replace(/\s+/g, " ")).toContain(
      "max( var(--hoa-size) / 2, min(var(--hoa-size), (100cqi - var(--hoa-fit-offset, 0rem)) / var(--hoa-fit, 0.01)) )",
    );
  });
});

/**
 * Modell av fit-reglerna i en mobilcontainer med sidmarginalen 1rem per sida (Hero, Section,
 * PageHeader och Prose under 640 px): raden är w - 2rem. root är rotstorleken i px.
 */
function fitSize(name: "h1" | "h2" | "h2-prose", fit: number) {
  const floor = rem(`--hoa-${name}-floor`);
  const size = scale(`--hoa-${name}-size`, "rem");
  const normal = scale(`--hoa-${name}-size-100`, "px");
  return (w: number, root = 16) => {
    const line = w - 2 * root;
    return Math.max(floor * root, Math.min(normal(w), (line + 2 * root - 32) / fit), Math.min(size(w, root), line / fit));
  };
}

const ROOTS = [16, 17.6, 20, 24, 28, 32];
const WIDTHS = Array.from({ length: 56 }, (_, i) => 320 + i * 2);

describe("rubrikerna vid förstorad text", () => {
  it.each([
    ["h1", "Longevity-behandlingar"],
    ["h1", "Blodprovtagning"],
    ["h2", "Funktionsmedicin"],
    ["h2-prose", "Personuppgiftsansvarig"],
  ] as const)("hoa-%s med %s: ryms vid 320 till 430 px och blir aldrig mindre vid förstoring", (name, word) => {
    const fit = headingFit(word);
    const at = fitSize(name, fit);
    for (const w of WIDTHS) {
      // Vid normal textstorlek ryms längsta ordet på raden, så inget ord bryts.
      expect(at(w) * fit, `${word} vid ${w} px`).toBeLessThanOrEqual(w - 32 + 1e-9);
      for (const root of ROOTS) expect(at(w, root), `${word} vid ${w} px och ${root} px text`).toBeGreaterThanOrEqual(at(w) - 1e-9);
    }
  });

  it("låter LONGEVITY-BEHANDLINGAR växa vid 200 % text i stället för att krympa (390 px)", () => {
    const at = fitSize("h1", headingFit("Longevity-behandlingar"));
    expect(at(390)).toBeCloseTo(358 / headingFit("Longevity-behandlingar"), 6);
    expect(at(390, 32)).toBe(rem("--hoa-h1-floor") * 32);
    // Tidigare 23,06 px vid 200 % (codex-fyndet); nu större än vid normal text och än brödtexten.
    expect(at(390, 32)).toBeGreaterThan(at(390) * 1.4);
  });

  it("har golv som är högst skalornas minsta storlek, så att golvet aldrig gör en rubrik större vid normal text", () => {
    for (const name of ["h1", "h2", "h2-prose"] as const) expect(rem(`--hoa-${name}-floor`) * 16).toBeLessThanOrEqual(scale(`--hoa-${name}-size`, "rem")(320, 16));
  });

  it("har golv som vid 200 % text är minst brödtextens storlek, med h1 störst", () => {
    for (const name of ["h1", "h2", "h2-prose"] as const) expect(rem(`--hoa-${name}-floor`)).toBeGreaterThanOrEqual(1);
    expect(rem("--hoa-h1-floor")).toBeGreaterThan(rem("--hoa-h2-floor"));
  });
});

describe("tjänstesidan vid förstorad text", () => {
  const render = async (slug: string) =>
    renderToStaticMarkup(await ServicePage({ params: Promise.resolve({ slug }) } as Parameters<typeof ServicePage>[0]));

  it("låter pillren i Fler tjänster krympa till namnets längsta ord i stället för att svämma över", async () => {
    const html = await render("vitamindropp");
    const pills = [...html.matchAll(/<a class="(hoa-fit-text [^"]*rounded-full[^"]*)" style="--hoa-fit:\s*([\d.]+)" href="\/tjanster\/([^"]+)">/g)];
    expect(pills.map((p) => p[3])).toEqual(expect.arrayContaining(["blodprov", "funktionsmedicin"]));
    for (const [, cls, fit, slug] of pills) {
      expect(cls).toContain("[--hoa-size:0.875rem]");
      expect(cls).toContain("[--hoa-fit-offset:calc(2.5rem+2px)]");
      expect(cls).not.toMatch(/\btext-sm\b/);
      expect(Number(fit)).toBe(headingFit(getServices().find((s) => s.slug === slug)!.name, false));
    }
  });

  it("lägger punktlistans text i en flexpost med min-w-0, så att långa ord kan brytas", async () => {
    const html = await render("hbot-60");
    const points = [...html.matchAll(/<li class="flex gap-3 text-hoa-ink">([\s\S]*?)<\/li>/g)];
    expect(points.length).toBeGreaterThan(0);
    for (const [, inner] of points) expect(inner).toMatch(/<span class="min-w-0">[^<]+<\/span>$/);
    expect(html).toContain('<span class="min-w-0">Hälsodeklaration före första sessionen</span>');
  });
});

describe("bokningssidans h1 utan fit", () => {
  it("riktar regeln bara mot bokningssidans h1 med text-3xl", () => {
    const sources = files("src").filter((file) => /<h1\b[^>]*text-3xl/.test(readFileSync(file, "utf8")));
    expect(sources).toEqual([join("src/app/boka/[slug]/page.tsx")]);
    const rule = block("@media (width < 48rem)").replace(/\s+/g, " ");
    expect(rule).toContain(
      "h1.text-3xl { font-size: max( var(--hoa-h1-floor), min(30px, (100vw - 32px) / var(--hoa-service-fit)), min(1.875rem, (100vw - 2rem) / var(--hoa-service-fit)) ); }",
    );
  });

  it("räknar med tjänstenamnens längsta ord, så att alla namn ryms vid 320 px och normal text", () => {
    const serviceFit = Number(token("--hoa-service-fit"));
    for (const service of getServices()) expect(headingFit(service.name), service.name).toBeLessThanOrEqual(serviceFit);
    const at = (w: number, root = 16) =>
      Math.max(rem("--hoa-h1-floor") * root, Math.min(30, (w - 32) / serviceFit), Math.min(1.875 * root, (w - 2 * root) / serviceFit));
    for (const w of WIDTHS) {
      expect(at(w) * serviceFit).toBeLessThanOrEqual(w - 32 + 1e-9);
      for (const root of ROOTS) expect(at(w, root)).toBeGreaterThanOrEqual(at(w) - 1e-9);
    }
  });
});

describe("rubrikhjälparen", () => {
  it("håller ihop ord med bindestreck och snedstreck så länge de ryms, utan att ändra texten", () => {
    for (const title of ["Hela huset i ett Zazen Scalar-fält", "Longevity-gym dygnet runt", "24/7-klinik", "Osäker på vad som passar dig?"]) {
      const html = renderToStaticMarkup(createElement(HeadingText, { text: title }));
      expect(textOf(html)).toBe(title);
      expect(html).not.toContain("\u2011");
    }
    const html = renderToStaticMarkup(createElement(HeadingText, { text: "Hela huset i ett Zazen Scalar-fält" }));
    // Inline-block med högst rubrikens bredd: en rad när ordet ryms, bryts i stället för att svämma
    // över när det inte gör det. whitespace-nowrap stänger av overflow-wrap och används inte.
    expect(html).toContain(`<span class="${KEEP}">Scalar-fält</span>`);
    expect(html).not.toContain("whitespace-nowrap");
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
      expect(html).toContain(`<span class="${KEEP}">Longevity-behandlingar</span>`);
    }
  });

  it("gör /tjanster:s delsektioner till containrar och sätter --hoa-fit på deras h2", () => {
    const html = renderToStaticMarkup(createElement(TjansterPage));
    for (const [id, title] of [["boka-direkt", "Boka direkt"], ["efter-forfragan", "Efter förfrågan"]]) {
      expect(html).toMatch(new RegExp(`<section aria-labelledby="${id}" class="@container[^"]*">\\s*<h2 id="${id}" class="hoa-h2[^"]*" style="--hoa-fit:\\s*${headingFit(title)}">${title}</h2>`));
    }
  });
});
