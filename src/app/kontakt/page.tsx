import type { Metadata } from "next";

import { CtaLink } from "@/components/CtaLink";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { formatAddress, site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Kontakt",
};

export default function KontaktPage() {
  return (
    <Container className="py-16 sm:py-20">
      <PageHeader
        eyebrow="Hör av dig"
        title="Kontakt"
        lead="Ingen påhittad e-post eller telefon i fas 1. Använd bokning och Professional-länkarna hos Life Is Awesome, eller kom till adressen."
      />

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <section className="border border-hoa-line bg-hoa-bg-elevated p-8">
          <h2 className="text-lg text-hoa-ink">Sessioner</h2>
          <p className="mt-3 text-sm leading-6 text-hoa-ink-muted">
            Bokning och frågor om tider går via {site.sibling.name}.
          </p>
          <div className="mt-6">
            <CtaLink href={site.ctas.booking.href}>{site.ctas.booking.label}</CtaLink>
          </div>
        </section>
        <section className="border border-hoa-line bg-hoa-bg-elevated p-8">
          <h2 className="text-lg text-hoa-ink">Showroom / B2B</h2>
          <p className="mt-3 text-sm leading-6 text-hoa-ink-muted">
            Företag och kliniker hänvisas till LIA Professional.
          </p>
          <div className="mt-6">
            <CtaLink href={site.ctas.b2b.href} variant="secondary">
              {site.ctas.b2b.label}
            </CtaLink>
          </div>
        </section>
      </div>

      <p className="mt-8 text-sm text-hoa-ink-muted">
        Adress: {formatAddress()}. {site.hoursNote}
      </p>
    </Container>
  );
}
