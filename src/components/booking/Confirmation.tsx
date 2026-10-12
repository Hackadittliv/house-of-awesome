"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ClientOnly } from "@/components/booking/ClientOnly";
import { Notice, primaryButtonClass, secondaryButtonClass } from "@/components/booking/fields";
import { fetchIcs, getPaymentStatus, type PaymentStatus } from "@/lib/booking/api";
import { bookingCopy as t } from "@/lib/booking/copy";
import { confirmationView, readConfirmation, type StoredConfirmation } from "@/lib/booking/confirmation";
import { formatDateTime } from "@/lib/booking/format";
import { CHECKOUT_SESSION_KEY, takeStoredValue } from "@/lib/booking/sensitive-url";

const POLL_INTERVAL_MS = 2_000;
const POLL_ATTEMPTS = 30;
const SESSION_ID = /^cs_[a-zA-Z0-9_]{8,255}$/;

function downloadIcs(ics: string) {
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "bokning.ics";
  link.click();
  URL.revokeObjectURL(url);
}

function checkoutSessionId(): string | null {
  const sessionId = takeStoredValue(CHECKOUT_SESSION_KEY) ?? new URLSearchParams(window.location.search).get("session_id");
  return sessionId && SESSION_ID.test(sessionId) ? sessionId : null;
}

export function Confirmation() {
  return (
    <ClientOnly>
      <ConfirmationDetails />
    </ClientOnly>
  );
}

function ConfirmationDetails() {
  const [sessionId] = useState(checkoutSessionId);
  const [details] = useState(readConfirmation);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [ics, setIcs] = useState<string | null>(null);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("session_id")) {
      window.history.replaceState(window.history.state, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    (async () => {
      for (let attempt = 0; attempt < POLL_ATTEMPTS && !cancelled; attempt += 1) {
        let status: PaymentStatus | null = null;
        try {
          status = await getPaymentStatus(sessionId);
        } catch {
          // Tillfälligt fel eller för många anrop: försök igen tills tiden är slut.
        }
        if (cancelled) return;
        if (status && status !== "pending") {
          if (status === "confirmed") {
            try {
              const file = await fetchIcs({ sessionId });
              if (!cancelled) setIcs(file);
            } catch {
              // Kalenderfilen finns också i bekräftelsemejlet.
            }
          }
          if (!cancelled) setPaymentStatus(status);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }
      if (!cancelled) setTimedOut(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const view = confirmationView({ sessionId, details, paymentStatus });
  const retryHref = details?.slug ? `/boka/${details.slug}` : "/boka";

  if (view === "missing") return <Notice>{t.detailsMissing}</Notice>;

  if (view === "checking") {
    if (!timedOut) return <Notice>{t.waitingForPayment}</Notice>;
    return (
      <div className="space-y-4" data-testid="booking-payment-pending" role="status">
        <Notice>{t.paymentNotConfirmed}</Notice>
      </div>
    );
  }

  if (view === "review") {
    return (
      <div className="space-y-2" data-testid="booking-payment-review" role="status">
        <h2 className="text-2xl text-hoa-ink md:text-3xl">{t.paymentReviewTitle}</h2>
        <p className="text-hoa-ink-muted">{t.paymentReviewLead}</p>
      </div>
    );
  }

  if (view === "not_paid") {
    return (
      <div className="space-y-4" data-testid="booking-not-paid" role="status">
        <div className="space-y-2">
          <h2 className="text-2xl text-hoa-ink md:text-3xl">{t.paymentNotCompletedTitle}</h2>
          <p className="text-hoa-ink-muted">{t.paymentNotCompletedLead}</p>
        </div>
        <Link href={retryHref} className={primaryButtonClass}>
          {t.chooseNewTime}
        </Link>
      </div>
    );
  }

  const paid = view === "confirmed";

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
      {details ? <BookingSummary details={details} /> : null}
      {ics || details ? (
        <button type="button" className={secondaryButtonClass} onClick={addToCalendar}>
          {t.downloadIcs}
        </button>
      ) : null}
    </div>
  );
}

function BookingSummary({ details }: { details: StoredConfirmation }) {
  return (
    <dl className="space-y-3 rounded-lia-md border border-hoa-line bg-hoa-card p-5">
      <div>
        <dt className="text-sm text-hoa-ink-muted">{details.title}</dt>
      </div>
      <div>
        <dt className="text-sm text-hoa-ink-muted">{t.when}</dt>
        <dd className="text-hoa-ink first-letter:uppercase">{formatDateTime(details.startsAt)}</dd>
      </div>
      <div>
        <dt className="text-sm text-hoa-ink-muted">{t.where}</dt>
        <dd className="text-hoa-ink">{details.location}</dd>
      </div>
    </dl>
  );
}
