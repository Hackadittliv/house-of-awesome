// Bekräftelsesidan får bokningsdetaljerna via sessionStorage i samma flik, aldrig via
// adressfältet, så att avbokningskoden inte hamnar i historik, loggar eller referrer.
// Detaljerna tas bort ur lagringen när de lästs och finns sedan bara i minnet.

import type { PaymentStatus } from "@/lib/booking/api";

export type StoredConfirmation = {
  bookingId: string;
  cancelToken: string;
  startsAt: string;
  title: string;
  location: string;
  slug: string;
  requiresPayment: boolean;
};

const KEY = "hoa-booking-confirmation";

let current: { value: StoredConfirmation | null } | null = null;

export function saveConfirmation(value: StoredConfirmation): void {
  current = null;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // Privat läge utan lagring: bekräftelsemejlet räcker.
  }
}

function parse(raw: string | null): StoredConfirmation | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<StoredConfirmation>;
    return typeof value.bookingId === "string" &&
      typeof value.cancelToken === "string" &&
      typeof value.startsAt === "string" &&
      typeof value.slug === "string" &&
      typeof value.requiresPayment === "boolean"
      ? (value as StoredConfirmation)
      : null;
  } catch {
    return null;
  }
}

export type PaymentView = "confirmed" | "review" | "not_paid" | "checking";

/**
 * Vad tacksidan visar. En bokning som kräver betalning visas aldrig som bekräftad
 * förrän LIA har svarat att betalningen är klar.
 */
export function confirmationView(args: {
  sessionId: string | null;
  details: StoredConfirmation | null;
  paymentStatus: PaymentStatus | null;
}): PaymentView | "free_confirmed" | "missing" {
  const { sessionId, details, paymentStatus } = args;
  if (sessionId) {
    if (paymentStatus === "confirmed") return "confirmed";
    if (paymentStatus === "review") return "review";
    if (paymentStatus === "not_paid" || paymentStatus === "unknown") return "not_paid";
    return "checking";
  }
  if (!details) return "missing";
  return details.requiresPayment ? "not_paid" : "free_confirmed";
}

export function readConfirmation(): StoredConfirmation | null {
  if (current) return current.value;
  let raw: string | null = null;
  try {
    raw = window.sessionStorage.getItem(KEY);
    window.sessionStorage.removeItem(KEY);
  } catch {
    raw = null;
  }
  current = { value: parse(raw) };
  return current.value;
}
