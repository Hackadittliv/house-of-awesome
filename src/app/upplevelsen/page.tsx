import type { Metadata } from "next";

import { CtaLink } from "@/components/CtaLink";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Upplevelsen",
};

const steps = [
  {
    title: "Ankomst",
    text: "Kliniken ligger på Brålandsvägen 29 i Stora Höga. Öppettider publiceras när de är satta.",
  },
  {
    title: "Session på utrustning",
    text: "Besöket är byggt kring automatiserade, utrustningsledda pass — inte runt en stor terapeutstab.",
  },
  {
    title: "Showroom",
    text: "Samma hus rymmer ett Professional-showroom. Företag går vidare till LIA Professional.",
  },
];

export default function UpplevelsenPage() {
  return (
    <Container className="py-16 sm:py-20">
      <PageHeader
        eyebrow="Besöket"
        title="Så fungerar House of Awesome"
        lead="En longevityklinik och ett showroom i samma hus. Fas 1 beskriver riktningen — inte ett färdigt behandlingsprogram."
      />

      <ol className="mt-14 grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="border border-hoa-line bg-hoa-bg-elevated p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-hoa-gold">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-3 text-lg text-hoa-ink">{step.title}</h2>
            <p className="mt-3 text-sm leading-6 text-hoa-ink-muted">{step.text}</p>
          </li>
        ))}
      </ol>

      <div className="mt-12 flex flex-wrap gap-3">
        <CtaLink href={site.ctas.booking.href}>{site.ctas.booking.label}</CtaLink>
        <CtaLink href="/sessioner" variant="secondary">
          Sessioner
        </CtaLink>
      </div>
    </Container>
  );
}
