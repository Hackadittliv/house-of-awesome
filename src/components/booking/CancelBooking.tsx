"use client";

import { useEffect, useState } from "react";

import { ClientOnly } from "@/components/booking/ClientOnly";
import { Notice, primaryButtonClass } from "@/components/booking/fields";
import { BookingApiError, cancelBooking } from "@/lib/booking/api";
import { bookingCopy as t } from "@/lib/booking/copy";
import { CANCEL_TOKEN_KEY, forgetStoredValue, takeStoredValue } from "@/lib/booking/sensitive-url";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type State = "missing" | "ready" | "sending" | "done" | "already" | "late" | "not_found" | "contact" | "error";

export function CancelBooking() {
  return (
    <ClientOnly>
      <CancelFromLink />
    </ClientOnly>
  );
}

function CancelFromLink() {
  const [token] = useState(() => {
    const value = takeStoredValue(CANCEL_TOKEN_KEY) ?? new URLSearchParams(window.location.search).get("avboka");
    return value && UUID.test(value) ? value : null;
  });
  const [state, setState] = useState<State>(token ? "ready" : "missing");

  useEffect(() => {
    // Reserv om skriptet i <head> inte hann köra: ta bort koden ur adressfältet.
    if (new URLSearchParams(window.location.search).has("avboka")) {
      window.history.replaceState(window.history.state, "", window.location.pathname);
    }
  }, []);

  async function confirm() {
    if (!token) return;
    setState("sending");
    try {
      const result = await cancelBooking(token);
      forgetStoredValue(CANCEL_TOKEN_KEY);
      setState(result.already ? "already" : result.late ? "late" : "done");
    } catch (error) {
      if (error instanceof BookingApiError && error.status === 404) setState("not_found");
      else if (error instanceof BookingApiError && error.status === 409) setState("contact");
      else setState("error");
    }
  }

  if (state === "missing") return <Notice>{t.cancelMissing}</Notice>;
  if (state === "not_found") return <Notice tone="error">{t.cancelNotFound}</Notice>;
  if (state === "contact") return <Notice tone="error">{t.cancelNeedsContact}</Notice>;

  if (state === "done" || state === "already" || state === "late") {
    return (
      <div className="space-y-3" data-testid="booking-cancelled" role="status">
        <h2 className="text-2xl text-hoa-ink">{state === "already" ? t.cancelAlready : t.cancelDone}</h2>
        {state !== "already" ? <p className="text-hoa-ink-muted">{t.cancelDoneLead}</p> : null}
        {state === "late" ? <Notice>{t.cancelLate}</Notice> : null}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-hoa-ink-muted">{t.cancelLead}</p>
      {state === "error" ? <Notice tone="error">{t.cancelError}</Notice> : null}
      <button type="button" className={primaryButtonClass} onClick={confirm} disabled={state === "sending"}>
        {state === "sending" ? t.submitting : t.cancelConfirm}
      </button>
    </div>
  );
}
