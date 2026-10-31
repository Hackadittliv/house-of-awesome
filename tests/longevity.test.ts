import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import AnnePage, { metadata as anneMetadata } from "@/app/anne-wevers/page";
import BlodanalysPage, { metadata as blodanalysMetadata } from "@/app/longevity-blodanalys/page";
import ForetagPage, { metadata as foretagMetadata } from "@/app/halsostrategi-for-foretag/page";
import sitemap from "@/app/sitemap";
import { Disclaimer } from "@/components/Disclaimer";
import { getService, HEALTH_DISCLAIMER, longevity, servicesSnapshot } from "@/lib/content";
import { bookingUrl, SHORT_CALL_SLUG } from "@/lib/links";
import { LONGEVITY_PUBLISHED, longevityRobots } from "@/lib/longevity";
import { aboutNav, getAboutNav, getMainMenu, getOfferGroup, isGroup, mainMenu, offerGroup } from "@/lib/nav";
import { PORTRAITS } from "@/lib/people";
import { getSitemap } from "@/lib/sitemap";
import { findCopyViolations } from "../scripts/copy-rules.mjs";

const bookingConfig = vi.hoisted(() => ({ enabled: false }));
vi.mock("@/lib/booking/config", () => ({ get bookingEnabled() { return bookingConfig.enabled; } }));
afterEach(() => { bookingConfig.enabled = false; });

const pages = [
  { content: longevity.anne, Page: AnnePage, metadata: anneMetadata, placement: "anne" },
  { content: longevity.blodanalys, Page: BlodanalysPage, metadata: blodanalysMetadata, placement: "blodanalys" },
  { content: longevity.foretag, Page: ForetagPage, metadata: foretagMetadata, placement: "foretag" },
];
const escaped = (text: string) => renderToStaticMarkup(createElement("span", null, text)).slice(6, -7);

describe.each(pages)("longevity: $content.path", ({ content, Page, metadata, placement }) => {
  const html = renderToStaticMarkup(createElement(Page));

  it("renderar alla granskade innehållsblock utan omskrivning", () => {
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    const texts = [content.h1, content.eyebrow, content.lead, content.cta.heading, content.cta.text,
      ...content.sections.flatMap((section) => [section.heading, ...section.body ?? [], ...section.points ?? [],
        ...section.bodyAfter ?? [], ...[...section.steps ?? [], ...section.items ?? []].flatMap((item) => [item.title, item.text])])];
    for (const text of texts) expect(html).toContain(escaped(text));
    for (const section of content.sections) expect(html).toContain(`id="${section.id}"`);
  });

  it("har friskrivningen och följer copyreglerna", () => {
    expect(html).toContain(escaped(content.disclaimer));
    expect(content.disclaimer).toContain("vård");
    expect(findCopyViolations(html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " "))).toEqual([]);
  });

  it("har v2-rubriker och en h2 per innehållsblock inklusive avslutet", () => {
    const h1 = html.match(/<h1\b[^>]*class="([^"]+)"/);
    expect(h1?.[1].split(" ")).toEqual(expect.arrayContaining(["text-4xl", "md:text-6xl"]));
    const h2s = [...html.matchAll(/<h2\b[^>]*class="([^"]+)"/g)];
    expect(h2s).toHaveLength(content.sections.length + 1);
    for (const h2 of h2s) expect(h2[1].split(" ")).toEqual(expect.arrayContaining(["text-3xl", "md:text-4xl"]));
    for (const section of content.sections) expect(html).toContain(`id="${section.id}-rubrik"`);
    expect(html).toMatch(/<section\b[^>]*id="boka-samtal"/);
    expect(html).toContain('id="boka-samtal-rubrik"');
    expect(html).not.toMatch(/<div class="max-w-3xl space-y-4 leading-7[^"]*"><\/div>/);
  });

  it("har obandat avslut före SharedBottom och inga två band i följd", () => {
    const sections = [...html.matchAll(/<section\b[^>]*class="([^"]+)"/g)];
    expect(sections).toHaveLength(content.sections.length + 2);
    const bands = sections.map((section) => section[1].includes("bg-hoa-secondary/"));
    // SharedBottom (bandad) följer direkt efter avslutet i layouten.
    expect(bands.at(-1)).toBe(false);
    expect(bands.at(-2)).toBe(true);
    for (let index = 1; index < bands.length; index++) expect(bands[index] && bands[index - 1]).toBe(false);
  });

  it.each([false, true])("bokar kort samtal med bokning aktiverad = %s", (enabled) => {
    bookingConfig.enabled = enabled;
    const rendered = renderToStaticMarkup(createElement(Page));
    const ctas = [...rendered.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>Boka kort samtal med Patrik<\/a>/g)];
    expect(ctas).toHaveLength(2);
    for (const [index, position] of ["hero", "cta"].entries()) {
      const href = ctas[index][1].replaceAll("&amp;", "&");
      expect(href).toBe(bookingUrl(SHORT_CALL_SLUG, `${placement}_${position}`, enabled));
      const url = new URL(href, "https://houseofawesome.se");
      expect(url.pathname).toBe("/boka/forsta-halsosamtal");
      if (!enabled) {
        expect(url.origin).toBe("https://lifeisawesome.se");
        expect(url.searchParams.get("utm_content")).toBe(`${placement}_${position}`);
      }
    }
  });

  it("länkar till båda andra sidorna", () => {
    expect(content.links.map((link) => link.href).sort()).toEqual(pages.map(({ content: other }) => other.path).filter((path) => path !== content.path).sort());
    for (const link of content.links) {
      expect(html).toContain(`href="${link.href}"`);
      expect(html).toContain(escaped(link.label));
    }
  });

  it("använder granskad metadata och brödsmulor", () => {
    expect(metadata.title).toBe(content.title);
    expect(metadata.description).toBe(content.metaDescription);
    expect(metadata.alternates?.canonical).toBe(content.path);
    expect(metadata.robots).toEqual(longevityRobots(LONGEVITY_PUBLISHED));
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).toContain(content.path);
  });
});

describe.each([false, true])("publicering = %s", (published) => {
  it("styr alla tre utbudslänkarna och huvudmenyn utan att röra övriga länkar", () => {
    const menu = getMainMenu(published);
    const paths = menu.flatMap((entry) => isGroup(entry) ? entry.items.map((item) => item.href) : [entry.href]);
    const offers = getOfferGroup(published).items.map((item) => item.href);
    for (const { content } of pages) {
      expect(paths.includes(content.path)).toBe(published);
      expect(offers.includes(content.path)).toBe(published);
    }
    expect(paths).toContain("/longevity-behandlingar");
    expect(paths).toContain("/funktionsmedicin");
    const pagePaths = pages.map(({ content }) => content.path);
    const otherLinks = (enabled: boolean) => getMainMenu(enabled).map((entry) => isGroup(entry)
      ? { ...entry, items: entry.items.filter((item) => !pagePaths.includes(item.href)) }
      : entry);
    expect(otherLinks(published)).toEqual(otherLinks(!published));
  });

  it("styr Anne i sidfoten och bevarar övriga sidfotslänkar", () => {
    const nav = getAboutNav(published);
    expect(nav.some((item) => item.href === longevity.anne.path)).toBe(published);
    expect(nav.filter((item) => item.href !== longevity.anne.path)).toEqual(getAboutNav(false));
  });

  it("styr sitemap och bevarar övriga sidor och tjänster", () => {
    const entries = getSitemap(published);
    const paths = entries.map((entry) => new URL(entry.url).pathname);
    for (const { content } of pages) expect(paths.includes(content.path)).toBe(published);
    const pagePaths = pages.map(({ content }) => content.path);
    expect(entries.filter((entry) => !pagePaths.includes(new URL(entry.url).pathname))).toEqual(getSitemap(false));
    expect(paths).toContain("/tjanster/forsta-halsosamtal");
  });

  it("tar bort robotsbegränsningarna endast vid publicering", () => {
    expect(longevityRobots(published)).toEqual(published ? undefined : { index: false, follow: false, noimageindex: true });
  });
});

it("använder samma publiceringsflagga i faktisk meny, sidfot och sitemap", () => {
  expect(mainMenu).toEqual(getMainMenu(LONGEVITY_PUBLISHED));
  expect(offerGroup).toEqual(getOfferGroup(LONGEVITY_PUBLISHED));
  expect(aboutNav).toEqual(getAboutNav(LONGEVITY_PUBLISHED));
  expect(sitemap()).toEqual(getSitemap(LONGEVITY_PUBLISHED));
});

it("visar Anne med svensk alt-text i befintlig Avatar", () => {
  const html = renderToStaticMarkup(createElement(AnnePage));
  expect(html).toContain(escaped(PORTRAITS.anne.alt));
  expect(html).toContain(encodeURIComponent(PORTRAITS.anne.src));
  expect(html).toContain("rounded-full");
});

it("bevarar standardfriskrivningen på befintliga sidor", () => {
  expect(renderToStaticMarkup(createElement(Disclaimer))).toContain(escaped(HEALTH_DISCLAIMER));
});

it("använder befintliga kostnadsfria Meet-samtalet på tio minuter", () => {
  expect(getService(SHORT_CALL_SLUG)).toMatchObject({ bookable: true, durationMinutes: 10, priceLabel: "Gratis" });
  expect(servicesSnapshot.services.find((service) => service.slug === SHORT_CALL_SLUG)).toMatchObject({
    title_sv: "Kort samtal med Patrik", location_type: "meet", requires_payment: false,
  });
});

function filesIn(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  });
}

it("saknar den borttagna tjänsten i källkod, innehåll, tester och bokningssidor", async () => {
  const removedSlug = ["kostnadsfri", "introduktion"].join("-");
  for (const path of ["src", "content", "tests"].flatMap(filesIn)) {
    expect(readFileSync(path, "utf8"), path).not.toContain(removedSlug);
  }
  expect(getService(removedSlug)).toBeUndefined();
  const { generateStaticParams } = await import("@/app/boka/[slug]/page");
  expect(generateStaticParams()).not.toContainEqual({ slug: removedSlug });
});
