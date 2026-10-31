import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import KontaktPage from "@/app/kontakt/page";
import { SiteFooter } from "@/components/SiteFooter";
import { ConsentProvider } from "@/components/consent/ConsentProvider";
import { site } from "@/lib/content";

/** Klasserna på länken vars text är exakt `text`. */
function linkClass(html: string, text: string): string[] {
  const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(new RegExp(`<a [^>]*class="([^"]*)"[^>]*>${escaped}</a>`));
  expect(match, `länken "${text}"`).not.toBeNull();
  return match![1].split(/\s+/);
}

// E-postadressen saknar mellanslag. I en inline-flex-länk kan den inte brytas och gav sidledsscroll
// vid 320 px och 200 % text; som block med w-fit och max-w-full bryts den, och py-3 ger 44 px höjd
// med 20 px rad (text-sm i sidfoten).
const BREAKABLE_EMAIL = ["block", "w-fit", "max-w-full", "py-3"];

describe("kontaktlänkarna", () => {
  it("låter sidfotens e-postlänk brytas och vara minst 44 px hög", () => {
    const html = renderToStaticMarkup(createElement(ConsentProvider, null, createElement(SiteFooter)));
    const email = linkClass(html, site.contact.email);
    expect(email).toEqual(expect.arrayContaining(BREAKABLE_EMAIL));
    expect(email).not.toContain("inline-flex");
    // Telefonen har mellanslag och behåller den vanliga klickytan för fristående länkar.
    expect(linkClass(html, "073-349 08 36")).toEqual(expect.arrayContaining(["inline-flex", "min-h-11", "items-center"]));
  });

  it("ger /kontakts e-post- och telefonlänk klickytor på minst 44 px", () => {
    const html = renderToStaticMarkup(createElement(KontaktPage));
    expect(linkClass(html, "073-349 08 36")).toEqual(expect.arrayContaining(["inline-flex", "min-h-11", "items-center"]));
    // Kortets text är text-sm med leading-relaxed (cirka 23 px rad), så py-3 ger minst 44 px.
    const email = linkClass(html, site.contact.email);
    expect(email).toEqual(expect.arrayContaining(BREAKABLE_EMAIL));
    expect(email).not.toContain("inline-flex");
  });
});
