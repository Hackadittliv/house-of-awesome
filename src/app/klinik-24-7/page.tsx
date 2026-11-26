import { CtaLink } from "@/components/CtaLink";
import { Card, Grid, Hero, Section, Soon, Steps } from "@/components/v2/ui";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "24/7-klinik",
  description: "Obemannad longevity-klinik med rödljus, Scalar-fält och bokning i mobilen.",
  path: "/klinik-24-7",
});

export default function Page() {
  return (
    <>
      <Hero eyebrow="Obemannad longevity-klinik" title="Longevity dygnet runt" lead="Vi planerar mindre, obemannade kliniker med rödljus och Zazen Scalar. Här kan du läsa om konceptet.">
        <CtaLink href="/medlemskap">Se medlemskapen för huset i Stora Höga</CtaLink>
      </Hero>
      <Section>
        <Grid>
          <Card label="Återhämtning" title="Rödljussäng" text="15 minuter helkroppsljus." />
          <Card label="Fältet" title="Zazen Scalar 300 Core" text="Varje klinik har ett eget Scalar-fält." />
          <Card label="Påfyllning" title="Kaffe & hälsoprodukter" text="Vårt eget longevity-kaffe för 30 kr och ett utvalt sortiment i automaten." />
        </Grid>
      </Section>
      <Section eyebrow="Så fungerar det" title="Så planeras ett besök på en framtida klinik" band>
        <Steps steps={[
          { label: "Körkort", text: "En introduktion i House of Awesome eller digitalt." },
          { label: "Boka", text: "Välj tid i appen. Dörren öppnas med mobilen." },
          { label: "Följ ditt protokoll", text: "Pass och resultat loggas i medlemsportalen." },
        ]} />
        <div className="mt-8 text-center"><Soon>Appen och klinikerna kommer snart</Soon></div>
      </Section>
    </>
  );
}
