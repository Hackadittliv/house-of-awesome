import { CtaLink } from "@/components/CtaLink";
import { Card, Grid, Hero, Section, Soon } from "@/components/v2/ui";
import { GiftCardForm } from "@/components/giftcard/GiftCardForm";
import { b2bUrl } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";

const b2b = () => b2bUrl("butik");

export const metadata = pageMetadata({
  title: "Butik & presentkort",
  description: "Longevity-kaffe, kosttillskott, utrustning för hemmet och presentkort från House of Awesome.",
  path: "/butik",
});

export default function Page() {
  return (
    <>
      <Hero eyebrow="Longevity-butik" title="Handplockat och noggrant utvalt" lead="Vi säljer bara det vi själva står bakom och använder varje dag." />
      <Section id="sortiment">
        <Grid cols={4}>
          <Card label="Eget märke" title="Longevity-kaffe" text="Rostat i samarbete med ett lokalt rosteri och labbtestat." />
          <Card label="Kosttillskott" title="Tillskott med kvalitet" text="Utvalda tillskott med personliga tips utifrån dina mål." />
          <Card label="Kommande" title="Träningskläder" text="Egen kollektion i naturmaterial."><Soon /></Card>
          <Card label="För hemmet" title="Utrustning" text="Tryckkammare, rödljus, PEMF och Scalar för hemmet, med installation och service.">
            <CtaLink href={b2b()} size="sm" variant="secondary" className="mt-auto w-fit">Life is Awesome Professional</CtaLink>
          </Card>
        </Grid>
        <div className="mt-8 text-center"><Soon>Webbutiken kommer snart</Soon></div>
      </Section>
      <Section id="presentkort" eyebrow="Presentkort" title="Ge bort en upplevelse" lead="Välj belopp och betala direkt. Koden kommer via e-post." band>
        <GiftCardForm />
      </Section>
    </>
  );
}
