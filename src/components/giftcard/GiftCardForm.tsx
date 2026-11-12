"use client";

import { useEffect, useState } from "react";

import { EmbeddedCheckout } from "@/components/booking/EmbeddedCheckout";
import { Field, Notice, primaryButtonClass, secondaryButtonClass } from "@/components/booking/fields";
import { SellerNote } from "@/components/SellerNote";
import { BookingApiError, createGiftCardCheckout } from "@/lib/booking/api";
import {
  GIFT_CARD_MAX_SEK,
  GIFT_CARD_MIN_SEK,
  GIFT_CARD_OFFER_LINE,
  GIFT_CARD_PRESETS,
  GIFT_CARD_PROMO_CHECKING,
  GIFT_CARD_PROMO_DEBOUNCE_MS,
  GIFT_CARD_PROMO_UNREACHABLE,
  GIFT_MESSAGE_MAX,
  RECIPIENT_NAME_MAX,
  formatSek,
  giftCardMetadata,
  giftCardPendingText,
  previewGiftCardPromo,
  rememberGiftCardReceipt,
  showGiftCardOffer,
  validateGiftCard,
  type GiftCardError,
  type GiftCardPromoPreview,
  type GiftCardReceipt,
} from "@/lib/giftcard/giftcard";
import { paymentReceiverLine } from "@/lib/seller";

const errors: Record<GiftCardError, string> = {
  amount: `Välj ett belopp mellan ${formatSek(GIFT_CARD_MIN_SEK)} och ${formatSek(GIFT_CARD_MAX_SEK)}.`,
  email: "Fyll i en giltig e-post.",
  name: "Fyll i ditt namn.",
  recipientEmail: "Mottagarens e-post ser fel ut.",
  tooLong: "Texten är för lång.",
};

type PromoState = GiftCardPromoPreview | { state: "idle" } | { state: "checking" };

function Check() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="mt-0.5 size-4 shrink-0">
      <path fill="none" stroke="currentColor" strokeWidth="1.5" d="M3 8.5 6.2 11.5 13 4.5" />
    </svg>
  );
}

export function GiftCardForm() {
  const [preset, setPreset] = useState<number>(1000);
  const [custom, setCustom] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [gift, setGift] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [settledPromo, setSettledPromo] = useState<{ key: string; preview: GiftCardPromoPreview } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<GiftCardReceipt | null>(null);
  const [promoNote, setPromoNote] = useState<string | null>(null);

  const amountSek = custom ? Number(custom) : preset;
  const offerOpen = showGiftCardOffer();
  const trimmedPromo = promoCode.trim();
  const promoKey =
    trimmedPromo && Number.isInteger(amountSek) && amountSek >= GIFT_CARD_MIN_SEK && amountSek <= GIFT_CARD_MAX_SEK
      ? `${trimmedPromo}\u0000${amountSek}`
      : "";
  const promo: PromoState = !promoKey ? { state: "idle" } : settledPromo?.key === promoKey ? settledPromo.preview : { state: "checking" };

  useEffect(() => {
    if (!promoKey) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void previewGiftCardPromo({ promoCode: trimmedPromo, amountSek, signal: controller.signal })
        .then((preview) => {
          if (!controller.signal.aborted) setSettledPromo({ key: promoKey, preview });
        })
        .catch(() => undefined);
    }, GIFT_CARD_PROMO_DEBOUNCE_MS);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [promoKey, trimmedPromo, amountSek]);

  useEffect(() => {
    if (!promoOpen) return;
    document.getElementById("gc-promo")?.focus();
  }, [promoOpen]);

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
      let promoCodeForCheckout: string | undefined;
      let droppedNote: string | null = null;
      const trimmed = promoCode.trim();
      if (trimmed) {
        const preview = await previewGiftCardPromo({ promoCode: trimmed, amountSek });
        setSettledPromo({ key: `${trimmed}\u0000${amountSek}`, preview });
        if (preview.state === "valid" && preview.paidSek === amountSek) promoCodeForCheckout = trimmed;
        else if (preview.state === "unreachable") droppedNote = GIFT_CARD_PROMO_UNREACHABLE;
        else if (preview.state === "invalid") droppedNote = preview.message;
      }
      const result = await createGiftCardCheckout({
        email: buyerEmail.trim().toLowerCase(),
        metadata: giftCardMetadata(input),
        returnUrl: `${window.location.origin}/presentkort/tack?session_id={CHECKOUT_SESSION_ID}`,
        promoCode: promoCodeForCheckout,
      });
      rememberGiftCardReceipt(result.giftCard);
      setReceipt(result.giftCard);
      setPromoNote(result.giftCard ? null : droppedNote);
      setClientSecret(result.clientSecret);
    } catch (err) {
      if (err instanceof BookingApiError && err.status === 429) setError("För många försök. Vänta en stund.");
      else if (err instanceof BookingApiError && err.status === 400) setError("Fyll i namn och e-post. Betalningen kunde inte startas.");
      else setError("Betalningen gick inte att starta. Försök igen om en stund.");
    } finally {
      setBusy(false);
    }
  }

  if (clientSecret) {
    const pending = giftCardPendingText(receipt);
    return (
      <div className="space-y-4">
        {promoNote ? (
          <p className="text-center text-sm text-hoa-ink-muted" role="status" data-testid="giftcard-promo-note">
            {promoNote}
          </p>
        ) : null}
        <p className="text-center text-sm text-hoa-ink-muted" data-testid={pending ? "giftcard-pending-value" : undefined}>
          {pending ?? `Presentkort ${formatSek(amountSek)}`}
        </p>
        <p className="text-center text-xs text-hoa-ink-muted">{paymentReceiverLine}</p>
        <EmbeddedCheckout clientSecret={clientSecret} />
        <SellerNote className="text-center" />
        <button
          type="button"
          className={secondaryButtonClass}
          onClick={() => {
            setClientSecret(null);
            setReceipt(null);
            setPromoNote(null);
            rememberGiftCardReceipt(null);
          }}
        >
          Ändra
        </button>
      </div>
    );
  }

  const promoMessage =
    promo.state === "valid"
      ? promo.message
      : promo.state === "invalid"
        ? promo.message
        : promo.state === "unreachable"
          ? GIFT_CARD_PROMO_UNREACHABLE
          : promo.state === "checking"
            ? GIFT_CARD_PROMO_CHECKING
            : null;

  return (
    <div className="mx-auto max-w-xl">
      {offerOpen ? (
        <p className="mb-6 text-center text-sm text-hoa-ink-muted" data-testid="giftcard-offer">
          {GIFT_CARD_OFFER_LINE}
        </p>
      ) : null}
      <form onSubmit={submit} className="space-y-6 text-left" data-testid="giftcard-form" noValidate>
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
                {formatSek(p)}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <Field
              label={`Eget belopp (${formatSek(GIFT_CARD_MIN_SEK)} till ${formatSek(GIFT_CARD_MAX_SEK)})`}
              name="gc-custom"
              type="number"
              value={custom}
              onChange={(v) => setCustom(v.replace(/[^0-9]/g, ""))}
            />
          </div>
        </fieldset>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Ditt namn *" name="gc-bname" autoComplete="name" required value={buyerName} onChange={setBuyerName} maxLength={120} />
          <Field label="Din e-post *" name="gc-bemail" type="email" autoComplete="email" required value={buyerEmail} onChange={setBuyerEmail} />
        </div>

        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-hoa-ink">
          <input type="checkbox" checked={gift} onChange={(e) => setGift(e.target.checked)} className="size-6 shrink-0 accent-hoa-gold" />
          Skicka direkt till mottagaren
        </label>

        {gift && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Mottagarens namn" name="gc-rname" value={recipientName} onChange={setRecipientName} maxLength={RECIPIENT_NAME_MAX} />
            <Field label="Mottagarens e-post" name="gc-remail" type="email" value={recipientEmail} onChange={setRecipientEmail} />
          </div>
        )}

        <Field label="Hälsning (valfri)" name="gc-msg" multiline value={message} onChange={setMessage} maxLength={GIFT_MESSAGE_MAX} />

        {promoOpen ? (
          <div className="space-y-2" id="gc-promo-panel">
            <Field label="Kampanjkod" name="gc-promo" autoComplete="off" value={promoCode} onChange={setPromoCode} maxLength={40} />
            {promoMessage ? (
              <p
                className="flex items-start gap-2 text-sm text-hoa-ink-muted"
                role="status"
                data-testid={
                  promo.state === "valid"
                    ? "giftcard-promo-valid"
                    : promo.state === "invalid"
                      ? "giftcard-promo-invalid"
                      : promo.state === "unreachable"
                        ? "giftcard-promo-unreachable"
                        : "giftcard-promo-checking"
                }
              >
                {promo.state === "valid" ? <Check /> : null}
                <span>{promoMessage}</span>
              </p>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            className="inline-flex min-h-11 items-center text-sm text-hoa-ink-muted underline underline-offset-4 hover:text-hoa-ink"
            aria-expanded={false}
            aria-controls="gc-promo-panel"
            onClick={() => setPromoOpen(true)}
          >
            Har du en kampanjkod?
          </button>
        )}

        {error && <Notice tone="error">{error}</Notice>}

        <div className="text-center">
          <button type="submit" disabled={busy} className={primaryButtonClass}>
            {busy ? "Öppnar betalning..." : `Köp presentkort ${Number.isFinite(amountSek) && amountSek > 0 ? formatSek(amountSek) : ""}`.trim()}
          </button>
          <p className="mt-3 text-xs text-hoa-ink-muted">Digitalt presentkort, giltigt i ett år. {paymentReceiverLine}</p>
        </div>
      </form>
    </div>
  );
}
