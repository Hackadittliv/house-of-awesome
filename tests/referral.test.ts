import { describe, expect, it } from "vitest";

import { fallbackBookingDestination } from "@/lib/booking/fallback";
import { assessmentEmbedUrl, assessmentFallbackUrl } from "@/lib/assessment";
import { referralBody, referralFromSearch, referralHref } from "@/lib/referral";

const code = "LAABCDEFGH";

describe("tips genom House of Awesome", () => {
  it.each(["", "?amb=LAABCDEFGH", "?ref=ORDINARY", "?ref=LA0O1I2222", "?ref=LAABCDEFGH&ref=LA23456789",
    "?ref=user%40example.invalid", "?ref=LAABCDEFGH%0Aextra"])("bevarar vanligt flöde för %s", search => {
    expect(referralFromSearch(search)).toBeNull();
    expect(referralBody(referralFromSearch(search))).toEqual({});
  });

  it("tar bara med den publika koden på två hela sidladdningar och till LIA", () => {
    const incoming = "?email=private%40example.invalid&ref=laabcdefgh&session_id=private";
    const detail = referralHref("/tjanster/hbot-60", referralFromSearch(incoming));
    const visit = new URL(detail, "https://houseofawesome.se");
    const booking = referralHref("/boka/hbot-60", referralFromSearch(visit.search));
    const membership = referralHref("https://lifeisawesome.se/medlem?plan=price_plan#plans", referralFromSearch(visit.search));
    expect(detail).toBe("/tjanster/hbot-60?ref=" + code);
    expect(booking).toBe("/boka/hbot-60?ref=" + code);
    expect(membership).toBe("https://lifeisawesome.se/medlem?plan=price_plan&ref=" + code + "#plans");
    expect(referralBody(referralFromSearch("?ref=LA23456789"))).toEqual({ ambassadorCode: "LA23456789" });
    expect(referralHref("/medlemskap", referralFromSearch(""))).toBe("/medlemskap");
  });

  it.each(["https://www.bokadirekt.se/example", "https://lifeisawesome.se.evil.invalid/", "//elsewhere.invalid/",
    "/\\elsewhere.invalid/path", "mailto:hello@example.invalid", "tel:+460000000", "/boka/tack?session_id=public-test",
    "/avboka", "/presentkort/tack", "https://lifeisawesome.se/boka?amb=LEGACY", "/boka?ref=EXISTING",
  ])("lägger inte till koden i %s", href => expect(referralHref(href, code)).toBe(href));

  it.each(["personal", "equipment"] as const)("skickar enbart koden och driftfält till %s", flow => {
    const iframe = new URL(assessmentEmbedUrl(flow, "https://houseofawesome.se/path?email=private", "channel", "https://lifeisawesome.se", code));
    expect(Object.fromEntries(iframe.searchParams)).toEqual({ parentOrigin: "https://houseofawesome.se", channel: "channel", source: "houseofawesome", ref: code });
    expect(new URL(assessmentFallbackUrl(flow, code)).searchParams.get("ref")).toBe(code);
    expect(new URL(assessmentFallbackUrl(flow, "private@example.invalid")).search).toBe("");
  });
});

describe("reservvägen när HOA:s bokningssystem saknas", () => {
  it("bygger en ny LIA-adress utan att vidarebefordra personuppgifter", () => {
    const result = fallbackBookingDestination("/boka/hbot-60", new URLSearchParams("ref=laabcdefgh&email=private%40example.invalid&notes=private&access_token=secret"));
    expect(result.origin + result.pathname).toBe("https://lifeisawesome.se/boka/hbot-60");
    expect(Object.fromEntries(result.searchParams)).toEqual({ utm_source: "houseofawesome", utm_medium: "referral",
      utm_campaign: "hoa_site", utm_content: "redirect", ref: "LAABCDEFGH" });
  });

  it("behåller en avbokning separat från en tipslänk", () => {
    const token = "00000000-0000-4000-8000-000000000001";
    const result = fallbackBookingDestination("/boka", new URLSearchParams("avboka=" + token + "&ref=LAABCDEFGH"));
    expect(result.searchParams.get("avboka")).toBe(token);
    expect(result.searchParams.has("ref")).toBe(false);
  });
});
