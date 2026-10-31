import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AnnePage, { generateMetadata as anneMetadata } from "@/app/anne-wevers/page";
import BlodanalysPage, { generateMetadata as blodanalysMetadata } from "@/app/longevity-blodanalys/page";
import ForetagPage, { generateMetadata as foretagMetadata } from "@/app/halsostrategi-for-foretag/page";
import { GET as getPortrait } from "@/app/portratt/anne-wevers/route";
import sitemap from "@/app/sitemap";
import { Disclaimer } from "@/components/Disclaimer";
import { getService, HEALTH_DISCLAIMER, servicesSnapshot } from "@/lib/content";
import { bookingUrl, SHORT_CALL_SLUG } from "@/lib/links";
import { isLongevityBlocked, LONGEVITY_PUBLISHED, longevityRobots } from "@/lib/longevity";
import { longevity } from "@/lib/longevity-content";
import { aboutNav, getAboutNav, getMainMenu, getOfferGroup, isGroup, mainMenu, offerGroup } from "@/lib/nav";
import { PORTRAITS } from "@/lib/people";
import { pageMetadata } from "@/lib/seo";
import { getSitemap } from "@/lib/sitemap";
import { findCopyViolations } from "../scripts/copy-rules.mjs";

const bookingConfig = vi.hoisted(() => ({ enabled: false }));
vi.mock("@/lib/booking/config", () => ({ get bookingEnabled() { return bookingConfig.enabled; } }));
beforeEach(() => {
  vi.stubEnv("CONTEXT", "deploy-preview");
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("LONGEVITY_PREVIEW", undefined);
});
afterEach(() => {
  bookingConfig.enabled = false;
  vi.unstubAllEnvs();
});

const pages = [
  { content: longevity.anne, Page: AnnePage, metadata: anneMetadata, placement: "anne" },
  { content: longevity.blodanalys, Page: BlodanalysPage, metadata: blodanalysMetadata, placement: "blodanalys" },
  { content: longevity.foretag, Page: ForetagPage, metadata: foretagMetadata, placement: "foretag" },
];
const escaped = (text: string) => renderToStaticMarkup(createElement("span", null, text)).slice(6, -7);

type AccessCase = { name: string; context?: string; nodeEnv?: string; preview?: string; blocked: boolean };
const environments: AccessCase[] = [
  { name: "produktion", context: "production", nodeEnv: "production", blocked: true },
  { name: "produktionsbygge utan CONTEXT", nodeEnv: "production", blocked: true },
  { name: "tom CONTEXT", context: "", nodeEnv: "production", blocked: true },
  { name: "okänd CONTEXT", context: "staging", nodeEnv: "production", blocked: true },
  { name: "felstavad preview", context: "Deploy-preview", nodeEnv: "production", blocked: true },
  { name: "test utan preview", nodeEnv: "test", blocked: true },
  { name: "saknad miljö", blocked: true },
  { name: "tom miljö", context: "", nodeEnv: "", preview: "", blocked: true },
  { name: "lokal flagga 0", nodeEnv: "production", preview: "0", blocked: true },
  { name: "lokal flagga true", nodeEnv: "production", preview: "true", blocked: true },
  { name: "deploy-preview", context: "deploy-preview", nodeEnv: "production", blocked: false },
  { name: "branch-deploy", context: "branch-deploy", nodeEnv: "production", blocked: false },
  { name: "lokal utveckling", nodeEnv: "development", blocked: false },
  { name: "development med produktionskontext", context: "production", nodeEnv: "development", blocked: false },
  { name: "uttrycklig lokal preview", nodeEnv: "production", preview: "1", blocked: false },
  { name: "lokal flagga med produktionskontext", context: "production", nodeEnv: "production", preview: "1", blocked: false },
];

function setEnvironment({ context, nodeEnv, preview }: AccessCase) {
  vi.stubEnv("CONTEXT", context);
  vi.stubEnv("NODE_ENV", nodeEnv);
  vi.stubEnv("LONGEVITY_PREVIEW", preview);
}

describe.each(pages)("longevity: $content.path", ({ content, Page, metadata, placement }) => {
  let html: string;
  beforeEach(() => { html = renderToStaticMarkup(createElement(Page)); });

  it.each(environments)("skyddar både sida och metadata: $name", (environment) => {
    setEnvironment(environment);
    if (environment.blocked) {
      expect(() => renderToStaticMarkup(createElement(Page))).toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
      expect(() => metadata()).toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    } else {
      expect(renderToStaticMarkup(createElement(Page))).toContain(escaped(content.h1));
      expect(metadata()).toEqual({
        ...pageMetadata({ title: content.title, description: content.metaDescription, path: content.path }),
        robots: { index: false, follow: false, noimageindex: true },
      });
    }
  });

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
    const h1 = html.match(/<h1\b[^>]*class="([^"]+)"[^>]*>/);
    expect(h1?.[1].split(" ")).toContain("hoa-h1");
    expect(h1?.[0]).toMatch(/style="--hoa-fit:[\d.]+"/);
    const h2s = [...html.matchAll(/<h2\b[^>]*class="([^"]+)"[^>]*>/g)];
    expect(h2s).toHaveLength(content.sections.length + 1);
    for (const h2 of h2s) {
      expect(h2[1].split(" ")).toContain("hoa-h2");
      expect(h2[0]).toMatch(/style="--hoa-fit:[\d.]+"/);
    }
    const blocks = [...html.matchAll(/<section\b([^>]*)>([\s\S]*?)<\/section>/g)];
    for (const id of [...content.sections.map((section) => section.id), "boka-samtal"]) {
      const block = blocks.find((section) => section[1].includes(`id="${id}"`));
      expect(block, id).toBeDefined();
      expect(block![2].match(/<h2\b/g), id).toHaveLength(1);
      expect(block![2]).toContain(`id="${id}-rubrik"`);
      expect(block![2]).toMatch(/<div\b[^>]*class="@container\b[^>]*>\s*<h2\b/);
    }
    // Prose börjar med @container; spärren får inte bero på första klassen.
    const emptyDivs = [...html.matchAll(/<div\b[^>]*class="([^"]*)"[^>]*>\s*<\/div>/g)];
    for (const div of emptyDivs) {
      expect(["max-w-3xl", "space-y-4", "leading-7"].every((cls) => div[1].split(" ").includes(cls)), "tom Prose").toBe(false);
    }
  });

  it("har obandat avslut före SharedBottom och inga två band i följd", () => {
    const sections = [...html.matchAll(/<section\b[^>]*class="([^"]+)"/g)];
    expect(sections).toHaveLength(content.sections.length + 2);
    const bands = sections.map((section) => section[1].split(" ").includes("hoa-surface-light"));
    // Hero ärver mörk yta. Ett mörkt avslut följs av SharedBottom:s sammanhängande ljusa CTA och nyhetsbrev.
    expect(sections.at(-1)?.[1].split(" ")).toContain("hoa-surface-dark");
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
    const nav = html.match(/<nav\b[^>]*aria-label="Läs vidare"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? "";
    const links = [...nav.matchAll(/<a\b[^>]*class="([^"]+)"[^>]*>/g)];
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link[1].split(" ")).toEqual(expect.arrayContaining(["inline-flex", "min-h-11", "min-w-11", "text-hoa-ink", "underline"]));
      expect(link[1]).not.toMatch(/text-hoa-gold|rounded|no-underline/);
    }
    for (const link of content.links) {
      expect(nav).toContain(`href="${link.href}"`);
      expect(nav).toContain(escaped(link.label));
    }
  });

  it("använder granskad metadata och brödsmulor", () => {
    const result = metadata();
    expect(result.title).toBe(content.title);
    expect(result.description).toBe(content.metaDescription);
    expect(result.alternates?.canonical).toBe(content.path);
    expect(result.openGraph).toMatchObject({ title: content.title, description: content.metaDescription, url: content.path });
    expect(result.twitter).toMatchObject({ title: content.title, description: content.metaDescription });
    expect(result.robots).toEqual(longevityRobots(LONGEVITY_PUBLISHED));
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).toContain(content.path);
  });
});

it.each(environments)("publiceringsflaggan öppnar oberoende av miljö: $name", ({ context, nodeEnv, preview, blocked }) => {
  const env = { CONTEXT: context, NODE_ENV: nodeEnv, LONGEVITY_PREVIEW: preview };
  expect(isLongevityBlocked(false, env)).toBe(blocked);
  expect(isLongevityBlocked(true, env)).toBe(false);
});

it.each(environments)("skyddar porträttets bytes utan offentlig cache: $name", async (environment) => {
  setEnvironment(environment);
  const response = await getPortrait();
  expect(response.status).toBe(environment.blocked ? 404 : 200);
  expect(response.headers.get("cache-control")).toBe("private, no-store");
  expect(response.headers.get("x-robots-tag")).toContain("noimageindex");
  const body = Buffer.from(await response.arrayBuffer());
  if (environment.blocked) {
    expect(body.length).toBe(0);
    expect(response.headers.get("content-type")).toBeNull();
  } else {
    expect(response.headers.get("content-type")).toBe("image/webp");
    expect(body.equals(readFileSync("src/assets/anne-wevers.webp"))).toBe(true);
  }
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
  expect(LONGEVITY_PUBLISHED).toBe(false);
  expect(mainMenu).toEqual(getMainMenu(LONGEVITY_PUBLISHED));
  expect(offerGroup).toEqual(getOfferGroup(LONGEVITY_PUBLISHED));
  expect(aboutNav).toEqual(getAboutNav(LONGEVITY_PUBLISHED));
  expect(sitemap()).toEqual(getSitemap(LONGEVITY_PUBLISHED));
});

it("visar Anne med svensk alt-text i befintlig Avatar", () => {
  const html = renderToStaticMarkup(createElement(AnnePage));
  expect(html).toContain(escaped(PORTRAITS.anne.alt));
  expect(html).toContain(`src="${PORTRAITS.anne.src}"`);
  expect(html).not.toContain("/_next/image");
  expect(existsSync("public/images/team/anne-wevers.webp")).toBe(false);
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
    // Beslutsdokumentationen namnger tjänsten som togs bort.
    if (path === join("content", "README.md")) continue;
    expect(readFileSync(path, "utf8"), path).not.toContain(removedSlug);
  }
  expect(getService(removedSlug)).toBeUndefined();
  const { generateStaticParams } = await import("@/app/boka/[slug]/page");
  expect(generateStaticParams()).not.toContainEqual({ slug: removedSlug });
});
