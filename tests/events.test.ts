import { readFileSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import EventPage, { generateMetadata } from "@/app/event/longevity-experience-2027/page";
import EventsPage from "@/app/event-och-lokaler/page";
import { EventDetail } from "@/components/events/EventDetail";
import { getEventsSourceUrl } from "@/lib/event-source";
import { liaEventUrl, parseEventCatalog, readEventCatalog } from "@/lib/events";

const origin = "https://lia-preview.example";
const sourceUrl = `${origin}/events/catalog.json`;
const fixture = () => ({
  version: 1,
  events: [
    {
      id: "synthetic-event",
      slug: "longevity-experience-2027",
      title: "Syntetisk testhelg",
      summary: "Ett gemensamt testinnehåll.",
      startAt: "2030-01-25T13:00:00+01:00",
      endAt: "2030-01-27T13:00:00+01:00",
      datesLabel: "25–27 januari 2030",
      timeLabel: "Fredag 13 till söndag 13",
      status: "interest",
      location: { name: "Testhuset", city: "Testorten", address: "Exempelvägen 1" },
      price: { amount: 1234, currency: "SEK", label: "1 234 kr", note: "Priset är ett testutkast." },
      heroImage: { src: "/event-images/test.webp", alt: "En syntetisk testbild" },
      introduction: { heading: "Testintroduktion", text: "Introduktionens hela innehåll." },
      experiences: [{ title: "En upplevelse", text: "Upplevelsens innehåll." }],
      program: [
        { day: "Fredag", date: "25 januari", title: "Testprogram", text: "Programmets hela innehåll." },
      ],
      hosts: [
        {
          name: "Testvärd",
          role: "Värd i testet",
          text: "Värdens hela beskrivning.",
          image: "event-images/host.webp",
        },
      ],
      included: ["En syntetisk inkluderad punkt"],
      pending: ["En detalj återstår"],
      faq: [{ question: "Är detta ett test?", answer: "Ja, ingen verklig anmälan genomförs." }],
    },
  ],
});
const response = (value: unknown) =>
  new Response(JSON.stringify(value), { headers: { "Content-Type": "application/json; charset=utf-8" } });
function mockFeed(value: unknown) {
  vi.stubEnv("LIA_EVENTS_SOURCE_URL", sourceUrl);
  const mock = vi.fn<typeof fetch>().mockResolvedValue(response(value));
  vi.stubGlobal("fetch", mock);
  return mock;
}
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("LIA:s gemensamma eventkontrakt", () => {
  it.runIf(Boolean(process.env.LIA_EVENTS_CONTRACT_FILE))("accepterar den oförändrade LIA-katalogen", () => {
    const raw: unknown = JSON.parse(readFileSync(process.env.LIA_EVENTS_CONTRACT_FILE!, "utf8"));
    const sourceOrigin = getEventsSourceUrl()!.origin;
    const events = parseEventCatalog(raw, sourceOrigin);
    const event = events.find((event) => event.slug === "longevity-experience-2027");
    expect(event).toBeDefined();
    if (!event) throw new Error("Expected event missing from supplied catalog");
    const html = renderToStaticMarkup(createElement(EventDetail, { event, sourceOrigin }));
    expect(html).toContain(event.title);
    expect(html).toContain(event.datesLabel);
    expect(html).toContain(event.price.label);
    expect(html).not.toMatch(/<form\b|checkout|stripe/i);
  });

  it("läser hela innehållet och löser båda bildtyperna mot feedens origin", () => {
    const [event] = parseEventCatalog(fixture(), origin);
    expect(event.heroImage.src).toBe(`${origin}/event-images/test.webp`);
    expect(event.hosts[0].image).toBe(`${origin}/event-images/host.webp`);
    expect(event.program[0].text).toBe("Programmets hela innehåll.");
    expect(event.pending).toEqual(["En detalj återstår"]);
  });

  it.each([
    (feed: ReturnType<typeof fixture>) => {
      feed.version = 2;
    },
    (feed: ReturnType<typeof fixture>) => {
      feed.events[0].status = "published";
    },
    (feed: ReturnType<typeof fixture>) => {
      feed.events[0].endAt = feed.events[0].startAt;
    },
    (feed: ReturnType<typeof fixture>) => {
      feed.events[0].price.amount = Number.NaN;
    },
    (feed: ReturnType<typeof fixture>) => {
      feed.events[0].slug = "../another-page";
    },
    (feed: ReturnType<typeof fixture>) => {
      feed.events[0].heroImage.src = "https://other.example/picture.webp";
    },
    (feed: ReturnType<typeof fixture>) => {
      feed.events[0].hosts[0].image = "javascript:alert(1)";
    },
  ])("avvisar ogiltiga, framtida kontrakt och otillåtna bilder", (change) => {
    const feed = fixture();
    change(feed);
    expect(() => parseEventCatalog(feed, origin)).toThrow();
  });

  it("avvisar saknade innehållsfält och tvetydiga event", () => {
    expect(() =>
      parseEventCatalog({ version: 1, events: [{ slug: "longevity-experience-2027" }] }, origin),
    ).toThrow();
    const feed = fixture();
    feed.events.push({ ...feed.events[0] });
    expect(() => parseEventCatalog(feed, origin)).toThrow();
  });

  it("länkar till den gemensamma anmälan med källan hoa", () => {
    const url = new URL(liaEventUrl(origin, "longevity-experience-2027"));
    expect(url.origin).toBe(origin);
    expect(url.pathname).toBe("/event/longevity-experience-2027");
    expect(Object.fromEntries(url.searchParams)).toEqual({ source: "hoa" });
    expect(url.hash).toBe("#intresse");
    expect(getEventsSourceUrl("http://127.0.0.1:5173/events/catalog.json")?.origin).toBe(
      "http://127.0.0.1:5173",
    );
  });
});

describe("serverläsning som stänger vid fel", () => {
  it("hämtar enbart den angivna källan utan credentials, redirects eller gammal cache", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response(fixture()));
    const result = await readEventCatalog({ sourceUrl, fetcher });
    expect(result.events).toHaveLength(1);
    expect(fetcher).toHaveBeenCalledWith(
      sourceUrl,
      expect.objectContaining({
        credentials: "omit",
        cache: "no-store",
        redirect: "error",
        signal: expect.any(AbortSignal),
      }),
    );
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("läser inte alls vid en ogiltig källkonfiguration", async () => {
    const fetcher = vi.fn<typeof fetch>();
    const result = await readEventCatalog({
      sourceUrl: "https://user:password@lia-preview.example/events/catalog.json",
      fetcher,
    });
    expect(result.events).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it.each([
    () => Promise.reject(new Error("offline")),
    () => Promise.resolve(new Response("missing", { status: 404 })),
    () =>
      Promise.resolve(new Response("<html>Fallback</html>", { headers: { "Content-Type": "text/html" } })),
    () => Promise.resolve(new Response("{broken", { headers: { "Content-Type": "application/json" } })),
    () => Promise.resolve(response({ version: 1, events: "wrong-shape" })),
    () =>
      Promise.resolve(
        new Response("x".repeat(256 * 1024 + 1), { headers: { "Content-Type": "application/json" } }),
      ),
  ])("visar inga påhittade event vid läsfel eller felaktigt svar", async (reply) => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation(reply);
    expect((await readEventCatalog({ sourceUrl, fetcher })).events).toBeNull();
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("avslutar även när transporten inte svarar på avbrottet", async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn<typeof fetch>().mockImplementation(() => new Promise(() => {}));
    const pending = readEventCatalog({ sourceUrl, fetcher, timeoutMs: 20 });
    await vi.advanceTimersByTimeAsync(21);
    expect((await pending).events).toBeNull();
    expect(fetcher.mock.calls[0][1]?.signal?.aborted).toBe(true);
  });
});

describe("HOA:s faktiska serverrendering", () => {
  it("visar hela giltiga eventet, samma LIA-mål och öppen intresseanmälan", async () => {
    mockFeed(fixture());
    const html = renderToStaticMarkup(await EventPage());
    for (const text of [
      "Syntetisk testhelg",
      "Testintroduktion",
      "Upplevelsens innehåll",
      "Programmets hela innehåll",
      "Värdens hela beskrivning",
      "En syntetisk inkluderad punkt",
      "En detalj återstår",
      "Är detta ett test?",
      "1 234 kr",
    ])
      expect(html).toContain(text);
    expect(html).toContain("Anmäl intresse hos Life Is Awesome");
    expect(html).toContain("https://lia-preview.example/event/longevity-experience-2027?source=hoa#intresse");
    expect(html).toContain(`${origin}/event-images/test.webp`);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).not.toMatch(/<form\b|checkout|stripe/i);
  });

  it("visar eventkort endast när feedposten finns", async () => {
    mockFeed(fixture());
    const html = renderToStaticMarkup(await EventsPage());
    expect(html).toContain('href="/event/longevity-experience-2027"');
    expect(html).toContain("Syntetisk testhelg");
  });

  it("visar samma program först på den befintliga kalendern och behåller den vanliga hyrförfrågan", async () => {
    mockFeed(fixture());
    const html = renderToStaticMarkup(await EventsPage());
    expect(html).toContain("Cirkeln");
    expect(html).toContain("Förfrågan om event");
    expect(html).toContain("Anmäl intresse hos Life Is Awesome");
    mockFeed(fixture());
    expect((await generateMetadata()).alternates?.canonical).toBe(
      `${origin}/event/longevity-experience-2027`,
    );
  });

  it.each(["missing", "preview"])("döljer ej öppna event på båda sidor (%s)", async (state) => {
    const feed = fixture();
    if (state === "missing") feed.events = [];
    else feed.events[0].status = "preview";
    mockFeed(feed);
    await expect(EventPage()).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    mockFeed(feed);
    const listing = renderToStaticMarkup(await EventsPage());
    expect(listing).not.toContain("Syntetisk testhelg");
    expect(listing).toContain("Cirkeln");
  });

  it("ger en säker direktlänk och behåller kalendern när LIA-katalogen är otillgänglig", async () => {
    mockFeed({ version: -1 });
    const detail = renderToStaticMarkup(await EventPage());
    expect(detail).toContain("Eventinformationen kunde inte hämtas just nu");
    expect(detail).toContain(`href="${origin}/event/longevity-experience-2027?source=hoa#intresse"`);
    expect(detail).not.toContain("1 234 kr");
    mockFeed({ version: -1 });
    expect(renderToStaticMarkup(await EventsPage())).toContain("Förfrågan om event");
  });
});
