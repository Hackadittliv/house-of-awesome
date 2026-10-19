"use client";

import { useState } from "react";

import { EmbeddedCheckout } from "@/components/booking/EmbeddedCheckout";
import { Field, Notice, primaryButtonClass, secondaryButtonClass } from "@/components/booking/fields";
import { SellerNote } from "@/components/SellerNote";
import { BookingApiError, createGiftCardCheckout } from "@/lib/booking/api";
import { paymentReceiverLine } from "@/lib/seller";
import {
  GIFT_CARD_MAX_SEK,
  GIFT_CARD_MIN_SEK,
  GIFT_CARD_PRESETS,
  GIFT_MESSAGE_MAX,
  RECIPIENT_NAME_MAX,
  giftCardMetadata,
  validateGiftCard,
  type GiftCardError,
} from "@/lib/giftcard/giftcard";

const kr = (n: number) => `${n.toLocaleString("sv-SE")} kr`;

const errors: Record<GiftCardError, string> = {
  amount: `Välj ett belopp mellan ${kr(GIFT_CARD_MIN_SEK)} och ${kr(GIFT_CARD_MAX_SEK)}.`,
  email: "Fyll i en giltig e-post.",
  recipientEmail: "Mottagarens e-post ser fel ut.",
  tooLong: "Texten är för lång.",
};

export function GiftCardForm() {
  const [preset, setPreset] = useState<number>(1000);
  const [custom, setCustom] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [gift, setGift] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const amountSek = custom ? Number(custom) : preset;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const input = {
      amountSek,
      buyerEmail,
      buyerName,
      recipientName: gift ? recipientName : "",
      recipientEmail: gift ? recipientEmail : "",
      message,
    };
    const invalid = validateGiftCard(input);
    if (invalid) return setError(errors[invalid]);
    setError(null);
    setBusy(true);
    try {
      const secret = await createGiftCardCheckout({
        email: buyerEmail.trim().toLowerCase(),
        metadata: giftCardMetadata(input),
        returnUrl: `${window.location.origin}/presentkort/tack?session_id={CHECKOUT_SESSION_ID}`,
      });
      setClientSecret(secret);
    } catch (err) {
      setError(err instanceof BookingApiError && err.status === 429 ? "För många försök. Vänta en stund." : "Betalningen gick inte att starta. Försök igen om en stund.");
    } finally {
      setBusy(false);
    }
  }

  if (clientSecret) {
    return (
      <div className="space-y-4">
        <p className="text-center text-sm text-hoa-ink-muted">Presentkort {kr(amountSek)}</p>
        <p className="text-center text-xs text-hoa-ink-muted">{paymentReceiverLine}</p>
        <EmbeddedCheckout clientSecret={clientSecret} />
        <SellerNote className="text-center" />
        <button type="button" className={secondaryButtonClass} onClick={() => setClientSecret(null)}>
          Ändra
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-6 text-left" data-testid="giftcard-form" noValidate>
      <fieldset>
        <legend className="mb-3 text-sm text-hoa-ink-muted">Belopp</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {GIFT_CARD_PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={!custom && preset === p}
              onClick={() => {
                setPreset(p);
                setCustom("");
              }}
              className={`min-h-12 rounded-full border font-display text-sm transition-colors ${
                !custom && preset === p ? "border-hoa-gold bg-hoa-gold text-hoa-espresso" : "border-hoa-line text-hoa-ink hover:bg-hoa-bronze"
              }`}
            >
              {kr(p)}
            </button>
          ))}
        </div>
        <div className="mt-4">
          <Field
            label={`Eget belopp (${kr(GIFT_CARD_MIN_SEK)} till ${kr(GIFT_CARD_MAX_SEK)})`}
            name="gc-custom"
            type="number"
            value={custom}
            onChange={(v) => setCustom(v.replace(/[^0-9]/g, ""))}
          />
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Ditt namn" name="gc-bname" autoComplete="name" value={buyerName} onChange={setBuyerName} maxLength={120} />
        <Field label="Din e-post *" name="gc-bemail" type="email" autoComplete="email" required value={buyerEmail} onChange={setBuyerEmail} />
      </div>

      <label className="flex items-center gap-3 text-sm text-hoa-ink">
        <input type="checkbox" checked={gift} onChange={(e) => setGift(e.target.checked)} className="h-5 w-5 accent-hoa-gold" />
        Skicka direkt till mottagaren
      </label>

      {gift && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mottagarens namn" name="gc-rname" value={recipientName} onChange={setRecipientName} maxLength={RECIPIENT_NAME_MAX} />
          <Field label="Mottagarens e-post" name="gc-remail" type="email" value={recipientEmail} onChange={setRecipientEmail} />
        </div>
      )}

      <Field label="Hälsning (valfri)" name="gc-msg" multiline value={message} onChange={setMessage} maxLength={GIFT_MESSAGE_MAX} />

      {error && <Notice tone="error">{error}</Notice>}

      <div className="text-center">
        <button type="submit" disabled={busy} className={primaryButtonClass}>
          {busy ? "Öppnar betalning..." : `Köp presentkort ${Number.isFinite(amountSek) && amountSek > 0 ? kr(amountSek) : ""}`.trim()}
        </button>
        <p className="mt-3 text-xs text-hoa-ink-muted">Digitalt presentkort, giltigt i ett år. {paymentReceiverLine}</p>
      </div>
    </form>
  );
}
