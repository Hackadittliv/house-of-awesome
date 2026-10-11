"use client";

import { useEffect, useState } from "react";

import { ClientOnly } from "@/components/booking/ClientOnly";
import { Notice, secondaryButtonClass } from "@/components/booking/fields";
import { BookingApiError, fetchIcs } from "@/lib/booking/api";
import { bookingCopy as t } from "@/lib/booking/copy";
import { readConfirmation, type StoredConfirmation } from "@/lib/booking/confirmation";
import { formatDateTime } from "@/lib/booking/format";

const POLL_INTERVAL_MS = 2_000;
const POLL_ATTEMPTS = 20;

function downloadIcs(ics: string) {
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "bokning.ics";
  link.click();
  URL.revokeObjectURL(url);
}

type State =
  | { kind: "waiting" }
  | { kind: "confirmed"; paid: boolean; details: StoredConfirmation | null; ics: string | null }
  | { kind: "not_confirmed" }
  | { kind: "missing" };

function paidSessionId(): string | null {
  const sessionId = new URLSearchParams(window.location.search).get("session_id");
  return sessionId && /^cs_[a-zA-Z0-9_]{8,255}$/.test(sessionId) ? sessionId : null;
}

export function Confirmation() {
  return (
    <ClientOnly>
      <ConfirmationDetails />
    </ClientOnly>
  );
}

function ConfirmationDetails() {
  const [sessionId] = useState(paidSessionId);
  const [details] = useState(readConfirmation);
  const [state, setState] = useState<State>(() =>
    sessionId
      ? { kind: "waiting" }
      : details
        ? { kind: "confirmed", paid: false, details, ics: null }
        : { kind: "missing" },
  );

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    (async () => {
        for (let attempt = 0; attempt < POLL_ATTEMPTS && !cancelled; attempt += 1) {
          try {
            const ics = await fetchIcs({ sessionId });
            if (!cancelled) setState({ kind: "confirmed", paid: true, details, ics });
            return;
          } catch (error) {
            if (!(error instanceof BookingApiError) || error.status !== 409) break;
          }
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        }
        if (!cancelled) setState({ kind: "not_confirmed" });
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, details]);

  if (state.kind === "waiting") return <Notice>{t.waitingForPayment}</Notice>;
  if (state.kind === "not_confirmed") return <Notice>{t.paymentNotConfirmed}</Notice>;
  if (state.kind === "missing") return <Notice>{t.confirmedLead}</Notice>;

  const { paid, ics } = state;

  async function addToCalendar() {
    if (ics) return downloadIcs(ics);
    if (!details) return;
    try {
      downloadIcs(await fetchIcs({ bookingId: details.bookingId, cancelToken: details.cancelToken }));
    } catch {
      // Kalenderfilen finns också i bekräftelsemejlet.
    }
  }

  return (
    <div className="space-y-6" data-testid="booking-confirmed">
      <div className="space-y-2">
        <h2 className="text-2xl text-hoa-ink md:text-3xl">{paid ? t.paidConfirmedTitle : t.confirmedTitle}</h2>
        <p className="text-hoa-ink-muted">{t.confirmedLead}</p>
      </div>
      {details ? (
        <dl className="space-y-3 rounded-lia-md border border-hoa-line bg-hoa-card p-5">
          <div>
            <dt className="text-sm text-hoa-ink-muted">{details.title}</dt>
          </div>
          <div>
            <dt className="text-sm text-hoa-ink-muted">{t.when}</dt>
            <dd className="capitalize text-hoa-ink">{formatDateTime(details.startsAt)}</dd>
          </div>
          <div>
            <dt className="text-sm text-hoa-ink-muted">{t.where}</dt>
            <dd className="text-hoa-ink">{details.location}</dd>
          </div>
        </dl>
      ) : null}
      {ics || details ? (
        <button type="button" className={secondaryButtonClass} onClick={addToCalendar}>
          {t.downloadIcs}
        </button>
      ) : null}
    </div>
  );
}
