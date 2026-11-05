// @vitest-environment happy-dom
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { findCopyViolations } from "../scripts/copy-rules.mjs";
import BehandlingarPage from "@/app/behandlingar-och-samtal/page";
import EventPage from "@/app/event-och-lokaler/page";
import FaqPage from "@/app/faq/page";
import LongevityResorPage from "@/app/longevity-resor/page";
import ServicePage from "@/app/tjanster/[slug]/page";
import { RequestPage } from "@/components/booking/RequestPage";
import { SiteFooter } from "@/components/SiteFooter";
import { ConsentProvider } from "@/components/consent/ConsentProvider";
import { bookingCopy } from "@/lib/booking/copy";
import { getServices } from "@/lib/content";
import { extraInquiryLabels, requestServiceNames } from "@/lib/inquiry-services";
import { REBECCA } from "@/lib/rebecca";
import { SANDRA } from "@/lib/sandra";

const config = vi.hoisted(() => ({ enabled: true }));

vi.mock("@/lib/booking/config", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/booking/config")>()),
  get bookingEnabled() {
    return config.enabled;
  },
}));

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.(tsx|ts)$/.test(name) ? [path] : [];
  });
}

function hrefsFor(html: string, text: string): string[] {
  const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...html.matchAll(new RegExp(`<a\\b[^>]*href="([^"]*)"[^>]*>${escaped}</a>`, "g"))].map((match) =>
    match[1].replaceAll("&amp;", "&"),
  );
}

const render = (component: () => ReactNode) => renderToStaticMarkup(createElement(component));

beforeEach(() => {
  config.enabled = true;
});

describe("förfrågningsknappar går till formuläret", () => {
  it("event, longevity-resa och behandlingsrum bär med sig tjänsten", () => {
    const event = render(EventPage);
    const trip = render(LongevityResorPage);
    const treatments = render(BehandlingarPage);

    expect(hrefsFor(event, "Förfrågan om event")).toEqual(["/boka/forfragan?tjanst=event"]);
    expect(hrefsFor(trip, "Gör en förfrågan")).toEqual(["/boka/forfragan?tjanst=longevity-resa"]);
    expect(hrefsFor(trip, "Gör en förfrågan om longevity-resa")).toEqual(["/boka/forfragan?tjanst=longevity-resa"]);
    expect(hrefsFor(treatments, "Hör av dig")).toEqual(["/boka/forfragan?tjanst=behandlingsrum"]);

    for (const html of [event, trip, treatments]) expect(html).not.toContain("mailto:");
  });

  it("lämnar bokningsbara tjänster och terapeuternas egna förfrågningar orörda", () => {
    const html = render(BehandlingarPage);
    expect(hrefsFor(html, "Boka coachning")).toEqual(["/boka/coaching-45"]);
    expect(hrefsFor(html, "Boka vägledning")).toEqual(["/boka/forfragan?tjanst=funktionsmedicin"]);
    expect(hrefsFor(html, "Boka samtal")).toEqual(["/boka/forsta-halsosamtal"]);
    expect(hrefsFor(html, "Skicka förfrågan till Rebecca")).toEqual([REBECCA.requestPath]);
    expect(hrefsFor(html, "Skicka förfrågan om massage hos Sandra")).toEqual([SANDRA.requestPath]);
  });

  it("gör tjänstesidans förfrågan till formuläret och låter bokningsbara tjänster bokas direkt", async () => {
    const inquiry = getServices().find((service) => service.slug === "vitamindropp")!;
    const bookable = getServices().find((service) => service.slug === "hbot-60")!;
    expect(inquiry.bookable).toBe(false);
    expect(bookable.bookable).toBe(true);

    const inquiryHtml = renderToStaticMarkup(
      await ServicePage({ params: Promise.resolve({ slug: inquiry.slug }) } as Parameters<typeof ServicePage>[0]),
    );
    expect(hrefsFor(inquiryHtml, "Boka ett kort samtal")).toEqual([`/boka/forfragan?tjanst=${inquiry.slug}`]);
    expect(hrefsFor(inquiryHtml, "Skicka en förfrågan")).toEqual([`/boka/forfragan?tjanst=${inquiry.slug}`]);
    expect(inquiryHtml).not.toContain("mailto:");
    expect(inquiryHtml).not.toContain("Mejla en förfrågan");

    const bookableHtml = renderToStaticMarkup(
      await ServicePage({ params: Promise.resolve({ slug: bookable.slug }) } as Parameters<typeof ServicePage>[0]),
    );
    expect(hrefsFor(bookableHtml, `Boka ${bookable.shortName}`)).toEqual([`/boka/${bookable.slug}`]);
    expect(bookableHtml).not.toContain("/boka/forfragan");
    expect(bookableHtml).not.toContain("mailto:");
  });

  it("använder Life Is Awesome som reserv när bokningen är av, inte mailto", () => {
    config.enabled = false;
    const html = render(EventPage) + render(LongevityResorPage) + render(BehandlingarPage);
    expect(html).not.toContain("mailto:");
    expect(html).toContain("https://lifeisawesome.se/boka/forsta-halsosamtal");
    expect(html).toContain("utm_content=event_page_event");
    expect(html).toContain("utm_content=longevity_resa_longevity-resa");
    expect(html).toContain("utm_content=beh_rum_behandlingsrum");
  });
});

describe("formuläret visar vad förfrågan gäller", () => {
  let root: Root | undefined;

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    root = undefined;
    document.body.replaceChildren();
  });

  async function shownService(search: string) {
    window.history.replaceState(null, "", `/boka/forfragan${search}`);
    const container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root!.render(createElement(RequestPage, { services: requestServiceNames() }));
    });
    return container.textContent ?? "";
  }

  it.each([
    ["?tjanst=event", "Event och lokaler"],
    ["?tjanst=longevity-resa", "Longevity-resa"],
    ["?tjanst=behandlingsrum", "Hyra behandlingsrum"],
    ["?tjanst=anne-wevers", "Rådgivning hos Anne Wevers"],
    ["?tjanst=healing-emht", REBECCA.service],
    ["?tjanst=massage-sandra", `${SANDRA.service} hos ${SANDRA.name}`],
    ["?tjanst=funktionsmedicin", "Funktionsmedicin"],
    ["?tjanst=awesome-protocol", "The Awesome Protocol"],
  ])("%s visas som %s", async (search, name) => {
    expect(await shownService(search)).toContain(`${bookingCopy.requestService}: ${name}`);
  });

  it("visar ingen tjänst för en okänd slug", async () => {
    const text = await shownService("?tjanst=finns-inte");
    expect(text).not.toContain(`${bookingCopy.requestService}:`);
    expect(text).toContain(bookingCopy.sendRequest);
  });

  it("låter katalognamn gälla och följer språkreglerna", () => {
    const names = requestServiceNames();
    expect(names["awesome-protocol"]).toBe("The Awesome Protocol");
    expect(names.event).toBe(extraInquiryLabels.event);
    for (const name of Object.values(names)) expect(findCopyViolations(name)).toEqual([]);
  });
});

describe("mailto blir kvar bara för kontakt som inte är en förfrågan", () => {
  const allowed = [
    "src/app/besok/page.tsx",
    "src/app/boka/forfragan/rebecca/page.tsx",
    "src/app/boka/forfragan/sandra/page.tsx",
    "src/app/faq/page.tsx",
    "src/app/integritetspolicy/page.tsx",
    "src/app/kontakt/page.tsx",
    "src/components/CtaLink.tsx",
    "src/components/SiteFooter.tsx",
    "src/lib/links.ts",
  ];

  it("finns inte på förfrågningssidorna", () => {
    const hits = files("src")
      .filter((file) => /mailto:|mailtoUrl\(/.test(readFileSync(file, "utf8")))
      .map((file) => file.replaceAll("\\", "/"))
      .sort();
    expect(hits).toEqual(allowed);
  });

  it("länkar FAQ och sidfoten till e-post, inte till formuläret", () => {
    const faq = render(FaqPage);
    expect(hrefsFor(faq, "Mejla en fråga")[0]).toMatch(/^mailto:/);
    const footer = renderToStaticMarkup(createElement(ConsentProvider, null, createElement(SiteFooter)));
    expect(footer).toMatch(/href="mailto:/);
    expect(faq).not.toContain("/boka/forfragan");
  });
});
