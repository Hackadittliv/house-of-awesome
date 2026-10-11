import { describe, expect, it } from "vitest";

import { getBookableServices, getInquiryServices } from "@/lib/content";
import { SHORT_CALL_SLUG, bookingUrl, inquiryUrl, membershipUrl } from "@/lib/links";

describe("bokningslänkar", () => {
  it.each(getBookableServices().map((service) => service.slug))(
    "%s går till rätt tjänst på lifeisawesome.se/boka med utm_source=houseofawesome",
    (slug) => {
      const url = new URL(bookingUrl(slug, "test"));
      expect(url.origin).toBe("https://lifeisawesome.se");
      expect(url.pathname).toBe(`/boka/${slug}`);
      expect(url.searchParams.get("utm_source")).toBe("houseofawesome");
      expect(url.searchParams.get("utm_medium")).toBe("referral");
      expect(url.searchParams.get("utm_content")).toBe("test");
    },
  );

  it("utan tjänst går till bokningens startsida", () => {
    const url = new URL(bookingUrl(null, "header"));
    expect(url.pathname).toBe("/boka");
    expect(url.searchParams.get("utm_source")).toBe("houseofawesome");
  });

  it.each(getInquiryServices().map((service) => service.slug))(
    "förfrågan om %s går till det korta samtalet och bär med sig tjänsten",
    (slug) => {
      const url = new URL(inquiryUrl(slug, "card"));
      expect(url.pathname).toBe(`/boka/${SHORT_CALL_SLUG}`);
      expect(url.searchParams.get("utm_content")).toBe(`card_${slug}`);
    },
  );

  it("medlemskap går till /medlem med rätt plan", () => {
    const url = new URL(membershipUrl("hoa_gym_monthly", "membership_page"));
    expect(url.origin).toBe("https://lifeisawesome.se");
    expect(url.pathname).toBe("/medlem");
    expect(url.searchParams.get("plan")).toBe("hoa_gym_monthly");
    expect(url.searchParams.get("utm_source")).toBe("houseofawesome");
  });
});
