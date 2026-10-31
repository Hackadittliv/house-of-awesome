"use client";

import { useState } from "react";

/** Nyhetsbrevet saknar backend än. Formuläret skickar ingenting. */
export function Newsletter() {
  const [done, setDone] = useState(false);
  return (
    <section className="hoa-newsletter border-t border-hoa-line py-14 md:py-16">
      <div className="mx-auto max-w-xl px-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-hoa-bronze">Månadsbrev</p>
        <h2 className="mt-3 text-2xl text-hoa-ink md:text-3xl">Recept, poddavsnitt och longevity i din inkorg</h2>
        <p className="mt-3 text-hoa-ink-muted">Konkreta tips, nyheter från huset och nya event. Avsluta när du vill.</p>
        {done ? (
          <p className="mt-6 text-hoa-gold" role="status">Tack! Månadsbrevet startar snart.</p>
        ) : (
          <form
            className="mt-6 flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
          >
            <label htmlFor="nyhetsbrev-epost" className="sr-only">E-post</label>
            <input
              id="nyhetsbrev-epost"
              type="email"
              required
              placeholder="din@epost.se"
              className="min-h-12 min-w-0 flex-1 rounded-full border border-hoa-line bg-hoa-bg px-5 text-hoa-ink placeholder:text-hoa-ink-muted"
            />
            <button type="submit" className="min-h-12 rounded-full bg-hoa-gold px-8 font-display text-sm font-medium text-hoa-espresso hover:bg-hoa-gold/90">
              Prenumerera
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
