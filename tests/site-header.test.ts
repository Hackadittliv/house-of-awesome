import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

import { SiteHeader } from "@/components/SiteHeader";

describe("sidhuvudets ljusa yta", () => {
  it("renderar ljusa tokens och låter huvudknappen ärva ytans färger", () => {
    const html = renderToStaticMarkup(createElement(SiteHeader, { bookingHref: "/boka" }));
    const header = html.match(/<header\b[^>]*>/)?.[0];
    expect(header).toContain("hoa-surface-light");
    expect(header).toContain("bg-hoa-light");
    expect(header).toContain("text-hoa-light-ink");
    expect(header).toContain("sticky");
    const bookingLink = html.match(/<a\b[^>]*href="\/boka"[^>]*>[\s\S]*?<\/a>/)?.[0];
    expect(bookingLink).toContain("bg-hoa-gold");
    expect(bookingLink).toContain("text-hoa-espresso");
    expect(html).toContain("text-hoa-wordmark-accent");
  });
});
