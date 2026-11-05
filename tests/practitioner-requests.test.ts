import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import RebeccaRequestPage, { metadata as rebeccaMetadata } from "@/app/boka/forfragan/rebecca/page";
import SandraRequestPage, { metadata as sandraMetadata } from "@/app/boka/forfragan/sandra/page";
import { RequestForm } from "@/components/booking/RequestForm";
import { site } from "@/lib/content";
import { REBECCA } from "@/lib/rebecca";

const config = vi.hoisted(() => ({ enabled: true }));

vi.mock("@/lib/booking/config", async (importOriginal) => ({
  ...await importOriginal<typeof import("@/lib/booking/config")>(),
  get bookingEnabled() { return config.enabled; },
}));

// Rendera formulärets initiala HTML i Node utan att simulera webbläsarinteraktion.
vi.mock("@/components/booking/ClientOnly", () => ({
  ClientOnly: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("@/components/booking/RequestForm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/booking/RequestForm")>();
  return { RequestForm: vi.fn(actual.RequestForm) };
});

beforeEach(() => {
  config.enabled = true;
  vi.clearAllMocks();
});

describe("personernas förfrågningssidor", () => {
  it.each([
    {
      page: RebeccaRequestPage,
      metadata: rebeccaMetadata,
      path: "/boka/forfragan/rebecca",
      route: "rebecca",
      slug: "healing-emht",
      options: [
        "60 min: samtal + 45 min healingbehandling, 1 050 kr",
        "90 min: healingbehandling med kompletterande metod efter önskemål, 1 550 kr",
        "45 min: healingbehandling på distans, med telefonsamtal före och efter, 650 kr",
      ],
    },
    {
      page: SandraRequestPage,
      metadata: sandraMetadata,
      path: "/boka/forfragan/sandra",
      route: undefined,
      slug: "massage-sandra",
      options: ["Svensk klassisk massage 30 min, 550 kr", "Svensk klassisk massage 50 min, 800 kr"],
    },
  ])("$path visar rätt val och använder avsedd mottagare", ({ page, metadata, path, route, slug, options }) => {
    const html = renderToStaticMarkup(createElement(page));
    expect(metadata.alternates?.canonical).toBe(path);
    expect([...html.matchAll(/<option[^>]*>(.*?)<\/option>/g)].map((match) => match[1])).toEqual(options);
    expect(html).toContain('<select id="option" name="option"');
    expect(html).toContain("Skicka förfrågan");
    const props = vi.mocked(RequestForm).mock.calls[0][0];
    expect(props.options).toEqual(options);
    expect(props.serviceSlug).toBe(slug);
    expect(props.route).toBe(route);
    if (!route) expect(props.serviceName).toContain("Sandra Bengts");
  });

  it.each([
    [RebeccaRequestPage, REBECCA.fallbackEmail, "Förfrågan om healing"],
    [SandraRequestPage, site.contact.email, "Förfrågan om massage hos Sandra Bengts"],
  ] as const)("använder befintlig reservkontakt när backend saknas", (page, recipient, subject) => {
    config.enabled = false;
    const html = renderToStaticMarkup(createElement(page));
    expect(html).toContain(`mailto:${recipient}?subject=${encodeURIComponent(subject)}`);
    expect(html).not.toContain("<form");
    expect(RequestForm).not.toHaveBeenCalled();
  });
});
