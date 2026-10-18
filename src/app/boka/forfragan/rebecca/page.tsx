import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { ClientOnly } from "@/components/booking/ClientOnly";
import { RequestForm } from "@/components/booking/RequestForm";
import { CtaLink } from "@/components/CtaLink";
import { bookingEnabled } from "@/lib/booking/config";
import { REBECCA } from "@/lib/rebecca";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Förfrågan om healing hos Rebecca",
  description: "Skicka en förfrågan om energimedicinsk healingterapi (EMHT) med Rebecca Gustafsson.",
  path: "/boka/forfragan/rebecca",
});

export default function RebeccaRequestPage() {
  return (
    <Container className="py-16 md:py-24">
      <div className="mx-auto max-w-2xl space-y-10">
        <PageHeader eyebrow="Förfrågan · Healing" title="Boka healing hos Rebecca" lead="Välj upplägg och skicka en förfrågan. Rebecca hör av sig med förslag på tid." />
        {bookingEnabled ? (
          <ClientOnly>
            <RequestForm serviceSlug="healing-emht" serviceName={REBECCA.service} route="rebecca" options={REBECCA.options.map((o) => `${o.label}, ${o.price}`)} />
          </ClientOnly>
        ) : (
          <CtaLink href={`mailto:${REBECCA.fallbackEmail}?subject=${encodeURIComponent("Förfrågan om healing")}`}>Mejla Rebecca</CtaLink>
        )}
      </div>
    </Container>
  );
}
