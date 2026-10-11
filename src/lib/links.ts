import { site } from "@/lib/content";

export const SHORT_CALL_SLUG = "forsta-halsosamtal";

function withUtm(base: string, placement: string, extra: Record<string, string> = {}) {
  const url = new URL(base);
  for (const [key, value] of Object.entries(extra)) url.searchParams.set(key, value);
  url.searchParams.set("utm_source", site.booking.utmSource);
  url.searchParams.set("utm_medium", site.booking.utmMedium);
  url.searchParams.set("utm_campaign", site.booking.utmCampaign);
  url.searchParams.set("utm_content", placement);
  return url.toString();
}

export function bookingUrl(slug: string | null, placement: string): string {
  const base = slug ? `${site.booking.base}/${encodeURIComponent(slug)}` : site.booking.base;
  return withUtm(base, placement);
}

export function inquiryUrl(serviceSlug: string, placement: string): string {
  return bookingUrl(SHORT_CALL_SLUG, `${placement}_${serviceSlug}`);
}

export function membershipUrl(priceId: string | null, placement: string): string {
  return withUtm(site.booking.membership, placement, priceId ? { plan: priceId } : {});
}

export function b2bUrl(placement: string): string {
  return withUtm(site.booking.b2b, placement);
}

export function mailtoUrl(subject?: string): string {
  return subject
    ? `mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}`
    : `mailto:${site.contact.email}`;
}

export function telUrl(): string {
  return `tel:${site.contact.phone}`;
}

export function mapsUrl(): string {
  const { street, postalCode, city } = site.address;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${street}, ${postalCode} ${city}`)}`;
}
