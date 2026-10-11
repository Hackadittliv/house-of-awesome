// Bekräftelsesidan får bokningsdetaljerna via sessionStorage i samma flik, aldrig via
// adressfältet, så att avbokningskoden inte hamnar i historik, loggar eller referrer.

export type StoredConfirmation = {
  bookingId: string;
  cancelToken: string;
  startsAt: string;
  title: string;
  location: string;
};

const KEY = "hoa-booking-confirmation";

export function saveConfirmation(value: StoredConfirmation): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(value));
  } catch {
    // Privat läge utan lagring: bekräftelsemejlet räcker.
  }
}

export function readConfirmation(): StoredConfirmation | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<StoredConfirmation>;
    return typeof value.bookingId === "string" && typeof value.cancelToken === "string" && typeof value.startsAt === "string"
      ? (value as StoredConfirmation)
      : null;
  } catch {
    return null;
  }
}
