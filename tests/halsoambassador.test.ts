// @vitest-environment happy-dom
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import HalsoambassadorPage, { metadata } from "@/app/halsoambassador/page";
import { aboutNav, offerGroup } from "@/lib/nav";
import { referralHref } from "@/lib/referral";
import { getSitemap } from "@/lib/sitemap";

const path = "/halsoambassador";
const signup = "https://lifeisawesome.se/halsoambassador?fran=hoa#registrera";

describe("HOA:s gemensamma ambassadörsprogram", () => {
  it("har samma registrering i båda knapparna även när besökaren kommit med en tipskod", () => {
    const page = document.createElement("main");
    page.innerHTML = renderToStaticMarkup(createElement(HalsoambassadorPage));
    const links = Array.from(page.querySelectorAll("a"));
    const ctas = links.filter((link) => link.textContent?.includes("Registrera mig"));
    expect(ctas).toHaveLength(2);
    for (const link of ctas) expect(referralHref(link.href, "LAABCDEFGH")).toBe(signup);
    expect(page.querySelectorAll("h1")).toHaveLength(1);
    expect(page.querySelector("#ersattning")).toBeTruthy();
    expect(page.textContent).toContain("100 kr");
    expect(page.textContent).toContain("150 kr");
  });

  it("går att hitta från huvudsajten och har egen kanonisk adress", () => {
    expect(offerGroup.items.some((entry) => entry.href === path)).toBe(true);
    expect(aboutNav.some((entry) => entry.href === path)).toBe(true);
    expect(metadata.alternates?.canonical).toBe(path);
    expect(getSitemap().some((entry) => new URL(entry.url).pathname === path)).toBe(true);
  });
});
