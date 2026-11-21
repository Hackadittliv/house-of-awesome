// @vitest-environment happy-dom
import { act, createElement, Fragment, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { scrubSensitiveParamsScript } from "@/lib/booking/sensitive-url";
import { setReferralCode } from "@/lib/referral";
import { ConsentedTrackers } from "@/components/consent/ConsentedTrackers";
import { ReferralLink } from "@/components/ReferralLink";

vi.mock("@/components/consent/ConsentProvider", () => ({ useConsent: () => ({ choice: { analytics: true, marketing: true } }) }));
vi.mock("next/navigation", () => ({ usePathname: () => window.location.pathname }));
vi.mock("next/script", () => ({ default: ({ src, id }: { src?: string; id?: string }) => createElement("span", { "data-script": src ?? id }) }));
vi.mock("next/link", () => ({ default: ({ href, children }: { href: string; children?: ReactNode }) => createElement("a", { href, "data-client-navigation": true }, children) }));
vi.mock("@/lib/consent", async (orig) => ({ ...await orig<typeof import("@/lib/consent")>(), trackers: { gaMeasurementId: "G-SYNTHETIC", metaPixelId: "123456789" } }));

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
afterEach(() => {
  delete (window as Window & { __hoaReferralDocument?: boolean }).__hoaReferralDocument;
  window.localStorage.clear();
  document.body.replaceChildren();
});

describe("tipsbesök och samtycke", () => {
  it.each([["/", false], ["/?ref=LAABCDEFGH", true], ["/?ref=private%40example.invalid", true]] as const)(
    "respekterar sidans spårningsgräns för %s även efter samtycke", async (path, protectedVisit) => {
      window.history.replaceState({}, "", path);
      new Function("window", "URL", scrubSensitiveParamsScript)(window, URL);
      const node = document.createElement("div");
      const root = createRoot(node);
      const content = () => createElement(Fragment, null,
        createElement(ConsentedTrackers), createElement(ReferralLink, { href: "/integritetspolicy" }, "Policy"),
        createElement(ReferralLink, { href: "/boka?ref=LA23456789" }, "Ny tipslänk"));
      try {
        await act(async () => root.render(content()));
        expect(node.querySelectorAll("[data-script]")).toHaveLength(protectedVisit ? 0 : 3);
        expect(node.querySelector("a[href='/boka?ref=LA23456789']")!.hasAttribute("data-client-navigation")).toBe(false);
        if (path.includes("LAABCDEFGH")) {
          expect(node.querySelector("a[href='/integritetspolicy']")!.hasAttribute("data-client-navigation")).toBe(false);
          await act(async () => { setReferralCode(null); root.render(content()); });
          expect(window.location.search).toBe("");
          expect(node.querySelectorAll("[data-script]")).toHaveLength(0);
        }
      } finally {
        act(() => root.unmount());
      }
    });
});
