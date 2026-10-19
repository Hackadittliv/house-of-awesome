// Presentkort säljs via LIA:s create-checkout (priceId "gift_card_custom").
// Gränserna speglar GIFT_CARD_MIN_SEK / GIFT_CARD_MAX_SEK i LIA:s edge function.
export const GIFT_CARD_PRICE_ID = "gift_card_custom";
export const GIFT_CARD_MIN_SEK = 200;
export const GIFT_CARD_MAX_SEK = 20000;
export const GIFT_CARD_PRESETS = [500, 1000, 1500, 2500] as const;
export const RECIPIENT_NAME_MAX = 120;
export const GIFT_MESSAGE_MAX = 400;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type GiftCardInput = {
  amountSek: number;
  buyerEmail: string;
  buyerName?: string;
  recipientName?: string;
  recipientEmail?: string;
  message?: string;
};

export type GiftCardError = "amount" | "email" | "recipientEmail" | "tooLong";

export function validateGiftCard(input: GiftCardInput): GiftCardError | null {
  if (!Number.isInteger(input.amountSek) || input.amountSek < GIFT_CARD_MIN_SEK || input.amountSek > GIFT_CARD_MAX_SEK) {
    return "amount";
  }
  if (!EMAIL.test(input.buyerEmail.trim())) return "email";
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
