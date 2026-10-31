import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { findCopyViolations } from "../scripts/copy-rules.mjs";
import faq from "../content/faq.json";
import HomePage, { metadata } from "@/app/page";
import { FACADE_SRC_SET, FACADE_WIDTHS } from "@/components/FacadeImage";
import { getService, getServices } from "@/lib/content";
import { SHORT_CALL_SLUG, bookingUrl } from "@/lib/links";
import { PORTRAITS } from "@/lib/people";
import { BUSINESS_ID, DEFAULT_OG_IMAGE, businessJsonLd, pageMetadata } from "@/lib/seo";

const html = renderToStaticMarkup(createElement(HomePage));

function decode(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function textOf(markup: string): string {
  return decode(markup.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

/** Attributvärde utan hänsyn till skiftläge, react-dom/server skriver till exempel srcSet och imageSrcSet. */
function attr(tag: string, name: string): string | undefined {
  const match = tag.match(new RegExp(`\\s${name}="([^"]*)"`, "i"));
  return match ? decode(match[1]) : undefined;
}

function section(id: string): string {
  const part = html.split(/(?=<section\b)/).find((chunk) => new RegExp(`^<section\\b[^>]*\\sid="${id}"`).test(chunk));
  if (!part) throw new Error(`Startsidan saknar sektionen ${id}`);
  return part;
}

function anchors(markup: string) {
  return [...markup.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map((m) => ({ href: attr(m[1], "href") ?? "", text: textOf(m[2]) }));
}

const text = textOf(html);
const links = anchors(html);

describe("startsidan", () => {
  it("har en enda h1 som välkomnar till huset", () => {
    const headings = html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/g) ?? [];
    expect(headings).toHaveLength(1);
    expect(textOf(headings[0] ?? "")).toBe("Välkommen till House of Awesome i Stora Höga");
  });

  it("har sektionerna i Lucas ordning", () => {
    const ids = [...html.matchAll(/<section\b[^>]*\sid="([^"]+)"/g)].map((m) => m[1]);
    expect(ids).toEqual(["valkommen", "mote-med-patrik", "om-huset", "utbud", "personerna", "event", "vanliga-fragor"]);
  });

  it("samlar Patrik och huset på ljust med ett mörkt samtalskort", () => {
    for (const id of ["mote-med-patrik", "om-huset", "personerna", "vanliga-fragor"]) {
      expect(section(id).match(/^<section\b[^>]*>/)?.[0]).toContain("hoa-surface-light");
    }
    for (const id of ["utbud", "event"]) {
      expect(section(id).match(/^<section\b[^>]*>/)?.[0]).toContain("hoa-surface-dark");
    }
    expect(section("mote-med-patrik").match(/<article\b[^>]*>/)?.[0]).toContain("hoa-surface-dark");
  });

  it("har den primära knappen i hero till det korta samtalet med Patrik", () => {
    const [primary, secondary] = anchors(section("valkommen"));
    expect(primary.href).toBe(bookingUrl(SHORT_CALL_SLUG, "home_hero"));
    expect(new URL(primary.href, "https://houseofawesome.se").pathname).toBe(`/boka/${SHORT_CALL_SLUG}`);
    expect(primary.text).toContain("Patrik");
    expect(secondary).toEqual({ href: bookingUrl(null, "home_hero"), text: "Boka behandling" });
  });

  it("visar fasaden i full bredd med srcset av 800, 1440 och 2400, alt och förladdning", () => {
    const img = html.match(/<img\b[^>]*house-of-awesome-fasad[^>]*>/)?.[0] ?? "";
    expect(attr(img, "srcset")).toBe(FACADE_SRC_SET);
    expect(FACADE_SRC_SET.split(", ").map((candidate) => candidate.split(" ")[1])).toEqual(["800w", "1440w", "2400w"]);
    expect(attr(img, "sizes")).toBe("100vw");
    expect(attr(img, "width")).toBe("2400");
    expect(attr(img, "height")).toBe("1666");
    expect(attr(img, "alt")).toMatch(/^Fasaden på House of Awesome i Stora Höga/);
    expect(attr(img, "fetchpriority")).toBe("high");
    expect(attr(img, "loading")).not.toBe("lazy");
    for (const width of FACADE_WIDTHS) {
      expect(existsSync(join("public/images", `house-of-awesome-fasad-${width}.webp`))).toBe(true);
    }

    const preloads = (html.match(/<link\b[^>]*rel="preload"[^>]*>/g) ?? []).filter((tag) => attr(tag, "as") === "image");
    const facade = preloads.find((tag) => attr(tag, "imagesrcset") === FACADE_SRC_SET);
    expect(facade, "förladdning av fasaden").toBeDefined();
    expect(attr(facade!, "imagesizes")).toBe("100vw");
    // React förladdar varje bild som inte är lazy, så fasaden ska vara den enda.
    expect(preloads, "bara fasaden förladdas").toHaveLength(1);
  });

  it("har Möte med Patrik med porträtt och ett kort som bokar samtalet", () => {
    const part = section("mote-med-patrik");
    expect(textOf(part)).toContain("Hälsa har blivit för krångligt. Vi gör det enkelt igen.");
    expect(textOf(part)).toContain("Kostnadsfritt samtal på 10 minuter med Patrik Nilsson Medgrundare av Life Is Awesome");
    expect(part).toContain(`alt="${PORTRAITS.patrik.alt}"`);
    expect(anchors(part)).toContainEqual({ href: bookingUrl(SHORT_CALL_SLUG, "home_patrik"), text: "Boka samtal med Patrik" });
  });

  it("har Om House of Awesome med knappen till /om och en länk till event och lokaler", () => {
    const part = section("om-huset");
    for (const title of ["En plats utöver det vanliga", "En plats för möten", "Vi står för platsen", "Vår vision"]) {
      expect(textOf(part)).toContain(title);
    }
    expect(anchors(part)).toContainEqual({ href: "/om", text: "Läs mer om huset" });
    expect(anchors(part).some((link) => link.href.startsWith("/event-och-lokaler"))).toBe(true);
  });

  it("visar Celloxy IHHT, tryckkammare och rödljus med bild och tjänstens text", () => {
    const part = section("utbud");
    for (const slug of ["ihht-50", "hbot-60", "redlight-20"]) expect(textOf(part)).toContain(getService(slug)?.lead);
    for (const file of ["celloxy-ihht.webp", "tryckkammare-hoa.webp", "rodljus.webp"]) expect(part).toContain(file);
    for (const href of ["/medlemskap", "/awesome-protocol", "/funktionsmedicin", "/behandlingar-och-samtal", "/tjanster/vitamindropp", "/tjanster/blodprov"]) {
      expect(anchors(part).map((link) => link.href)).toContain(href);
    }
    expect(anchors(part)).toContainEqual({ href: "/behandlingar-och-samtal", text: "Behandlingar och samtal" });
  });

  it("visar Lucas, Rebecca och Patrik med porträtt", () => {
    const part = section("personerna");
    for (const key of ["lucas", "rebecca", "patrik"] as const) expect(part).toContain(`alt="${PORTRAITS[key].alt}"`);
    expect(textOf(part)).not.toContain("Alexandra");
  });

  it("länkar till event och lokaler från event-sektionen", () => {
    expect(anchors(section("event")).map((link) => link.href)).toContain("/event-och-lokaler");
  });

  it("visar högst tre vanliga frågor från faq.json och länkar till /faq", () => {
    const part = section("vanliga-fragor");
    const questions = [...part.matchAll(/<summary\b[^>]*>([\s\S]*?)<\/summary>/g)].map((m) => textOf(m[1]).replace(/\s*\+$/, ""));
    expect(questions.length).toBeGreaterThan(0);
    expect(questions.length).toBeLessThanOrEqual(3);
    expect(html.match(/<details\b/g)).toHaveLength(questions.length);
    for (const question of questions) expect(faq.map((item) => item.question)).toContain(question);
    expect(anchors(part).map((link) => link.href)).toContain("/faq");
    // FAQPage finns redan på /faq och ska bara märkas upp på ett ställe.
    expect(html).not.toContain("FAQPage");
  });

  it("länkar varken till sidor som saknas på main eller till massage", () => {
    for (const { href } of links) expect(href).not.toMatch(/\/longevity-blodanalys|\/anne-wevers|massage/i);
    expect(text).not.toMatch(/massage/i);
  });

  it("länkar bara till sidor och ankare som finns", () => {
    const slugs = new Set(getServices().map((service) => service.slug));
    for (const { href } of links.filter((link) => link.href.startsWith("/"))) {
      const [path, hash] = href.split(/[?#]/);
      const file = join("src/app", path, "page.tsx");
      const exists = existsSync(file) || slugs.has(path.replace(/^\/tjanster\//, "")) || path.startsWith("/boka");
      expect(exists, href).toBe(true);
      if (hash && href.includes("#")) expect(readFileSync(file, "utf8"), href).toContain(`id="${hash}"`);
    }
  });

  it("har tagit bort rutnätet och Två enkla sätt att börja och behållit hundrutan", () => {
    expect(text).not.toContain("Allt samlat på ett ställe");
    expect(text).not.toContain("Två enkla sätt att börja");
    expect(text).toContain("Vi har en hund i huset.");
  });

  it("följer språkreglerna i text och alt texter", () => {
    const alts = [...html.matchAll(/\salt="([^"]*)"/g)].map((m) => decode(m[1])).filter(Boolean);
    for (const value of [text, ...alts]) expect(findCopyViolations(value)).toEqual([]);
    const banned = [
      /(?<!\p{L})men(?!\p{L})/iu,
      /(?<!\p{L})sjukt(?!\p{L})/iu,
      /på riktigt/iu,
      /klinik/iu,
      /protokoll/iu,
      /rödljusterapi/iu,
      /(?<!\p{L})xx/iu,
      /covid/iu,
      /öka din energi|ny energi|mer energi/iu,
      /självläkande/iu,
    ];
    for (const pattern of banned) expect(text).not.toMatch(pattern);
    expect((text.match(/(?<!\p{L})inte(?!\p{L})/giu) ?? []).length).toBeLessThanOrEqual(1);
  });
});

describe("delningsbild och strukturerad data", () => {
  it("använder fasaden som startsidans OG bild", () => {
    expect(existsSync("src/app/opengraph-image.jpg")).toBe(true);
    expect(existsSync("src/app/opengraph-image.tsx")).toBe(false);
    // Next lägger filens text oförändrad i og:image:alt, så filen ska sakna radbrytning.
    expect(readFileSync("src/app/opengraph-image.alt.txt", "utf8")).toBe(DEFAULT_OG_IMAGE.alt);
    // Startsidan och tjänsterna har egna opengraph-image filer i sina segment.
    expect(metadata.openGraph).not.toHaveProperty("images");
    expect(pageMetadata({ title: "Tjänst", description: "Text", path: "/tjanster/hbot-60", ownOgImage: true }).openGraph).not.toHaveProperty("images");
  });

  it("ger övriga sidor fasaden som standardbild", () => {
    expect(DEFAULT_OG_IMAGE.url).toBe("/opengraph-image.jpg");
    expect(pageMetadata({ title: "Om oss", description: "Text", path: "/om" }).openGraph?.images).toEqual([DEFAULT_OG_IMAGE]);
  });

  it("visar fasaden som verksamhetens bild i JSON-LD", () => {
    const business = businessJsonLd()["@graph"].find((node) => node["@id"] === BUSINESS_ID);
    const image = business && "image" in business ? business.image : undefined;
    expect(image).toMatch(/\/images\/house-of-awesome-fasad-2400\.webp$/);
    expect(existsSync(join("public", new URL(image!).pathname))).toBe(true);
  });
});
