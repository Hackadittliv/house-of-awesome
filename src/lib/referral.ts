import { programEnabled, subscribeProgram } from "./reach-status";
// The public code is a candidate. Only LIA can bind it to a customer or a purchase.
export const LIA_ORIGIN = "https://lifeisawesome.se";
const LIVE_CODE = /^LA[A-HJ-NP-Z2-9]{8}$/;
const REFERRAL_CHANGE = "hoa:referral-change";

/** Ref-bearing documents stay free of analytics, including after an embedded form clears its code. */
export function isReferralDocument(): boolean {
  if (typeof window === "undefined") return false;
  const entry = window as Window & { __hoaReferralDocument?: boolean };
  return entry.__hoaReferralDocument === true || new URLSearchParams(window.location.search).has("ref");
}

export function normalizeReferralCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const code = value.trim().toUpperCase();
  return LIVE_CODE.test(code) ? code : null;
}

export function referralFromSearch(search: string): string | null {
  const values = new URLSearchParams(search).getAll("ref");
  return values.length === 1 ? normalizeReferralCode(values[0]) : null;
}

/** The visit carries only the public code in first-party links. No browser storage is needed. */
export function readReferralCode(): string | null {
  return typeof window === "undefined" || !programEnabled() ? null : referralFromSearch(window.location.search);
}

/** Apply an explicit choice acknowledged by the current embedded form. */
export function setReferralCode(code: string | null): void {
  if (code !== null && (!programEnabled() || normalizeReferralCode(code) !== code)) return;
  const url = new URL(window.location.href);
  if (code) {
    (window as Window & { __hoaReferralDocument?: boolean }).__hoaReferralDocument = true;
    url.searchParams.set("ref", code);
  }
  else if (referralFromSearch(url.search)) url.searchParams.delete("ref");
  window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  window.dispatchEvent(new Event(REFERRAL_CHANGE));
}

export function subscribeReferral(notify: () => void): () => void {
  const unsubscribe = referralFromSearch(window.location.search) ? subscribeProgram(notify) : null;
  window.addEventListener(REFERRAL_CHANGE, notify);
  window.addEventListener("popstate", notify);
  return () => {
    unsubscribe?.();
    window.removeEventListener(REFERRAL_CHANGE, notify);
    window.removeEventListener("popstate", notify);
  };
}

export function referralBody(value: unknown): { ambassadorCode?: string } {
  const code = normalizeReferralCode(value);
  return code ? { ambassadorCode: code } : {};
}

/** Only add the candidate to our own service links or the canonical LIA site. */
export function referralHref(href: string, value: unknown): string {
  const code = normalizeReferralCode(value);
  if (!code) return href;
  const internal = href.startsWith("/") && !href.startsWith("//");
  if (!internal && !href.startsWith(LIA_ORIGIN + "/") && href !== LIA_ORIGIN) return href;
  let url: URL;
  try {
    url = new URL(href, "https://houseofawesome.se");
  } catch {
    return href;
  }
  if (url.username || url.password || url.origin !== (internal ? "https://houseofawesome.se" : LIA_ORIGIN)) return href;
  if (/^\/(?:avboka|boka\/tack|presentkort\/tack|auth|admin|villkor|integritetspolicy)(?:\/|$)/.test(url.pathname)) return href;
  // Preserve destinations which already have an explicit referral, including legacy codes.
  if (url.searchParams.has("ref") || url.searchParams.has("amb")) return href;
  url.searchParams.set("ref", code);
  return internal ? url.pathname + url.search + url.hash : url.href;
}
