import { afterEach, describe, expect, it, vi } from "vitest";

import { findCopyViolations } from "../scripts/copy-rules.mjs";
import { createBooking, createStudionBooking, getAvailability, getStudionSlots, type BookingInput } from "@/lib/booking/api";
import { bookingCopy } from "@/lib/booking/copy";
import { addDays, groupSlotsByDay, interestFor, stockholmDate, utmFrom } from "@/lib/booking/format";
import { getBookableServices, getInquiryServices } from "@/lib/content";
import { bookingUrl, inquiryUrl, liaBookingUrl } from "@/lib/links";

describe("klinik i bokningsanrop", () => {
  const fromDate = "2026-11-04";
  const toDate = "2026-11-10";
  const guest: Omit<BookingInput, "eventTypeSlug" | "clinic"> = {
    startAt: "2026-11-05T09:00:00Z",
    name: "Test Person",
    email: "test@example.com",
    phone: "",
    notes: "",
    locationType: "in_person",
    utm: { utm_source: "houseofawesome", utm_content: "test" },
  };

  function captureRequest() {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ slots: [] })));
    vi.stubGlobal("fetch", fetchMock);
    return (endpoint: string, expectedBody: Record<string, unknown>) => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, init] = fetchMock.mock.calls[0];
      expect(String(url)).toMatch(new RegExp(`/functions/v1/${endpoint}$`, "u"));
      expect(init?.method).toBe("POST");
      expect(init?.body).toBe(JSON.stringify(expectedBody));
    };
  }

  afterEach(() => vi.unstubAllGlobals());

  it.each(getBookableServices())("$slug skickar rätt fullständig body för tillgänglighet", async (service) => {
    const checkRequest = captureRequest();
    await getAvailability(service.slug, fromDate, toDate, service.clinic);

    checkRequest("get-availability", {
      event_type_slug: service.slug,
      from_date: fromDate,
      to_date: toDate,
      ...(service.slug === "healing-emht" ? { clinic_slug: "hoa" } : {}),
    });
  });

  it.each(getBookableServices())("$slug skickar rätt fullständig body för bokning", async (service) => {
    const checkRequest = captureRequest();
    await createBooking({ ...guest, eventTypeSlug: service.slug, clinic: service.clinic });

    checkRequest("create-booking", {
      event_type_slug: service.slug,
      start_at: guest.startAt,
      guest_name: "Test Person",
      guest_email: "test@example.com",
      guest_phone: null,
      guest_notes: null,
      location_type: "in_person",
      site: "hoa",
      utm_source: "houseofawesome",
      utm_content: "test",
      ...(service.slug === "healing-emht" ? { clinic_slug: "hoa" } : {}),
    });
  });

  it.each([undefined, ""])("utelämnar klinik %s även för EMHT:s tillgänglighet", async (clinic) => {
    const checkRequest = captureRequest();
    await getAvailability("healing-emht", fromDate, toDate, clinic);
    checkRequest("get-availability", { event_type_slug: "healing-emht", from_date: fromDate, to_date: toDate });
  });

  it.each([undefined, ""])("utelämnar klinik %s även för EMHT:s bokning", async (clinic) => {
    const checkRequest = captureRequest();
    await createBooking({ ...guest, eventTypeSlug: "healing-emht", clinic });
    checkRequest("create-booking", {
      event_type_slug: "healing-emht",
      start_at: guest.startAt,
      guest_name: "Test Person",
      guest_email: "test@example.com",
      guest_phone: null,
      guest_notes: null,
      location_type: "in_person",
      site: "hoa",
      utm_source: "houseofawesome",
      utm_content: "test",
    });
  });

  it("behåller Studions tillgänglighetsanrop utan klinik", async () => {
    const checkRequest = captureRequest();
    await getStudionSlots(fromDate, toDate, "test-token");
    checkRequest("get-availability", { event_type_slug: "studion-hyra", from_date: fromDate, to_date: toDate });
  });

  it("behåller Studions bokningsanrop med site hoa utan klinik", async () => {
    const checkRequest = captureRequest();
    await createStudionBooking({ ...guest, hours: 2, accessToken: "test-token" });
    checkRequest("create-booking", {
      event_type_slug: "studion-hyra",
      start_at: guest.startAt,
      hours: 2,
      guest_name: "Test Person",
      guest_email: "test@example.com",
      guest_notes: null,
      location_type: "in_person",
      site: "hoa",
    });
  });
});

describe("bokningstexter", () => {
  it.each(Object.entries(bookingCopy))("%s följer copy-reglerna", (_key, text) => {
    expect(findCopyViolations(text)).toEqual([]);
  });
});

describe("bokningslänkar när HOA-bokningen är på", () => {
  it.each(getBookableServices().map((service) => service.slug))("%s bokas på houseofawesome.se", (slug) => {
    expect(bookingUrl(slug, "test", true)).toBe(`/boka/${slug}`);
  });

  it.each(getInquiryServices().map((service) => service.slug))("%s går till förfrågan med tjänsten", (slug) => {
    expect(inquiryUrl(slug, "card", true)).toBe(`/boka/forfragan?tjanst=${slug}`);
  });

  it("startsidan för bokning ligger på HOA", () => {
    expect(bookingUrl(null, "header", true)).toBe("/boka");
  });

  it("reservlänken går fortfarande till LIA med utm", () => {
    const url = new URL(liaBookingUrl("hbot-60", "booking_fallback"));
    expect(url.origin).toBe("https://lifeisawesome.se");
    expect(url.searchParams.get("utm_source")).toBe("houseofawesome");
  });
});

describe("bokningshjälpare", () => {
  it("räknar dagar över månadsskifte", () => {
    expect(addDays("2026-10-30", 3)).toBe("2026-11-02");
    expect(addDays("2026-11-02", -7)).toBe("2026-10-26");
  });

  it("grupperar tider per dag i svensk tid", () => {
    const days = groupSlotsByDay([
      { start: "2026-11-02T23:30:00Z", end: "2026-11-03T00:30:00Z" },
      { start: "2026-11-02T08:00:00Z", end: "2026-11-02T09:00:00Z" },
    ]);
    expect(days.size).toBe(2);
    expect(days.get("2026-11-03")).toHaveLength(1);
    expect(stockholmDate(new Date("2026-11-02T23:30:00Z"))).toBe("2026-11-03");
  });

  it("förfrågan får samma intressekategori som i LIA:s formulär", () => {
    expect(interestFor("hbot-60")).toBe("hbot");
    expect(interestFor("ihht-50")).toBe("celloxy");
    expect(interestFor("coaching-45")).toBe("coaching");
    expect(interestFor("forsta-halsosamtal")).toBe("free_10min");
    expect(interestFor("vitamindropp")).toBe("other");
    expect(interestFor(null)).toBe("other");
  });

  it("tar bara med kända utm-parametrar", () => {
    expect(utmFrom("?utm_source=ig&utm_campaign=host&avboka=x&email=a@b.se")).toEqual({
      utm_source: "ig",
      utm_campaign: "host",
    });
  });
});
