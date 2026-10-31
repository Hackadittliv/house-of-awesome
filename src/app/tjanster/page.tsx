import { Container } from "@/components/Container";
import { Disclaimer } from "@/components/Disclaimer";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { ServiceCard } from "@/components/ServiceCard";
import { Section, gridGap } from "@/components/v2/ui";
import { getBookableServices, getInquiryServices } from "@/lib/content";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Tjänster och behandlingar",
  description:
    "Tryckkammare (HBOT), Celloxy IHHT, EWOT, rödljus, coachning, InBody, blodprov och mer i House of Awesome i Stora Höga. Se längd, pris och boka direkt.",
  path: "/tjanster",
});

export default function TjansterPage() {
  const bookable = getBookableServices();
  const inquiry = getInquiryServices();

  // Rubriken på svart, tjänstekorten på ett krämband. Bandet är mains sista innehåll,
  // så den gemensamma avslutningen blir svart CTA före nyhetsbrevet.
  return (
    <>
      <Container className="pt-14 pb-12 md:pt-20 md:pb-16">
        <PageHeader
          eyebrow="Tjänster"
          title="Tjänster och behandlingar"
          lead="Allt vi erbjuder i huset och digitalt. Tjänsterna med egen kalender bokar du direkt, övriga bokar vi efter en kort förfrågan."
        />
      </Container>

      <Section band>
        <section aria-labelledby="boka-direkt">
          <h2 id="boka-direkt" className="hoa-h2 text-hoa-ink">
            Boka direkt
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-hoa-ink-muted">
            Du kommer till rätt tjänst i bokningen hos Life Is Awesome, där vi har en gemensam
            kalender.
          </p>
          <div className={`mt-6 grid grid-cols-1 ${gridGap} sm:grid-cols-2 lg:grid-cols-3`}>
            {bookable.map((service) => (
              <ServiceCard key={service.slug} service={service} placement="services_list" />
            ))}
          </div>
        </section>

        <section aria-labelledby="efter-forfragan" className="mt-14 md:mt-16">
          <h2 id="efter-forfragan" className="hoa-h2 text-hoa-ink">
            Efter förfrågan
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-hoa-ink-muted">
            Boka ett kostnadsfritt kort samtal eller mejla oss, så hittar vi en tid som passar.
          </p>
          <div className={`mt-6 grid grid-cols-1 ${gridGap} sm:grid-cols-2 lg:grid-cols-3`}>
            {inquiry.map((service) => (
              <ServiceCard key={service.slug} service={service} placement="services_list" />
            ))}
          </div>
        </section>

        <Disclaimer className="mt-14" />
      </Section>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Hem", path: "/" },
          { name: "Tjänster", path: "/tjanster" },
        ])}
      />
    </>
  );
}
