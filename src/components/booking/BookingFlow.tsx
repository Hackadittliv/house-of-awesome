"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { EmbeddedCheckout } from "@/components/booking/EmbeddedCheckout";
import { RequestForm } from "@/components/booking/RequestForm";
import { Field, Notice, PrivacyText, primaryButtonClass, secondaryButtonClass } from "@/components/booking/fields";
import {
  BookingApiError,
  createBooking,
  createCheckout,
  getAvailability,
  type AvailabilityResult,
  type EventTypeInfo,
  type Slot,
} from "@/lib/booking/api";
import { bookingCopy as t } from "@/lib/booking/copy";
import { addDays, formatDateTime, formatDayLabel, formatTime, groupSlotsByDay, stockholmDate, utmFrom } from "@/lib/booking/format";
import { saveConfirmation } from "@/lib/booking/confirmation";

const DAYS_PER_PAGE = 7;

type Props = {
  slug: string;
  serviceName: string;
  healthDeclaration: boolean;
};

type Step = "pick" | "form" | "pay";

export function locationLabel(type: EventTypeInfo["location_type"]): string {
  if (type === "in_person") return t.locationInPerson;
  if (type === "phone") return t.locationPhone;
  return t.locationMeet;
}

export function BookingFlow({ slug, serviceName, healthDeclaration }: Props) {
  const router = useRouter();
  const [fromDate, setFromDate] = useState(() => stockholmDate(new Date()));
  const [loaded, setLoaded] = useState<{ key: string; result: AvailabilityResult | "error" } | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [step, setStep] = useState<Step>("pick");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const today = useMemo(() => stockholmDate(new Date()), []);
  const toDate = addDays(fromDate, DAYS_PER_PAGE - 1);
  const requestKey = `${slug}|${fromDate}|${reloadKey}`;

  useEffect(() => {
    let active = true;
    getAvailability(slug, fromDate, toDate)
      .then((result) => {
        if (!active) return;
        setLoaded({ key: requestKey, result });
        if (result.kind === "slots") {
          setSelectedDay(result.slots.length ? stockholmDate(new Date(result.slots[0].start)) : null);
        }
      })
      .catch(() => active && setLoaded({ key: requestKey, result: "error" }));
    return () => {
      active = false;
    };
  }, [slug, fromDate, toDate, requestKey]);

  const availability = loaded?.key === requestKey ? loaded.result : null;
  if (availability === "error") return <Notice tone="error">{t.availabilityError}</Notice>;
  if (!availability) return <Notice>{t.loadingTimes}</Notice>;

  if (availability.kind === "request_only") {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl text-hoa-ink">{t.requestOnlyTitle}</h2>
          <p className="text-hoa-ink-muted">{t.requestOnlyLead}</p>
        </div>
        <RequestForm serviceSlug={slug} serviceName={serviceName} />
      </div>
    );
  }

  const { eventType, slots } = availability;
  const days = groupSlotsByDay(slots);
  const daySlots = selectedDay ? days.get(selectedDay) ?? [] : [];

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!slot) return;
    setSubmitting(true);
    setSubmitError(null);
    let phase: "booking" | "checkout" = "booking";
    try {
      const booking = await createBooking({
        eventTypeSlug: eventType.slug,
        startAt: slot.start,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        notes: notes.trim(),
        locationType: eventType.location_type,
        utm: utmFrom(window.location.search),
      });
      const confirmation = {
        bookingId: booking.booking_id,
        cancelToken: booking.cancel_token,
        startsAt: booking.starts_at,
        title: eventType.title_sv,
        location: locationLabel(eventType.location_type),
      };
      if (booking.requires_payment && booking.price_id) {
        saveConfirmation(confirmation);
        phase = "checkout";
        const secret = await createCheckout({
          bookingId: booking.booking_id,
          priceId: booking.price_id,
          email: email.trim(),
          returnUrl: `${window.location.origin}/boka/tack?session_id={CHECKOUT_SESSION_ID}`,
        });
        setClientSecret(secret);
        setStep("pay");
      } else {
        saveConfirmation(confirmation);
        router.push("/boka/tack");
      }
    } catch (error) {
      if (phase === "checkout") {
        setSubmitError(t.paymentUnavailable);
      } else if (error instanceof BookingApiError && error.status === 409) {
        setSubmitError(t.slotTaken);
        setSlot(null);
        setStep("pick");
        setReloadKey((key) => key + 1);
      } else if (error instanceof BookingApiError && error.status === 429) {
        setSubmitError(t.tooMany);
      } else {
        setSubmitError(t.bookingError);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <dl className="grid gap-2 text-sm text-hoa-ink-muted sm:grid-cols-3">
        <div>
          <dt className="sr-only">Längd</dt>
          <dd>
            {eventType.duration_minutes} {t.minutes}
          </dd>
        </div>
        {eventType.price_label_sv ? (
          <div>
            <dt className="sr-only">Pris</dt>
            <dd>{eventType.price_label_sv}</dd>
          </div>
        ) : null}
        <div>
          <dt className="sr-only">{t.where}</dt>
          <dd>{locationLabel(eventType.location_type)}</dd>
        </div>
      </dl>

      {healthDeclaration ? <Notice>{t.healthDeclarationNote}</Notice> : null}
      {submitError ? <Notice tone="error">{submitError}</Notice> : null}

      {step === "pick" ? (
        <section aria-labelledby="pick-time" className="space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h2 id="pick-time" className="text-2xl text-hoa-ink">
              {t.chooseTime}
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                className={secondaryButtonClass}
                disabled={fromDate <= today}
                onClick={() => setFromDate(addDays(fromDate, -DAYS_PER_PAGE))}
                aria-label={t.previousWeek}
              >
                ‹
              </button>
              <button
                type="button"
                className={secondaryButtonClass}
                onClick={() => setFromDate(addDays(fromDate, DAYS_PER_PAGE))}
                aria-label={t.nextWeek}
              >
                ›
              </button>
            </div>
          </div>

          {days.size === 0 ? (
            <Notice>{t.noTimesThisWeek}</Notice>
          ) : (
            <>
              <div className="flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Dagar">
                {[...days.keys()].map((day) => (
                  <button
                    key={day}
                    type="button"
                    role="tab"
                    aria-selected={day === selectedDay}
                    onClick={() => setSelectedDay(day)}
                    className={`min-h-11 shrink-0 rounded-full border px-4 text-sm capitalize ${
                      day === selectedDay ? "border-hoa-gold bg-hoa-gold text-hoa-espresso" : "border-hoa-line text-hoa-ink hover:bg-hoa-secondary"
                    }`}
                  >
                    {formatDayLabel(day)}
                  </button>
                ))}
              </div>
              <div>
                <h3 className="mb-3 text-sm text-hoa-ink-muted">{t.timesFor}</h3>
                <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {daySlots.map((candidate) => (
                    <li key={candidate.start}>
                      <button
                        type="button"
                        data-testid="slot"
                        onClick={() => {
                          setSlot(candidate);
                          setSubmitError(null);
                          setStep("form");
                        }}
                        className="min-h-11 w-full rounded-lia-md border border-hoa-line bg-hoa-card text-hoa-ink hover:border-hoa-gold"
                      >
                        {formatTime(candidate.start)}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </section>
      ) : null}

      {step === "form" && slot ? (
        <form onSubmit={submit} className="space-y-5" aria-labelledby="your-details">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lia-md border border-hoa-line bg-hoa-card px-4 py-3">
            <p className="text-hoa-ink">
              <span className="text-sm text-hoa-ink-muted">{t.selected}: </span>
              <span className="capitalize">{formatDateTime(slot.start)}</span>
            </p>
            <button type="button" className="text-sm text-hoa-gold underline-offset-4 hover:underline" onClick={() => setStep("pick")}>
              {t.change}
            </button>
          </div>
          <h2 id="your-details" className="text-2xl text-hoa-ink">
            {t.formTitle}
          </h2>
          <Field label={t.name} name="name" required autoComplete="name" maxLength={120} value={name} onChange={setName} />
          <Field label={t.email} name="email" type="email" required autoComplete="email" maxLength={255} value={email} onChange={setEmail} />
          <Field
            label={eventType.phone_required || eventType.location_type === "phone" ? t.phone : t.phoneOptional}
            name="phone"
            type="tel"
            required={eventType.phone_required || eventType.location_type === "phone"}
            autoComplete="tel"
            maxLength={40}
            value={phone}
            onChange={setPhone}
          />
          <Field label={t.notes} name="notes" multiline maxLength={2000} value={notes} onChange={setNotes} />
          <PrivacyText text={t.bookingPrivacy} linkLabel={t.privacyLink} />
          <button type="submit" className={primaryButtonClass} disabled={submitting}>
            {submitting ? t.submitting : eventType.requires_payment ? t.bookPaid : t.bookFree}
          </button>
        </form>
      ) : null}

      {step === "pay" && clientSecret ? (
        <section aria-labelledby="payment" className="space-y-4">
          <h2 id="payment" className="text-2xl text-hoa-ink">
            {t.paymentTitle}
          </h2>
          <p className="text-sm text-hoa-ink-muted">{t.paymentLead}</p>
          <EmbeddedCheckout clientSecret={clientSecret} />
        </section>
      ) : null}
    </div>
  );
}
