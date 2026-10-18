import { BOOKING_SITE, PRIVACY_NOTICE_VERSION, liaSupabaseAnonKey, liaSupabaseUrl } from "@/lib/booking/config";

export type EventTypeInfo = {
  slug: string;
  title_sv: string;
  description_sv: string | null;
  duration_minutes: number;
  price_label_sv: string | null;
  location_type: "meet" | "phone" | "in_person";
  requires_payment: boolean;
  price_id: string | null;
  phone_required: boolean;
};

export type Slot = { start: string; end: string };

export type AvailabilityResult =
  | { kind: "slots"; eventType: EventTypeInfo; slots: Slot[] }
  /** LIA säger att tjänsten bara tas emot som förfrågan just nu. */
  | { kind: "request_only" };

export class BookingApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "BookingApiError";
  }
}

async function callFunction<T>(name: string, body: Record<string, unknown>, accessToken?: string): Promise<T> {
  const response = await fetch(`${liaSupabaseUrl}/functions/v1/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: liaSupabaseAnonKey,
      // Inloggad (t.ex. Studion): användarens token, annars anon key.
      Authorization: `Bearer ${accessToken ?? liaSupabaseAnonKey}`,
    },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const message = typeof data.error === "string" ? data.error : `HTTP ${response.status}`;
    throw new BookingApiError(response.status, message);
  }
  return data as T;
}

export async function getAvailability(slug: string, fromDate: string, toDate: string): Promise<AvailabilityResult> {
  try {
    const data = await callFunction<{ event_type: EventTypeInfo; slots: Slot[] }>("get-availability", {
      event_type_slug: slug,
      from_date: fromDate,
      to_date: toDate,
    });
    return { kind: "slots", eventType: data.event_type, slots: data.slots };
  } catch (error) {
    // 404: tjänsten är inte publik för direktbokning (t.ex. inquiry_only).
    // 409: direktbokning stängd eller sessionen tillfälligt endast via förfrågan.
    if (error instanceof BookingApiError && (error.status === 404 || error.status === 409)) {
      return { kind: "request_only" };
    }
    throw error;
  }
}

export type BookingInput = {
  eventTypeSlug: string;
  startAt: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  locationType: EventTypeInfo["location_type"];
  utm: Record<string, string>;
};

export type BookingResult = {
  booking_id: string;
  cancel_token: string;
  starts_at: string;
  ends_at: string;
  requires_payment?: boolean;
  price_id?: string;
  meeting_url?: string | null;
};

export function createBooking(input: BookingInput): Promise<BookingResult> {
  return callFunction<BookingResult>("create-booking", {
    event_type_slug: input.eventTypeSlug,
    start_at: input.startAt,
    guest_name: input.name,
    guest_email: input.email,
    guest_phone: input.phone || null,
    guest_notes: input.notes || null,
    location_type: input.locationType,
    site: BOOKING_SITE,
    ...input.utm,
  });
}

export async function createCheckout(args: {
  bookingId: string;
  priceId: string;
  email: string;
  returnUrl: string;
}): Promise<string> {
  const data = await callFunction<{ clientSecret: string }>("create-checkout", {
    priceId: args.priceId,
    customerEmail: args.email,
    returnUrl: args.returnUrl,
    quantity: 1,
    requestId: crypto.randomUUID(),
    metadata: { booking_id: args.bookingId },
  });
  return data.clientSecret;
}

export type CancelResult = { ok: true; already: boolean; late: boolean };

export function cancelBooking(cancelToken: string): Promise<CancelResult> {
  return callFunction<CancelResult>("cancel-booking", { cancel_token: cancelToken });
}

/** Hämtar kalenderfilen. 409 betyder att betalningen ännu inte är bekräftad. */
export async function fetchIcs(
  capability: { sessionId: string } | { bookingId: string; cancelToken: string },
): Promise<string> {
  const body = "sessionId" in capability
    ? { session_id: capability.sessionId }
    : { booking_id: capability.bookingId, cancel_token: capability.cancelToken };
  const response = await fetch(`${liaSupabaseUrl}/functions/v1/booking-ics`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: liaSupabaseAnonKey,
      Authorization: `Bearer ${liaSupabaseAnonKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new BookingApiError(response.status, `HTTP ${response.status}`);
  return response.text();
}

/**
 * confirmed: betald och bokad. review: betald men tiden bekräftas manuellt.
 * pending: betalningen pågår eller är inte registrerad än. not_paid / unknown: ingen bokning.
 */
export type PaymentStatus = "confirmed" | "review" | "pending" | "not_paid" | "unknown";

const PAYMENT_STATUSES: readonly PaymentStatus[] = ["confirmed", "review", "pending", "not_paid", "unknown"];

export async function getPaymentStatus(sessionId: string): Promise<PaymentStatus> {
  const data = await callFunction<{ status?: unknown }>("booking-payment-status", { session_id: sessionId });
  return PAYMENT_STATUSES.find((status) => status === data.status) ?? "unknown";
}

export type InterestType = "free_10min" | "paid_60min" | "hbot" | "celloxy" | "coaching" | "other";

/**
 * Mottagare för en förfrågan. Utan route går den till husets inkorg.
 * Själva adressen slås upp i request-consultation på servern (vitlista),
 * så webbläsaren kan bara välja en känd nyckel, aldrig en fri adress.
 */
export type RequestRoute = "rebecca";

export type RequestInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  interestType: InterestType;
  message: string;
  sourceSlug: string | null;
  honeypot: string;
  utm: Record<string, string>;
  route?: RequestRoute;
};

export function requestConsultation(input: RequestInput): Promise<{ ok: true }> {
  return callFunction<{ ok: true }>("request-consultation", {
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    phone: input.phone,
    interest_type: input.interestType,
    coach_preference: "any",
    message: input.message || null,
    source_slug: input.sourceSlug,
    flow: "hoa_request",
    honeypot: input.honeypot,
    privacy_notice_acknowledged: true,
    privacy_notice_version: PRIVACY_NOTICE_VERSION,
    site: BOOKING_SITE,
    ...(input.route ? { route: input.route } : {}),
    ...input.utm,
  });
}

/** Studion: rumshyra för godkända instruktörer. Kräver inloggning mot LIA. */
export const STUDION_SLUG = "studion-hyra";

export async function getStudionSlots(fromDate: string, toDate: string, accessToken: string): Promise<Slot[]> {
  const data = await callFunction<{ slots: Slot[] }>(
    "get-availability",
    { event_type_slug: STUDION_SLUG, from_date: fromDate, to_date: toDate },
    accessToken,
  );
  return data.slots;
}

export function createStudionBooking(args: {
  startAt: string;
  hours: number;
  name: string;
  email: string;
  notes: string;
  accessToken: string;
}): Promise<BookingResult> {
  return callFunction<BookingResult>(
    "create-booking",
    {
      event_type_slug: STUDION_SLUG,
      start_at: args.startAt,
      hours: args.hours,
      guest_name: args.name,
      guest_email: args.email,
      guest_notes: args.notes || null,
      location_type: "in_person",
      site: BOOKING_SITE,
    },
    args.accessToken,
  );
}

/**
 * Skickar en inloggningslänk från LIA:s Supabase Auth. Länken leder tillbaka hit.
 * create_user: false, så bara befintliga konton (skapas när LIA-admin godkänner
 * instruktören) får en länk. Okänd e-post ger fel från Auth.
 */
export async function sendStudionLoginLink(email: string, redirectTo: string): Promise<void> {
  const response = await fetch(`${liaSupabaseUrl}/auth/v1/otp?redirect_to=${encodeURIComponent(redirectTo)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: liaSupabaseAnonKey },
    body: JSON.stringify({ email, create_user: false }),
  });
  if (!response.ok) throw new BookingApiError(response.status, `HTTP ${response.status}`);
}
