"use client";

import { useEffect, useRef, useState } from "react";
import { ClientOnly } from "@/components/booking/ClientOnly";
import { Notice, primaryButtonClass } from "@/components/booking/fields";
import { BookingApiError, cancelBooking, previewCancellation, type CancelResult, type CancellationTerms } from "@/lib/booking/api";
import { bookingCopy as t } from "@/lib/booking/copy";
import { CANCEL_TOKEN_KEY, forgetStoredValue, takeStoredValue } from "@/lib/booking/sensitive-url";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const currency = new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK" });
const sek = (ore: number) => currency.format(ore / 100);

function consequence(terms: CancellationTerms) {
  if (!terms.house247) return t.cancelLead;
  switch (terms.kind) {
    case "voucher":
      return terms.voucher_uses
        ? "Om du avbokar nu får du tillbaka ett pass på ditt klippkort."
        : "Om du avbokar nu förbrukas ett pass på ditt klippkort.";
    case "included":
      return terms.quota_uses
        ? "Om du avbokar nu får du tillbaka ett EWOT-pass i veckokvoten."
        : "Om du avbokar nu räknas EWOT-passet fortfarande mot veckokvoten.";
    case "card":
      return terms.amount_ore
        ? `Om du avbokar nu får du tillbaka ${sek(terms.amount_ore)} till ditt kort.`
        : "Det är mindre än 24 timmar till passet. En avbokning nu ger ingen återbetalning.";
  }
}

function outcome(result: CancelResult) {
  if (result.house247_voucher_uses !== undefined) {
    return result.house247_voucher_uses
      ? "Ett pass har återförts till ditt klippkort."
      : "Passet har förbrukats på ditt klippkort.";
  }
  if (result.house247_quota_uses !== undefined) {
    return result.house247_quota_uses
      ? "Ett EWOT-pass har återförts till din veckokvot."
      : "EWOT-passet räknas mot din veckokvot.";
  }
  switch (result.house247_refund) {
    case "pending": return `Din återbetalning på ${sek(result.house247_amount_ore ?? 0)} behandlas.`;
    case "succeeded": return `Vi har återbetalat ${sek(result.house247_amount_ore ?? 0)} till ditt kort.`;
    case "manual_review": return "Vi behöver följa upp din återbetalning manuellt.";
    case "not_due": return "Avbokningen ger ingen återbetalning.";
    default: return result.late ? t.cancelLate : null;
  }
}

export function CancelBooking() {
  return <ClientOnly><CancelFromLink /></ClientOnly>;
}

function CancelFromLink() {
  const [token] = useState(() => {
    const value = takeStoredValue(CANCEL_TOKEN_KEY) ?? new URLSearchParams(window.location.search).get("avboka");
    return value && UUID.test(value) ? value : null;
  });
  const [terms, setTerms] = useState<CancellationTerms | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [notice, setNotice] = useState("");
  const [failed, setFailed] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<CancelResult | null>(null);
  const submitting = useRef(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("avboka")) {
      window.history.replaceState(window.history.state, "", window.location.pathname);
    }
    if (!token) return;
    let current = true;
    previewCancellation(token).then(data => { if (current) setTerms(data); })
      .catch(() => { if (current) setFailed(true); });
    return () => { current = false; };
  }, [token, attempt]);

  async function confirm() {
    if (!token || !terms || submitting.current) return;
    submitting.current = true;
    setSending(true);
    setNotice("");
    try {
      const response = await cancelBooking(token, terms);
      if (response?.ok !== true) throw new Error();
      forgetStoredValue(CANCEL_TOKEN_KEY);
      setResult(response);
    } catch (error) {
      if (error instanceof BookingApiError && error.status === 409 && error.message === "Refund terms changed") {
        setNotice("Villkoren har ändrats. Läs det nya beskedet innan du bekräftar.");
        setTerms(null);
        setAttempt(n => n + 1);
      } else {
        const terminal = error instanceof BookingApiError && [404, 409].includes(error.status);
        if (terminal) setTerms(null);
        setNotice(error instanceof BookingApiError && error.status === 404 ? t.cancelNotFound : terminal ? t.cancelNeedsContact : t.cancelError);
      }
    } finally {
      submitting.current = false;
      setSending(false);
    }
  }

  if (!token) return <Notice>{t.cancelMissing}</Notice>;
  if (result) {
    const message = outcome(result);
    return <div className="space-y-3" data-testid="booking-cancelled" role="status">
      <h2 className="text-2xl text-hoa-ink">{result.already ? t.cancelAlready : t.cancelDone}</h2>
      {!result.already && <p className="text-hoa-ink-muted">{result.customer_notification_manual_review || result.customer_notification_pending ? "Avbokningen är sparad. Bekräftelsemejlet har ännu inte kunnat bekräftas." : t.cancelDoneLead}</p>}
      {message && <Notice>{message}</Notice>}
    </div>;
  }
  return <div className="space-y-5">
    {notice && <Notice>{notice}</Notice>}
    {terms ? <>
      <p className="text-hoa-ink-muted">{consequence(terms)}</p>
      <button type="button" className={primaryButtonClass} onClick={confirm} disabled={sending}>{sending ? t.submitting : t.cancelConfirm}</button>
    </> : failed ? <>
      <Notice tone="error">Avbokningsvillkoren kunde inte hämtas.</Notice>
      <button className={primaryButtonClass} type="button" onClick={() => { setFailed(false); setAttempt(n => n + 1); }}>Försök igen</button>
    </> : !notice && <p role="status">Hämtar avbokningsvillkor…</p>}
  </div>;
}
