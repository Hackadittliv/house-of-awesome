import { CtaLink } from "@/components/CtaLink";
import { Card, Grid, Hero, Section, Steps } from "@/components/v2/ui";
import { bookingUrl } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "The Awesome Protocol",
  description: "Vårt signaturpass på 60 minuter: kraft, syre och ljus i Zazen Scalar-fältet.",
  path: "/awesome-protocol",
});

export default function Page() {
  return (
    <>
      <Hero eyebrow="Signaturpass" title="The Awesome Protocol" lead="60 minuter, tre steg. Ett komplett pass för styrka, kondition och återhämtning.">
        <CtaLink href={bookingUrl("awesome-protocol", "protocol_hero")}>Boka ett provpass</CtaLink>
      </Hero>
      <Section>
        <Steps steps={[
          { label: "Ca 25 min", title: "Kraft", text: "Kettlebells och funktionell styrka för hela kroppen." },
          { label: "Ca 20 min", title: "Syre", text: "EWOT, intervallträning med högkoncentrerat syre via mask." },
          { label: "15 min", title: "Ljus", text: "Rödljus som avslut. Ett skönt sätt att varva ner." },
        ]} />
        <p className="mt-8 text-center text-sm text-hoa-ink-muted">Ingår i Longevity Plus (4 pass per månad) och Longevity Max (8 pass per månad).</p>
      </Section>
      <Section band>
        <Grid cols={4}>
          <Card title="För vem" text="Dig som vill få ut mest av lite tid, oavsett ålder eller träningsvana." />
          <Card title="Hur ofta" text="En till två gånger i veckan räcker långt." />
          <Card title="Första gången" text="Vi går igenom allt med dig och mäter din startpunkt med InBody." />
          <Card title="Enskilt pass" text="EWOT 495 kr + rödljus 250 kr, eller via medlemskap." />
        </Grid>
      </Section>
    </>
  );
}
