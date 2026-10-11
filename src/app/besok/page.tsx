import { Container } from "@/components/Container";
import { CtaLink } from "@/components/CtaLink";
import { PageHeader } from "@/components/PageHeader";
import { site } from "@/lib/content";
import { SHORT_CALL_SLUG, bookingUrl, mailtoUrl, mapsUrl, telUrl } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Besök och kontakt",
  description: `Hitta till House of Awesome på ${site.address.street}, ${site.address.postalCode} ${site.address.city}. Telefon, mejl, öppettider och hur du bokar.`,
  path: "/besok",
});

const cardClass = "rounded-2xl border border-hoa-gold/20 bg-hoa-secondary/20 p-6 md:p-8";
const labelClass = "text-xs font-semibold uppercase tracking-[0.25em] text-hoa-gold";

export default function BesokPage() {
  const { street, postalCode, city, countryName } = site.address;

  return (
    <Container className="py-16 md:py-24">
      <PageHeader
        eyebrow="Besök och kontakt"
        title="Välkommen till huset"
        lead="Här hittar du adress, kontaktuppgifter och hur du bokar en tid."
      />

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <section aria-labelledby="adress" className={cardClass}>
          <h2 id="adress" className={labelClass}>
            Adress
          </h2>
          <address className="mt-4 text-lg not-italic leading-8 text-hoa-ink">
            {site.name}
            <br />
            {street}
            <br />
            {postalCode} {city}
            <br />
            {countryName}
          </address>
          <div className="mt-6">
            <CtaLink href={mapsUrl()} variant="secondary">
              Öppna i Google Maps
            </CtaLink>
          </div>
        </section>

        <section aria-labelledby="kontakt" className={cardClass}>
          <h2 id="kontakt" className={labelClass}>
            Kontakt
          </h2>
          <dl className="mt-4 space-y-3 text-lg">
            <div>
              <dt className="sr-only">Telefon</dt>
              <dd>
                <a href={telUrl()} className="text-hoa-ink hover:text-hoa-gold">
                  {site.contact.phoneDisplay}
                </a>
              </dd>
            </div>
            <div>
              <dt className="sr-only">Mejl</dt>
              <dd>
                <a href={mailtoUrl()} className="break-all text-hoa-ink hover:text-hoa-gold">
                  {site.contact.email}
                </a>
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-sm leading-6 text-hoa-ink-muted">
            Vi delar telefon och mejl med Life Is Awesome, så du når samma team.
          </p>
        </section>

        <section aria-labelledby="oppettider" className={cardClass}>
          <h2 id="oppettider" className={labelClass}>
            Öppettider
          </h2>
          <p className="mt-4 text-hoa-ink">{site.hours.members}</p>
          <p className="mt-2 text-sm leading-6 text-hoa-ink-muted">{site.hours.staffed}</p>
        </section>

        <section aria-labelledby="boka" className={cardClass}>
          <h2 id="boka" className={labelClass}>
            Boka
          </h2>
          <p className="mt-4 text-sm leading-6 text-hoa-ink-muted">
            Du bokar hos Life Is Awesome, där vi har en gemensam kalender för båda verksamheterna.
            Osäker på vad som passar? Börja med ett kostnadsfritt kort samtal.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <CtaLink href={bookingUrl(null, "visit_page")}>Boka tid</CtaLink>
            <CtaLink href={bookingUrl(SHORT_CALL_SLUG, "visit_page")} variant="secondary">
              Boka ett kort samtal
            </CtaLink>
          </div>
        </section>
      </div>
    </Container>
  );
}
