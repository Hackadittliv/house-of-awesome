import "server-only";

import { DEFAULT_EVENTS_SOURCE, getEventsSourceUrl } from "@/lib/event-source";

export type CatalogEvent = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  startAt: string;
  endAt: string;
  datesLabel: string;
  timeLabel: string;
  status: "preview" | "interest";
  location: { name: string; city: string; address: string };
  price: { amount: number; currency: string; label: string; note: string };
  heroImage: { src: string; alt: string };
  introduction: { heading: string; text: string };
  experiences: { title: string; text: string }[];
  program: { day: string; date: string; title: string; text: string }[];
  hosts: { name: string; role: string; text: string; image?: string }[];
  included: string[];
  pending: string[];
  faq: { question: string; answer: string }[];
};

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("invalid_catalog");
  return value as Record<string, unknown>;
}
function text(value: unknown, max = 10000): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new Error("invalid_catalog");
  return value;
}
function array<T>(value: unknown, parse: (item: unknown) => T, max = 40): T[] {
  if (!Array.isArray(value) || value.length > max) throw new Error("invalid_catalog");
  return value.map(parse);
}
function image(value: unknown, origin: string): string {
  const url = new URL(text(value, 2000), `${origin}/`);
  if (url.origin !== origin || url.username || url.password || !["http:", "https:"].includes(url.protocol)) {
    throw new Error("invalid_catalog_image");
  }
  return url.href;
}
function moment(value: unknown): string {
  const result = text(value, 64);
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(result) ||
    !Number.isFinite(Date.parse(result))
  ) {
    throw new Error("invalid_catalog_time");
  }
  return result;
}

/** No local event defaults: the entire versioned catalog must be valid. */
export function parseEventCatalog(value: unknown, origin: string): CatalogEvent[] {
  const catalog = object(value);
  if (catalog.version !== 1) throw new Error("unsupported_catalog");
  const events = array(
    catalog.events,
    (item): CatalogEvent => {
      const event = object(item),
        location = object(event.location),
        price = object(event.price);
      const hero = object(event.heroImage),
        introduction = object(event.introduction);
      const startAt = moment(event.startAt),
        endAt = moment(event.endAt);
      const slug = text(event.slug, 100);
      if (
        (event.status !== "preview" && event.status !== "interest") ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
        Date.parse(endAt) <= Date.parse(startAt) ||
        typeof price.amount !== "number" ||
        !Number.isFinite(price.amount) ||
        price.amount < 0 ||
        price.amount > Number.MAX_SAFE_INTEGER ||
        typeof price.currency !== "string" ||
        !/^[A-Z]{3}$/.test(price.currency)
      )
        throw new Error("invalid_catalog");
      return {
        id: text(event.id, 100),
        slug,
        title: text(event.title, 300),
        summary: text(event.summary, 1500),
        startAt,
        endAt,
        datesLabel: text(event.datesLabel, 200),
        timeLabel: text(event.timeLabel, 200),
        status: event.status,
        location: {
          name: text(location.name, 300),
          city: text(location.city, 200),
          address: text(location.address, 500),
        },
        price: {
          amount: price.amount,
          currency: price.currency,
          label: text(price.label, 200),
          note: text(price.note, 1000),
        },
        heroImage: { src: image(hero.src, origin), alt: text(hero.alt, 500) },
        introduction: { heading: text(introduction.heading, 300), text: text(introduction.text) },
        experiences: array(event.experiences, (item) => {
          const row = object(item);
          return { title: text(row.title, 300), text: text(row.text) };
        }),
        program: array(event.program, (item) => {
          const row = object(item);
          return {
            day: text(row.day, 100),
            date: text(row.date, 100),
            title: text(row.title, 300),
            text: text(row.text),
          };
        }),
        hosts: array(event.hosts, (item) => {
          const row = object(item);
          return {
            name: text(row.name, 200),
            role: text(row.role, 300),
            text: text(row.text),
            ...(row.image === undefined ? {} : { image: image(row.image, origin) }),
          };
        }),
        included: array(event.included, (item) => text(item, 1000)),
        pending: array(event.pending, (item) => text(item, 1000)),
        faq: array(event.faq, (item) => {
          const row = object(item);
          return { question: text(row.question, 500), answer: text(row.answer) };
        }),
      };
    },
    50,
  );
  if (
    new Set(events.map((event) => event.id)).size !== events.length ||
    new Set(events.map((event) => event.slug)).size !== events.length
  ) {
    throw new Error("ambiguous_catalog");
  }
  return events;
}

export type EventCatalogRead = { sourceOrigin: string; events: CatalogEvent[] | null };
const MAX_BYTES = 256 * 1024;
async function readJson(response: Response): Promise<unknown> {
  if (!response.ok || !response.headers.get("content-type")?.includes("application/json") || !response.body)
    throw new Error("catalog_unavailable");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) throw new Error("catalog_size_limit");
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}

export async function readEventCatalog({
  sourceUrl,
  fetcher = fetch,
  timeoutMs = 5000,
}: {
  sourceUrl?: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
} = {}): Promise<EventCatalogRead> {
  const source = getEventsSourceUrl(sourceUrl);
  const sourceOrigin = source?.origin ?? new URL(DEFAULT_EVENTS_SOURCE).origin;
  if (!source) return { sourceOrigin, events: null };
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error("catalog_timeout"));
    }, timeoutMs);
  });
  try {
    const request = fetcher(source.href, {
      signal: controller.signal,
      cache: "no-store",
      credentials: "omit",
      redirect: "error",
      headers: { Accept: "application/json" },
    })
      .then(readJson)
      .then((value) => parseEventCatalog(value, sourceOrigin));
    return { sourceOrigin, events: await Promise.race([request, timeout]) };
  } catch {
    return { sourceOrigin, events: null };
  } finally {
    clearTimeout(timer);
  }
}

export const HOA_EVENT_SLUG = "longevity-experience-2027";

export function liaEventUrl(sourceOrigin: string, slug: string): string {
  const url = new URL(`/event/${encodeURIComponent(slug)}`, sourceOrigin);
  url.searchParams.set("source", "hoa");
  url.hash = "intresse";
  return url.href;
}
