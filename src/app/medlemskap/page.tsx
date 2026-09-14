import type { Metadata } from "next";

import { CtaLink } from "@/components/CtaLink";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Medlemskap",
};

export default function MedlemskapPage() {
  return (
    <Container className="py-16 sm:py-20">
      <PageHeader
        eyebrow="Kommer"
        title="Medlemskap"
        lead="Medlemslogik byggs inte i fas 1. Sidan finns så att navigation och senare innehåll har en tydlig plats."
      />

      <div className="mt-10 max-w-2xl border border-hoa-line bg-hoa-bg-elevated p-8">
        <h2 className="text-lg text-hoa-ink">Placeholder</h2>
        <p className="mt-3 text-sm leading-6 text-hoa-ink-muted">
          Inga paket, poäng eller priser listas här. När medlemskap lanseras
          kopplas det till samma innehållsmodell och till bokning hos Life Is
          Awesome.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <CtaLink href={site.ctas.booking.href}>{site.ctas.booking.label}</CtaLink>
        <CtaLink href="/faq" variant="secondary">
          FAQ
        </CtaLink>
      </div>
    </Container>
  );
}
