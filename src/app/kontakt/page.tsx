import { CtaLink } from "@/components/CtaLink";
import { Card, Grid, Hero, Section, TwoWays } from "@/components/v2/ui";
import { SHORT_CALL_SLUG, bookingUrl, mailtoUrl, mapsUrl, telUrl } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";

import { site } from "@/lib/content";

export const metadata = pageMetadata({
  title: "Boka & kontakt",
  description: "Boka behandling eller kostnadsfri rådgivning. Brålandsvägen 29, Stora Höga.",
  path: "/kontakt",
});

export default function Page() {
  return (
    <>
      <Hero eyebrow="Boka & kontakt" title="Hur vill du börja?" lead="Brålandsvägen 29 i Stora Höga, 30 minuter norr om Göteborg." />
      <Section>
        <TwoWays bookHref={bookingUrl(null, "kontakt")} adviceHref={bookingUrl(SHORT_CALL_SLUG, "kontakt")} />
      </Section>
      <Section band>
        <Grid cols={4}>
          <Card label="Hitta hit" title="Vägbeskrivning" text="Brålandsvägen 29, 444 60 Stora Höga">
            <CtaLink href={mapsUrl()} size="sm" variant="secondary" className="mt-auto w-fit">Öppna karta</CtaLink>
          </Card>
          <Card title="E-post" text={<a href={mailtoUrl()} className="text-hoa-gold hover:underline">{site.contact.email}</a>} />
          <Card title="Telefon" text={<a href={telUrl()} className="text-hoa-gold hover:underline">073-349 08 36</a>} />
          <Card title="Öppettider" text="Gym 24/7 för medlemmar. Bemannat enligt bokning." />
        </Grid>
      </Section>
    </>
  );
}
