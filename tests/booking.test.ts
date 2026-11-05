import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { findCopyViolations } from "../scripts/copy-rules.mjs";
import BookingIndexPage from "@/app/boka/page";
import { ANNE_BOOKING_URL } from "@/lib/anne";
import { bookingCopy } from "@/lib/booking/copy";
import { addDays, groupSlotsByDay, interestFor, stockholmDate, utmFrom } from "@/lib/booking/format";
import { getBookableServices, getInquiryServices } from "@/lib/content";
import { bookingUrl, inquiryUrl, liaBookingUrl } from "@/lib/links";
import { REBECCA } from "@/lib/rebecca";
import { SANDRA } from "@/lib/sandra";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: () => undefined }),
}));

const bookingConfig = vi.hoisted(() => ({ enabled: true }));

vi.mock("@/lib/booking/config", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/booking/config")>()),
  get bookingEnabled() {
    return bookingConfig.enabled;
  },
}));

describe("bokningstexter", () => {
  it.each(Object.entries(bookingCopy))("%s följer copy-reglerna", (_key, text) => {
    expect(findCopyViolations(text)).toEqual([]);
  });
});

describe("bokningslänkar när HOA-bokningen är på", () => {
  it.each(getBookableServices().map((service) => service.slug))("%s bokas på houseofawesome.se", (slug) => {
    expect(bookingUrl(slug, "test", true)).toBe(`/boka/${slug}`);
  });

  it.each(getInquiryServices().map((service) => service.slug))("%s går till förfrågan med tjänsten", (slug) => {
    expect(inquiryUrl(slug, "card", true)).toBe(`/boka/forfragan?tjanst=${slug}`);
  });

  it("startsidan för bokning ligger på HOA", () => {
    expect(bookingUrl(null, "header", true)).toBe("/boka");
  });

  it("reservlänken går fortfarande till LIA med utm", () => {
    const url = new URL(liaBookingUrl("hbot-60", "booking_fallback"));
    expect(url.origin).toBe("https://lifeisawesome.se");
    expect(url.searchParams.get("utm_source")).toBe("houseofawesome");
  });
});

describe("bokningshjälpare", () => {
  it("räknar dagar över månadsskifte", () => {
    expect(addDays("2026-10-30", 3)).toBe("2026-11-02");
    expect(addDays("2026-11-02", -7)).toBe("2026-10-26");
  });

  it("grupperar tider per dag i svensk tid", () => {
    const days = groupSlotsByDay([
      { start: "2026-11-02T23:30:00Z", end: "2026-11-03T00:30:00Z" },
      { start: "2026-11-02T08:00:00Z", end: "2026-11-02T09:00:00Z" },
    ]);
    expect(days.size).toBe(2);
    expect(days.get("2026-11-03")).toHaveLength(1);
    expect(stockholmDate(new Date("2026-11-02T23:30:00Z"))).toBe("2026-11-03");
  });

  it("förfrågan får samma intressekategori som i LIA:s formulär", () => {
    expect(interestFor("hbot-60")).toBe("hbot");
    expect(interestFor("ihht-50")).toBe("celloxy");
    expect(interestFor("coaching-45")).toBe("coaching");
    expect(interestFor("forsta-halsosamtal")).toBe("free_10min");
    expect(interestFor("vitamindropp")).toBe("other");
    expect(interestFor(null)).toBe("other");
  });

  it("tar bara med kända utm-parametrar", () => {
    expect(utmFrom("?utm_source=ig&utm_campaign=host&avboka=x&email=a@b.se")).toEqual({
      utm_source: "ig",
      utm_campaign: "host",
    });
  });
});

describe("personförfrågningar på /boka", () => {
  const people = [
    {
      name: `${REBECCA.service} hos ${REBECCA.name}`,
      href: "/boka/forfragan/rebecca",
    },
    {
      name: `Massage hos ${SANDRA.name}`,
      href: "/boka/forfragan/sandra",
    },
    {
      name: "Rådgivning hos Anne Wevers",
      href: "/boka/forfragan?tjanst=anne-wevers",
    },
  ];

  it("listar Rebecca, Sandra och Anne under förfrågan, efter katalogtjänsterna", () => {
    bookingConfig.enabled = true;
    expect(REBECCA.requestPath).toBe(people[0].href);
    expect(SANDRA.requestPath).toBe(people[1].href);
    expect(ANNE_BOOKING_URL).toBe(people[2].href);

    const html = renderToStaticMarkup(createElement(BookingIndexPage));
    const requestStart = html.indexOf('id="request"');
    const bookableStart = html.indexOf('id="bookable"');
    expect(requestStart).toBeGreaterThan(bookableStart);
    const request = html.slice(requestStart, html.indexOf("</section>", requestStart));
    const bookable = html.slice(bookableStart, html.indexOf("</section>", bookableStart));
    const anchors = [...request.matchAll(/<a\b[^>]*>[\s\S]*?<\/a>/g)].map((match) => match[0]);
    const lastCatalog = anchors.findLastIndex((anchor) => anchor.includes("/boka/forfragan?tjanst=") && !anchor.includes("anne-wevers"));

    expect(lastCatalog).toBe(getInquiryServices().length - 1);
    expect(anchors).toHaveLength(getInquiryServices().length + people.length);
    people.forEach((person, index) => {
      const anchor = anchors[lastCatalog + 1 + index];
      const href = person.href.replaceAll("&", "&amp;");
      expect(anchor).toContain(`href="${href}"`);
      expect(anchor).toContain(person.name);
      expect(anchor).toContain(bookingCopy.sendRequest);
      expect(anchor).not.toContain(bookingCopy.chooseTime);
      expect(bookable).not.toContain(href);
    });

    expect(html).not.toContain("/boka/healing-emht");
    expect(request).toContain('href="/boka/forfragan?tjanst=awesome-protocol"');
    expect(findCopyViolations(people.map((person) => person.name).join("\n"))).toEqual([]);
  });
});
