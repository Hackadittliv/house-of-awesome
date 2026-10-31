import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import AnnePage, { metadata as anneMetadata } from "@/app/anne-wevers/page";
import BlodanalysPage, { metadata as blodanalysMetadata } from "@/app/longevity-blodanalys/page";
import ForetagPage, { metadata as foretagMetadata } from "@/app/halsostrategi-for-foretag/page";
import sitemap from "@/app/sitemap";
import { Disclaimer } from "@/components/Disclaimer";
import { HEALTH_DISCLAIMER, longevity } from "@/lib/content";
import { isGroup, mainMenu } from "@/lib/nav";
import { PORTRAITS } from "@/lib/people";
import { findCopyViolations } from "../scripts/copy-rules.mjs";

const pages = [
  { content: longevity.anne, Page: AnnePage, metadata: anneMetadata },
  { content: longevity.blodanalys, Page: BlodanalysPage, metadata: blodanalysMetadata },
  { content: longevity.foretag, Page: ForetagPage, metadata: foretagMetadata },
];
const escaped = (text: string) => renderToStaticMarkup(createElement("span", null, text)).slice(6, -7);

describe.each(pages)("longevity: $content.path", ({ content, Page, metadata }) => {
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

  it("har två bokningsknappar som alltid leder till HOA:s introduktion", () => {
    expect(html.match(/href="\/boka\/kostnadsfri-introduktion"/g)).toHaveLength(2);
    expect(html.match(new RegExp(`>${content.cta.buttonLabel}<`, "g"))).toHaveLength(2);
  });

  it("länkar till båda andra sidorna och finns i huvudmenyn och sitemap", () => {
    expect(content.links.map((link) => link.href).sort()).toEqual(pages.map(({ content: other }) => other.path).filter((path) => path !== content.path).sort());
    for (const link of content.links) {
      expect(html).toContain(`href="${link.href}"`);
      expect(html).toContain(escaped(link.label));
    }
    const menuPaths = mainMenu.flatMap((entry) => isGroup(entry) ? entry.items.map((item) => item.href) : [entry.href]);
    expect(menuPaths).toContain(content.path);
    expect(sitemap().map((entry) => new URL(entry.url).pathname)).toContain(content.path);
  });

  it("använder granskad metadata och brödsmulor", () => {
    expect(metadata.title).toBe(content.title);
    expect(metadata.description).toBe(content.metaDescription);
    expect(metadata.alternates?.canonical).toBe(content.path);
    expect(html).toContain('"@type":"BreadcrumbList"');
    expect(html).toContain(content.path);
  });
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
