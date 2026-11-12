// Presentkort säljs via LIA:s create-checkout (priceId "gift_card_custom").
// Gränserna speglar GIFT_CARD_MIN_SEK / GIFT_CARD_MAX_SEK i LIA:s edge function.
// Kampanjvärdet räknas på servern. Klienten visar svaret och skickar bara det betalda beloppet.
import { liaSupabaseAnonKey, liaSupabaseUrl } from "@/lib/booking/config";

export const GIFT_CARD_PRICE_ID = "gift_card_custom";
export const GIFT_CARD_MIN_SEK = 200;
export const GIFT_CARD_MAX_SEK = 20000;
export const GIFT_CARD_PRESETS = [500, 1000, 1500, 2500] as const;
export const RECIPIENT_NAME_MAX = 120;
export const GIFT_MESSAGE_MAX = 400;

/** Inklusive sista sekunden, väggklocka i Europe/Stockholm. */
export const GIFT_CARD_OFFER_ENDS_AT = "2027-11-12 23:59:59";
export const GIFT_CARD_OFFER_TIME_ZONE = "Europe/Stockholm";
export const GIFT_CARD_OFFER_LINE =
  "Använd koden Awesome2027 så lägger vi på 20 % extra, oavsett belopp.";
export const GIFT_CARD_PROMO_UNREACHABLE =
  "Koden kunde inte kontrolleras just nu. Köpet går igenom utan kampanjkod.";
export const GIFT_CARD_PROMO_CHECKING = "Kontrollerar koden.";
export const GIFT_CARD_PROMO_DEBOUNCE_MS = 400;
/** En hängande förhandsvisning får inte blockera köpet längre än så. */
export const GIFT_CARD_PROMO_TIMEOUT_MS = 5_000;
export const GIFT_CARD_RECEIPT_STORAGE_KEY = "hoa-gift-card-receipt";

const GIFT_CARD_METADATA_KEYS = [
  "gift_card_amount_sek",
  "purchaser_email",
  "purchaser_name",
  "recipient_email",
  "recipient_name",
  "gift_message",
] as const;

const NOMINAL_KEY = /value|nominal|face|bonus/i;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type GiftCardInput = {
  amountSek: number;
  buyerEmail: string;
  buyerName?: string;
  recipientName?: string;
  recipientEmail?: string;
  message?: string;
};

export type GiftCardError = "amount" | "email" | "name" | "recipientEmail" | "tooLong";

export function validateGiftCard(input: GiftCardInput): GiftCardError | null {
  if (!Number.isInteger(input.amountSek) || input.amountSek < GIFT_CARD_MIN_SEK || input.amountSek > GIFT_CARD_MAX_SEK) {
    return "amount";
  }
  if (!EMAIL.test(input.buyerEmail.trim())) return "email";
  if (!input.buyerName?.trim()) return "name";
  const recipientEmail = input.recipientEmail?.trim() ?? "";
  if (recipientEmail && !EMAIL.test(recipientEmail)) return "recipientEmail";
  if ((input.recipientName?.trim().length ?? 0) > RECIPIENT_NAME_MAX) return "tooLong";
  if ((input.message?.trim().length ?? 0) > GIFT_MESSAGE_MAX) return "tooLong";
  return null;
}

/** Metadata exakt enligt LIA:s allowlist för gift_card_custom. Tomma fält skickas inte. */
export function giftCardMetadata(input: GiftCardInput): Record<string, string> {
  const metadata: Record<string, string> = {
    gift_card_amount_sek: String(input.amountSek),
    purchaser_email: input.buyerEmail.trim().toLowerCase(),
  };
  const optional: Array<[string, string | undefined]> = [
    ["purchaser_name", input.buyerName?.trim()],
    ["recipient_name", input.recipientName?.trim()],
    ["recipient_email", input.recipientEmail?.trim().toLowerCase()],
    ["gift_message", input.message?.trim()],
  ];
  for (const [key, value] of optional) if (value) metadata[key] = value;
  return metadata;
}

export function formatSek(amount: number): string {
  return `${amount.toLocaleString("sv-SE")} kr`;
}

/** "YYYY-MM-DD HH:mm:ss" i Europe/Stockholm. Jämförs lexikografiskt, inklusive CET och CEST. */
export function stockholmDateTime(date: Date): string {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: GIFT_CARD_OFFER_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "00";
  const hour = get("hour") === "24" ? "00" : get("hour");
  return `${get("year")}-${get("month")}-${get("day")} ${hour}:${get("minute")}:${get("second")}`;
}

export function isGiftCardOfferOpen(now: Date = new Date()): boolean {
  return stockholmDateTime(now) <= GIFT_CARD_OFFER_ENDS_AT;
}

/**
 * Kampanjen är av tills LIA:s funktioner är deployade.
 * Sätt NEXT_PUBLIC_GIFT_PROMO_ENABLED=true i byggmiljön. Allt annat är av.
 * Då döljs både raden och kodfältet, och klienten varken validerar eller skickar promoCode.
 */
export function isGiftPromoEnabled(flag: string | undefined = process.env.NEXT_PUBLIC_GIFT_PROMO_ENABLED): boolean {
  return flag === "true";
}

export function showGiftCardOffer(now: Date = new Date(), flag?: string): boolean {
  return isGiftPromoEnabled(flag) && isGiftCardOfferOpen(now);
}

export type GiftCardPromoPreview =
  | { state: "empty" }
  | {
      state: "valid";
      code: string;
      displayCode: string;
      bonusPercent: number;
      paidSek: number;
      valueSek: number;
      message: string;
    }
  | { state: "invalid"; reason: string; message: string }
  | { state: "unreachable" };

function isWholeSek(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

/** Ofullständigt giltigt svar behandlas som otillgängligt, så klienten inte lovar en bonus. */
export function parseGiftCardPromoPreview(data: unknown): GiftCardPromoPreview {
  if (!data || typeof data !== "object") return { state: "unreachable" };
  const body = data as Record<string, unknown>;
  if (body.valid === true) {
    const { message, paidSek, valueSek, displayCode, code, bonusPercent } = body;
    if (
      typeof message !== "string" ||
      !message.trim() ||
      !isWholeSek(paidSek) ||
      !isWholeSek(valueSek) ||
      typeof displayCode !== "string" ||
      !displayCode.trim() ||
      typeof code !== "string" ||
      !code.trim() ||
      typeof bonusPercent !== "number" ||
      !Number.isFinite(bonusPercent)
    ) {
      return { state: "unreachable" };
    }
    return { state: "valid", message, paidSek, valueSek, displayCode, code, bonusPercent };
  }
  if (body.valid === false) {
    const message = typeof body.message === "string" && body.message.trim() ? body.message : "Koden stämmer inte.";
    const reason = typeof body.reason === "string" && body.reason.trim() ? body.reason : "unknown";
    return { state: "invalid", reason, message };
  }
  return { state: "unreachable" };
}

function withTimeout(signal: AbortSignal | undefined, timeoutMs: number): { signal: AbortSignal; cancel: () => void } {
  const timeout = new AbortController();
  const timer = setTimeout(() => timeout.abort(), timeoutMs);
  const combined = signal ? AbortSignal.any([signal, timeout.signal]) : timeout.signal;
  return {
    signal: combined,
    cancel: () => clearTimeout(timer),
  };
}

export async function previewGiftCardPromo(input: {
  promoCode: string;
  amountSek: number;
  priceId?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
}): Promise<GiftCardPromoPreview> {
  const promoCode = input.promoCode.trim();
  if (!promoCode) return { state: "empty" };
  const timed = withTimeout(input.signal, input.timeoutMs ?? GIFT_CARD_PROMO_TIMEOUT_MS);
  try {
    const response = await fetch(`${liaSupabaseUrl}/functions/v1/validate-gift-card-promo`, {
      method: "POST",
      signal: timed.signal,
      headers: {
        "Content-Type": "application/json",
        apikey: liaSupabaseAnonKey,
        Authorization: `Bearer ${liaSupabaseAnonKey}`,
      },
      body: JSON.stringify({
        promoCode,
        amountSek: input.amountSek,
        priceId: input.priceId ?? GIFT_CARD_PRICE_ID,
      }),
    });
    if (!response.ok) return { state: "unreachable" };
    const data: unknown = await response.json().catch(() => null);
    return parseGiftCardPromoPreview(data);
  } catch (error) {
    if (input.signal?.aborted) throw error;
    return { state: "unreachable" };
  } finally {
    timed.cancel();
  }
}

function collectKeys(value: unknown, out: string[] = []): string[] {
  if (!value || typeof value !== "object") return out;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    out.push(key);
    collectKeys(child, out);
  }
  return out;
}

/**
 * Samma create-checkout-kropp som idag. promoCode läggs bara till när den är ifylld.
 * metadata.gift_card_amount_sek är det kunden betalar. Nominellt värde får inte följa med.
 */
export function giftCardCheckoutPayload(args: {
  email: string;
  metadata: Record<string, string>;
  returnUrl: string;
  requestId: string;
  promoCode?: string;
}): Record<string, unknown> {
  const metadata: Record<string, string> = {};
  for (const key of GIFT_CARD_METADATA_KEYS) {
    const value = args.metadata[key];
    if (typeof value === "string" && value.trim()) metadata[key] = value.trim();
  }
  const payload: Record<string, unknown> = {
    priceId: GIFT_CARD_PRICE_ID,
    customerEmail: args.email,
    returnUrl: args.returnUrl,
    quantity: 1,
    requestId: args.requestId,
    metadata,
  };
  const promoCode = args.promoCode?.trim() ?? "";
  if (promoCode) payload.promoCode = promoCode;
  const nominal = collectKeys(payload).filter((key) => NOMINAL_KEY.test(key));
  if (nominal.length > 0) {
    throw new Error("Presentkortets payload får bara innehålla det betalda beloppet.");
  }
  return payload;
}

export type GiftCardReceipt = {
  paidSek: number;
  valueSek: number;
  promoCode: string;
  bonusPercent: number;
};

export function readGiftCardReceipt(value: unknown): GiftCardReceipt | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  if (!isWholeSek(body.paidSek) || !isWholeSek(body.valueSek)) return null;
  if (body.paidSek <= 0 || body.valueSek <= 0) return null;
  if (typeof body.promoCode !== "string" || !body.promoCode.trim()) return null;
  if (typeof body.bonusPercent !== "number" || !Number.isFinite(body.bonusPercent)) return null;
  return {
    paidSek: body.paidSek,
    valueSek: body.valueSek,
    promoCode: body.promoCode,
    bonusPercent: body.bonusPercent,
  };
}

/** Före betalning, från serverns belopp. Imperfekt hör hemma på tacksidan. */
export function giftCardPendingText(receipt: GiftCardReceipt | null): string | null {
  if (!receipt || receipt.valueSek <= receipt.paidSek) return null;
  return `Du betalar ${formatSek(receipt.paidSek)}. Presentkortet blir värt ${formatSek(receipt.valueSek)}.`;
}

export function giftCardThanksText(receipt: GiftCardReceipt | null): string | null {
  if (!receipt || receipt.valueSek <= receipt.paidSek) return null;
  return `Presentkortet är värt ${formatSek(receipt.valueSek)}. Du betalade ${formatSek(receipt.paidSek)}.`;
}

export function rememberGiftCardReceipt(receipt: GiftCardReceipt | null): void {
  if (typeof sessionStorage === "undefined") return;
  if (!receipt) {
    sessionStorage.removeItem(GIFT_CARD_RECEIPT_STORAGE_KEY);
    return;
  }
  sessionStorage.setItem(GIFT_CARD_RECEIPT_STORAGE_KEY, JSON.stringify(receipt));
}

export function readStoredGiftCardReceipt(): GiftCardReceipt | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    return readGiftCardReceipt(JSON.parse(sessionStorage.getItem(GIFT_CARD_RECEIPT_STORAGE_KEY) ?? "null"));
  } catch {
    return null;
  }
}
