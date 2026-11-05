// @vitest-environment happy-dom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

import { SiteHeader } from "@/components/SiteHeader";
import { mainMenu } from "@/lib/nav";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

afterEach(() => {
  navigation.pathname = "/";
});

describe("sidhuvudets ljusa yta", () => {
  it("renderar ljusa tokens och låter huvudknappen ärva ytans färger", () => {
    const html = renderToStaticMarkup(createElement(SiteHeader, { bookingHref: "/boka", menu: mainMenu }));
    const header = html.match(/<header\b[^>]*>/)?.[0];
    expect(header).toContain("hoa-surface-light");
    expect(header).toContain("bg-hoa-light");
    expect(header).toContain("text-hoa-light-ink");
    expect(header).toContain("sticky");
    expect(header).toContain("z-50");
    const bookingLinks = [...html.matchAll(/<a\b[^>]*href="\/boka"[^>]*>[\s\S]*?<\/a>/g)].map((match) => match[0]);
    expect(bookingLinks).toHaveLength(1);
    expect(bookingLinks[0]).toContain(">Boka<");
    expect(bookingLinks[0]).toContain("bg-hoa-gold");
    expect(bookingLinks[0]).toContain("text-hoa-espresso");
    expect(html).toContain("text-hoa-wordmark-accent");
    expect(html).not.toContain('id="mobilmeny"');
  });
});

describe("Boka i mobilmenyn", () => {
  let root: Root | undefined;

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    root = undefined;
    document.body.replaceChildren();
  });

  async function openMenu(bookingHref: string) {
    navigation.pathname = "/boka";
    const container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    await act(async () => {
      root!.render(createElement(SiteHeader, { bookingHref, menu: mainMenu }));
    });
    const button = container.querySelector<HTMLButtonElement>('button[aria-controls="mobilmeny"]');
    expect(button).not.toBeNull();
    await act(async () => {
      button!.click();
    });
    const dialog = document.getElementById("mobilmeny");
    expect(dialog).not.toBeNull();
    const header = container.querySelector("header");
    expect(header?.className).toContain("z-[65]");
    expect(header?.className).not.toContain("z-50");
    return { container, dialog: dialog! };
  }

  function bookingLink(scope: ParentNode) {
    return [...scope.querySelectorAll("a")].find((anchor) => anchor.textContent?.trim() === "Boka");
  }

  it("stänger menyn och länkar till bokningen även när man redan är där", async () => {
    const { dialog } = await openMenu("/boka");
    const booking = bookingLink(dialog);
    expect(booking?.getAttribute("href")).toBe("/boka");
    await act(async () => {
      booking!.click();
    });
    expect(document.getElementById("mobilmeny")).toBeNull();
    const header = document.querySelector("header");
    expect(header?.className).toContain("z-50");
    expect(header?.className).not.toContain("z-[65]");
    expect(navigation.pathname).toBe("/boka");
  });

  it("stänger menyn när bokningsadressen är extern", async () => {
    const { dialog } = await openMenu("https://lifeisawesome.se/boka");
    const booking = bookingLink(dialog);
    expect(booking?.getAttribute("href")).toBe("https://lifeisawesome.se/boka");
    await act(async () => {
      booking!.click();
    });
    expect(document.getElementById("mobilmeny")).toBeNull();
  });

  it("desktop-knappen har samma adress och stänger en öppen meny", async () => {
    const { container, dialog } = await openMenu("/boka");
    const desktop = bookingLink(container);
    expect(desktop).toBeTruthy();
    expect(dialog.contains(desktop!)).toBe(false);
    expect(desktop?.getAttribute("href")).toBe("/boka");
    await act(async () => {
      desktop!.click();
    });
    expect(document.getElementById("mobilmeny")).toBeNull();
  });
});
