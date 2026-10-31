import { Container } from "@/components/Container";
import { CtaLink } from "@/components/CtaLink";
import { PageHeader } from "@/components/PageHeader";
import { Section, cardClass } from "@/components/v2/ui";
import { site } from "@/lib/content";
import { SHORT_CALL_SLUG, bookingUrl, mailtoUrl, mapsUrl, telUrl } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Besök och kontakt",
  description: `Hitta till House of Awesome på ${site.address.street}, ${site.address.postalCode} ${site.address.city}. Telefon, mejl, öppettider och hur du bokar.`,
  path: "/besok",
});

const labelClass = "text-xs font-semibold uppercase tracking-[0.25em] text-hoa-gold";
// Block med w-fit i stället för flex, så att en lång adress kan radbrytas vid förstorad text.
const contactLink = "block w-fit max-w-full py-2 text-hoa-ink underline underline-offset-4 hover:decoration-2";

export default function BesokPage() {
  const { street, postalCode, city, countryName } = site.address;

  // Rubriken på svart, kontaktkorten på ett krämband som avslutar main.
  return (
    <>
      <Container className="pt-14 pb-12 md:pt-20 md:pb-16">
        <PageHeader
          eyebrow="Besök och kontakt"
          title="Välkommen till huset"
          lead="Här hittar du adress, kontaktuppgifter och hur du bokar en tid."
        />
      </Container>

      <Section band>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <section aria-labelledby="adress" className={cardClass}>
            <h2 id="adress" className={labelClass}>
              Adress
            </h2>
            <address className="mt-3 text-lg not-italic leading-8 text-hoa-ink">
              {site.name}
              <br />
              {street}
              <br />
              {postalCode} {city}
              <br />
              {countryName}
            </address>
            <div className="mt-5">
              <CtaLink href={mapsUrl()} variant="secondary">
                Öppna i Google Maps
              </CtaLink>
            </div>
          </section>

          <section aria-labelledby="kontakt" className={cardClass}>
            <h2 id="kontakt" className={labelClass}>
              Kontakt
            </h2>
            <dl className="mt-2 text-lg">
              <div>
                <dt className="sr-only">Telefon</dt>
                <dd>
                  <a href={telUrl()} className={contactLink}>
                    {site.contact.phoneDisplay}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="sr-only">Mejl</dt>
                <dd>
                  <a href={mailtoUrl()} className={contactLink}>
                    {site.contact.email}
                  </a>
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-sm leading-6 text-hoa-ink-muted">
              Vi delar telefon och mejl med Life Is Awesome, så du når samma team.
            </p>
          </section>

          <section aria-labelledby="oppettider" className={cardClass}>
            <h2 id="oppettider" className={labelClass}>
              Öppettider
            </h2>
            <p className="mt-3 text-hoa-ink">{site.hours.members}</p>
            <p className="mt-2 text-sm leading-6 text-hoa-ink-muted">{site.hours.staffed}</p>
          </section>

          <section aria-labelledby="boka" className={cardClass}>
            <h2 id="boka" className={labelClass}>
              Boka
            </h2>
            <p className="mt-3 text-sm leading-6 text-hoa-ink-muted">
              Du bokar hos Life Is Awesome, där vi har en gemensam kalender för båda verksamheterna.
              Osäker på vad som passar? Börja med ett kostnadsfritt kort samtal.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <CtaLink href={bookingUrl(null, "visit_page")}>Boka tid</CtaLink>
              <CtaLink href={bookingUrl(SHORT_CALL_SLUG, "visit_page")} variant="secondary">
                Boka ett kort samtal
              </CtaLink>
            </div>
          </section>
        </div>
      </Section>
    </>
  );
}
