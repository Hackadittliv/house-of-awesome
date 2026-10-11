export const CONSENT_STORAGE_KEY = "hoa_consent_v1";
export const CONSENT_CHANGE_EVENT = "hoa-consent-change";

export type ConsentChoice = {
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
};

function validId(value: string | undefined, pattern: RegExp): string | null {
  return value && pattern.test(value) ? value : null;
}

// ID:n interpoleras i inline-skript, därför tillåts bara det format respektive tjänst använder.
export const trackers = {
  gaMeasurementId: validId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, /^G-[A-Z0-9]{4,20}$/),
  metaPixelId: validId(process.env.NEXT_PUBLIC_META_PIXEL_ID, /^\d{6,20}$/),
};

export function parseConsent(raw: string | null | undefined): ConsentChoice | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<ConsentChoice>;
    if (typeof value.analytics !== "boolean" || typeof value.marketing !== "boolean") {
      return null;
    }
    return {
      analytics: value.analytics,
      marketing: value.marketing,
      updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : "",
    };
  } catch {
    return null;
  }
}

export function createConsent(analytics: boolean, marketing: boolean): ConsentChoice {
  return { analytics, marketing, updatedAt: new Date().toISOString() };
}

export function isRevocation(previous: ConsentChoice | null, next: ConsentChoice): boolean {
  if (!previous) return false;
  return (previous.analytics && !next.analytics) || (previous.marketing && !next.marketing);
}

// Ett borttaget val i en annan flik räknas som att allt valfritt återkallas.
export function isStorageRevocation(oldRaw: string | null, newRaw: string | null): boolean {
  const next = parseConsent(newRaw) ?? { analytics: false, marketing: false, updatedAt: "" };
  return isRevocation(parseConsent(oldRaw), next);
}

const TRACKING_COOKIE = /^(_ga|_gid|_gat|_fbp|_fbc)/;

export function clearTrackingCookies(): void {
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const entry of document.cookie.split(";")) {
    const name = entry.split("=")[0]?.trim();
    if (!name || !TRACKING_COOKIE.test(name)) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}
