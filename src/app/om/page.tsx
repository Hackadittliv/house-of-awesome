import type { Metadata } from "next";

import { CtaLink } from "@/components/CtaLink";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Om",
};

export default function OmPage() {
  return (
    <Container className="py-16 sm:py-20">
      <PageHeader
        eyebrow={site.shortName}
        title="Om House of Awesome"
        lead="Longevityklinik och professionell showroom i Stora Höga. Syskon till Life Is Awesome. Namnbyte från The House of Wellness."
      />

      <div className="mt-12 max-w-2xl space-y-6 text-sm leading-7 text-hoa-ink-muted">
        <p>
          House of Awesome är inte en kopia av tidigare HOW-sidor om
          osteopati eller massage. Fas 1 beskriver en utrustningsledd klinik
          med få terapeuter och ett fullt Professional-showroom.
        </p>
        <p>
          Innehåll v1 ligger i repo som JSON med fältnamn redo för senare
          extrakt till ett gemensamt CMS med {site.sibling.shortName}. Ingen
          egen bokningsmotor och ingen Supabase-koppling i den här fasen.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <CtaLink href="/upplevelsen">Upplevelsen</CtaLink>
        <CtaLink href="/showroom" variant="secondary">
          Showroom
        </CtaLink>
      </div>
    </Container>
  );
}
