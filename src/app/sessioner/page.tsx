import type { Metadata } from "next";

import { CtaLink } from "@/components/CtaLink";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { getActiveSessions, site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Sessioner",
};

export default function SessionerPage() {
  const sessions = getActiveSessions();

  return (
    <Container className="py-16 sm:py-20">
      <PageHeader
        eyebrow="Boka"
        title="Sessioner"
        lead="Bokning och aktuella tider ligger hos Life Is Awesome. House of Awesome publicerar inte kronpriser i fas 1."
      />

      <div className="mt-10 flex flex-wrap gap-3">
        <CtaLink href={site.ctas.booking.href}>{site.ctas.booking.label}</CtaLink>
        <CtaLink href="/showroom" variant="secondary">
          Showroom
        </CtaLink>
      </div>

      {sessions.length === 0 ? (
        <div className="mt-12 border border-hoa-line bg-hoa-bg-elevated p-8">
          <h2 className="text-lg text-hoa-ink">Katalog ej ifylld</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-hoa-ink-muted">
            `content/sessions.json` är tom. Fält för kommande CMS finns redan:
            namn, längd, `price_single`, `price_10pack` och `book_url`. Lämna
            prisfält tomma tills officiella belopp finns — visa dem inte som
            påhittade kronor här.
          </p>
          <p className="mt-4 text-sm text-hoa-ink-muted">
            Deep-link för bokning:{" "}
            <a
              href={site.ctas.booking.href}
              className="text-hoa-gold hover:text-hoa-gold-hover"
              target="_blank"
              rel="noopener noreferrer"
            >
              {site.ctas.booking.href}
            </a>
          </p>
        </div>
      ) : (
        <ul className="mt-12 grid gap-4">
          {sessions.map((session) => (
            <li
              key={session.slug}
              className="flex flex-col gap-3 border border-hoa-line bg-hoa-bg-elevated p-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h2 className="text-lg text-hoa-ink">{session.name}</h2>
                <p className="mt-1 text-sm text-hoa-ink-muted">
                  {session.duration_min
                    ? `${session.duration_min} minuter`
                    : "Längd meddelas i bokningen"}
                </p>
              </div>
              <CtaLink href={session.book_url || site.ctas.booking.href}>
                Boka
              </CtaLink>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
