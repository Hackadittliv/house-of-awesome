import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { ClientOnly } from "@/components/booking/ClientOnly";
import { RequestForm } from "@/components/booking/RequestForm";
import { CtaLink } from "@/components/CtaLink";
import { bookingEnabled } from "@/lib/booking/config";
import { mailtoUrl } from "@/lib/links";
import { SANDRA } from "@/lib/sandra";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Förfrågan om massage hos Sandra",
  description: "Skicka en förfrågan om svensk klassisk massage med Sandra Bengts, friskvårdsmassör hos House of Awesome.",
  path: SANDRA.requestPath,
});

export default function SandraRequestPage() {
  return (
    <Container className="py-16 md:py-24">
      <div className="mx-auto max-w-2xl space-y-10">
        <PageHeader eyebrow="Förfrågan · Massage" title="Förfrågan om massage hos Sandra" lead="Välj upplägg och skicka en förfrågan. Vi hör av oss med förslag på tid." />
        <p className="text-hoa-ink-muted">{SANDRA.location}</p>
        {bookingEnabled ? (
          <ClientOnly>
            <RequestForm serviceSlug={SANDRA.serviceSlug} serviceName={`${SANDRA.service} hos ${SANDRA.name}`} options={SANDRA.options.map((o) => `${o.label}, ${o.price}`)} />
          </ClientOnly>
        ) : (
          <CtaLink href={mailtoUrl("Förfrågan om massage hos Sandra Bengts")}>Mejla huset om massage hos Sandra</CtaLink>
        )}
      </div>
    </Container>
  );
}
