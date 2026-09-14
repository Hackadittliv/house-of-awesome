import type { Metadata } from "next";

import { CtaLink } from "@/components/CtaLink";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Besök",
};

export default function BesokPage() {
  const { street, city, country } = site.address;

  return (
    <Container className="py-16 sm:py-20">
      <PageHeader
        eyebrow="Adress"
        title="Besök House of Awesome"
        lead="Kliniken och showroom ligger i Stora Höga. Öppettider är inte publicerade ännu."
      />

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <section className="border border-hoa-line bg-hoa-bg-elevated p-8">
          <h2 className="text-xs uppercase tracking-[0.18em] text-hoa-gold">
            Adress
          </h2>
          <p className="mt-4 text-lg text-hoa-ink">
            {street}
            <br />
            {city}
            <br />
            {country}
          </p>
        </section>
        <section className="border border-hoa-line bg-hoa-bg-elevated p-8">
          <h2 className="text-xs uppercase tracking-[0.18em] text-hoa-gold">
            Öppettider
          </h2>
          <p className="mt-4 text-lg text-hoa-ink">{site.hoursNote}</p>
          <p className="mt-3 text-sm text-hoa-ink-muted">
            Inga tider är påhittade. Fältet fylls när schemat är klart.
          </p>
        </section>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <CtaLink href={site.ctas.booking.href}>{site.ctas.booking.label}</CtaLink>
        <CtaLink href="/kontakt" variant="secondary">
          Kontakt
        </CtaLink>
      </div>
    </Container>
  );
}
