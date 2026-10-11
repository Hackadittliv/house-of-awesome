"use client";

import Link from "next/link";
import { useId, useState } from "react";

import { useConsent } from "@/components/consent/ConsentProvider";

const buttonBase =
  "inline-flex min-h-11 items-center justify-center rounded-full px-6 py-2 font-display text-sm font-medium transition-colors";
const choiceButton = `${buttonBase} border border-hoa-gold/40 bg-hoa-bg text-hoa-ink hover:bg-hoa-gold/10`;

export function ConsentBanner() {
  const { ready, choice, settingsOpen, closeSettings, save } = useConsent();
  const [detailed, setDetailed] = useState(false);
  const titleId = useId();

  if (!ready || (choice && !settingsOpen)) return null;

  const showDetails = detailed || settingsOpen;

  return (
    <section
      role="region"
      aria-labelledby={titleId}
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-hoa-line bg-hoa-card/95 shadow-[0_-8px_30px_-4px_rgba(0,0,0,0.65)] backdrop-blur-md"
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
        <h2 id={titleId} className="text-xl text-hoa-ink sm:text-2xl">
          Cookies och integritet
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-hoa-ink-muted">
          Vi sparar ditt val i webbläsaren, det är det enda som behövs för att sajten ska fungera.
          Analys och marknadsföring används bara om du säger ja, och inget sådant laddas innan du
          har valt. Läs mer under{" "}
          <Link href="/cookies" className="text-hoa-gold underline underline-offset-4">
            cookies
          </Link>
          .
        </p>

        {showDetails ? (
          <ConsentDetails
            key={choice?.updatedAt ?? "ny"}
            initialAnalytics={choice?.analytics ?? false}
            initialMarketing={choice?.marketing ?? false}
            onSave={save}
            onCancel={settingsOpen ? closeSettings : () => setDetailed(false)}
          />
        ) : (
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className={choiceButton} onClick={() => save(true, true)}>
              Godkänn alla
            </button>
            <button type="button" className={choiceButton} onClick={() => save(false, false)}>
              Endast nödvändiga
            </button>
            <button
              type="button"
              className={`${buttonBase} text-hoa-gold underline-offset-4 hover:underline`}
              onClick={() => setDetailed(true)}
            >
              Välj själv
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

type ConsentDetailsProps = {
  initialAnalytics: boolean;
  initialMarketing: boolean;
  onSave: (analytics: boolean, marketing: boolean) => void;
  onCancel: () => void;
};

function ConsentDetails({ initialAnalytics, initialMarketing, onSave, onCancel }: ConsentDetailsProps) {
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [marketing, setMarketing] = useState(initialMarketing);

  return (
    <form
      className="mt-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(analytics, marketing);
      }}
    >
      <fieldset className="grid gap-3 sm:grid-cols-3">
        <legend className="sr-only">Välj vilka kategorier du godkänner</legend>
        <label className="flex gap-3 rounded-lia-md border border-hoa-gold/20 bg-hoa-secondary/20 p-3 text-sm">
          <input type="checkbox" checked disabled className="mt-1 accent-[var(--hoa-gold)]" />
          <span>
            <span className="block text-hoa-ink">Nödvändiga</span>
            <span className="text-hoa-ink-muted">Sparar ditt val. Alltid på.</span>
          </span>
        </label>
        <label className="flex cursor-pointer gap-3 rounded-lia-md border border-hoa-gold/20 bg-hoa-secondary/20 p-3 text-sm">
          <input
            type="checkbox"
            checked={analytics}
            onChange={(event) => setAnalytics(event.target.checked)}
            className="mt-1 accent-[var(--hoa-gold)]"
          />
          <span>
            <span className="block text-hoa-ink">Analys</span>
            <span className="text-hoa-ink-muted">Hjälper oss förstå hur sajten används.</span>
          </span>
        </label>
        <label className="flex cursor-pointer gap-3 rounded-lia-md border border-hoa-gold/20 bg-hoa-secondary/20 p-3 text-sm">
          <input
            type="checkbox"
            checked={marketing}
            onChange={(event) => setMarketing(event.target.checked)}
            className="mt-1 accent-[var(--hoa-gold)]"
          />
          <span>
            <span className="block text-hoa-ink">Marknadsföring</span>
            <span className="text-hoa-ink-muted">Mäter annonser i sociala medier.</span>
          </span>
        </label>
      </fieldset>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="submit" className={choiceButton}>
          Spara mitt val
        </button>
        <button
          type="button"
          className={`${buttonBase} text-hoa-gold underline-offset-4 hover:underline`}
          onClick={onCancel}
        >
          Avbryt
        </button>
      </div>
    </form>
  );
}
