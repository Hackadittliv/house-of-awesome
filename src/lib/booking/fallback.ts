import { LIA_ORIGIN } from "@/lib/referral";

/** Preserve the booking fallback without copying a visitor's arbitrary query into another origin. */
export function fallbackBookingDestination(pathname: string, query: URLSearchParams): URL {
  const cleanPath = /^\/boka(?:\/[a-z0-9-]+)?\/?$/.test(pathname) ? pathname.replace(/\/$/, "") : "/boka";
  const url = new URL(cleanPath, LIA_ORIGIN);
  url.searchParams.set("utm_source", "houseofawesome");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", "hoa_site");
  url.searchParams.set("utm_content", "redirect");

  // Cancellation and payment return keep only their existing, path-specific capability.
  const allowed: Record<string, RegExp> = cleanPath === "/boka/tack" ? { session_id: /^cs_(?:test_|live_)?[A-Za-z0-9]{6,240}$/ }
    : cleanPath === "/boka" ? { avboka: /^[A-Za-z0-9_-]{16,200}$/ } : {};
  for (const [key, pattern] of Object.entries(allowed)) {
    const values = query.getAll(key);
    if (values.length === 1 && pattern.test(values[0])) {
      url.searchParams.set(key, values[0]);
      return url;
    }
  }

  for (const [key, pattern] of [["amb", /^[A-Za-z0-9]{3,16}$/], ["tjanst", /^[a-z0-9-]{1,80}$/]] as const) {
    const values = query.getAll(key);
    if (values.length === 1 && pattern.test(values[0])) url.searchParams.set(key, values[0]);
  }
  // This fallback runs when booking is unconfigured and cannot verify the referral program.
  return url;
}
