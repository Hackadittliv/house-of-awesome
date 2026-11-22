export const DEFAULT_EVENTS_SOURCE = "https://lifeisawesome.se/events/catalog.json";

/** Server configuration only. A preview may use its own public LIA origin. */
export function getEventsSourceUrl(
  value = process.env.LIA_EVENTS_SOURCE_URL ?? DEFAULT_EVENTS_SOURCE,
): URL | null {
  try {
    const url = new URL(value);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (
      (url.protocol !== "https:" && !(local && url.protocol === "http:")) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !url.pathname.endsWith("/catalog.json")
    )
      return null;
    return url;
  } catch {
    return null;
  }
}
