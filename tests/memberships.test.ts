// @vitest-environment happy-dom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import MedlemskapPage from "@/app/medlemskap/page";
import { GET as getLlms } from "@/app/llms.txt/route";

vi.mock("@/lib/reach-status", () => ({
  programEnabled: () => true,
  subscribeProgram: () => () => {},
}));

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
afterEach(() => window.history.replaceState({}, "", "/"));

it.each([
  ["?ref=LAABCDEFGH&email=private%40example.invalid", "LAABCDEFGH"],
  ["?ref=INVALID", null],
  ["", null],
])("väljer plan hos LIA och behåller en giltig tipskod från %s", async (search, code) => {
  window.history.replaceState({}, "", "/medlemskap" + search);
  const container = document.createElement("main");
  const root = createRoot(container);
  try {
    await act(async () => root.render(createElement(MedlemskapPage)));
    const links = Array.from(container.querySelectorAll<HTMLAnchorElement>("#medlemskap a"));
    expect(links).toHaveLength(2);
    expect(links.map(link => new URL(link.href).searchParams.get("plan")))
      .toEqual(["hoa_247_member_monthly", "hoa_247_all_inclusive_monthly"]);
    for (const link of links) {
      const url = new URL(link.href);
      expect(url.origin + url.pathname).toBe("https://lifeisawesome.se/medlem");
      expect(url.searchParams.get("ref")).toBe(code);
      expect(url.searchParams.get("utm_source")).toBe("houseofawesome");
      expect(url.searchParams.has("email")).toBe(false);
    }
    const terms = container.textContent ?? "";
    for (const phrase of ["111 kr/mån", "1 444 kr/mån", "sex månaders bindningstid", "25 % moms", "999 kr", "4 444 kr", "155 kr", "333 kr", "555 kr", "24 timmar", "Celloxy ingår inte", "ingen separat bokning"]) {
      expect(terms).toContain(phrase);
    }
    expect(container.querySelector("form")).toBeNull();
  } finally {
    await act(async () => root.unmount());
  }
});

it("publicerar samma medlemskap och bindningstid i sajtens textkatalog", async () => {
  const catalog = (await getLlms().text()).split("## Medlemskap")[1].split("## Sidor")[0];
  expect(catalog).toContain("6 månaders bindningstid");
  expect(catalog).toContain("Medlemskap: 111 kr");
  expect(catalog).toContain("All inclusive: 1 444 kr");
  expect(catalog).not.toContain("Longevity Plus");
});
