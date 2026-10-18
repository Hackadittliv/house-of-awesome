"use client";

import { useState } from "react";

import { Field, Notice, PrivacyText, inputClass, primaryButtonClass } from "@/components/booking/fields";
import { BookingApiError, requestConsultation, type RequestRoute } from "@/lib/booking/api";
import { bookingCopy as t } from "@/lib/booking/copy";
import { interestFor, utmFrom } from "@/lib/booking/format";

type Props = {
  serviceSlug: string | null;
  serviceName: string | null;
  /** Skickar förfrågan till en annan mottagare än huset, se RequestRoute. */
  route?: RequestRoute;
  /** Valbara upplägg, t.ex. längd och plats. Valet följer med i meddelandet. */
  options?: string[];
};

export function RequestForm({ serviceSlug, serviceName, route, options }: Props) {
  const [option, setOption] = useState(options?.[0] ?? "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error" | "limited">("idle");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState("sending");
    try {
      await requestConsultation({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        interestType: interestFor(serviceSlug),
        message: [serviceName ? `${t.requestService}: ${serviceName}` : null, option ? `${t.requestOption}: ${option}` : null, message.trim() || null].filter(Boolean).join("\n\n"),
        sourceSlug: serviceSlug ? `hoa:${serviceSlug}` : "hoa",
        honeypot,
        utm: utmFrom(window.location.search),
        route,
      });
      setState("sent");
    } catch (error) {
      setState(error instanceof BookingApiError && error.status === 429 ? "limited" : "error");
    }
  }

  if (state === "sent") {
    return (
      <div className="space-y-2" role="status">
        <h2 className="text-2xl text-hoa-ink">{t.requestSent}</h2>
        <p className="text-hoa-ink-muted">{t.requestSentLead}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {serviceName ? (
        <p className="text-sm text-hoa-ink-muted">
          {t.requestService}: <span className="text-hoa-ink">{serviceName}</span>
        </p>
      ) : null}
      {options?.length ? (
        <label className="block text-sm text-hoa-ink-muted" htmlFor="option">
          {t.requestOption}
          <select id="option" name="option" value={option} onChange={(event) => setOption(event.target.value)} className={inputClass}>
            {options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </label>
      ) : null}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.firstName} name="first_name" required autoComplete="given-name" maxLength={80} value={firstName} onChange={setFirstName} />
        <Field label={t.lastName} name="last_name" required autoComplete="family-name" maxLength={80} value={lastName} onChange={setLastName} />
      </div>
      <Field label={t.email} name="email" type="email" required autoComplete="email" maxLength={255} value={email} onChange={setEmail} />
      <Field label={t.phone} name="phone" type="tel" required autoComplete="tel" maxLength={40} value={phone} onChange={setPhone} />
      <Field label={t.message} name="message" multiline maxLength={1800} value={message} onChange={setMessage} />
      <div aria-hidden="true" className="hidden">
        <label>
          Lämna tomt
          <input tabIndex={-1} autoComplete="off" name="website" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} />
        </label>
      </div>
      <PrivacyText text={t.requestPrivacy} linkLabel={t.privacyLink} />
      <label className="flex items-start gap-3 text-sm text-hoa-ink">
        <input
          type="checkbox"
          required
          checked={acknowledged}
          onChange={(event) => setAcknowledged(event.target.checked)}
          className="mt-1 size-4 accent-hoa-gold"
        />
        {t.privacyAck}
      </label>
      {state === "error" ? <Notice tone="error">{t.requestError}</Notice> : null}
      {state === "limited" ? <Notice tone="error">{t.tooMany}</Notice> : null}
      <button type="submit" className={primaryButtonClass} disabled={state === "sending" || !acknowledged}>
        {state === "sending" ? t.submitting : t.sendRequest}
      </button>
    </form>
  );
}
