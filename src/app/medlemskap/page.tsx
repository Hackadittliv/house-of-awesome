import { CtaLink } from "@/components/CtaLink";
import { Bullets, Card, Grid, Hero, Section } from "@/components/v2/ui";
import { membershipUrl } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";

import { getMemberships, formatSek } from "@/lib/content";

export const metadata = pageMetadata({
  title: "Gym & medlemskap",
  description: "Longevity-gym dygnet runt i Stora Höga, från 599 kr/mån.",
  path: "/medlemskap",
});

const values: Record<string, string> = {
  Gym: "Värde: rödljus 4 × 250 kr = 1 000 kr/mån + gym",
  Longevity: "Värde: rödljus 8 × 250 kr = 2 000 kr/mån + gym",
  "Longevity Plus": "Värde: 4 × Awesome Protocol = 2 980 kr/mån + gym",
  "Longevity Max": "Värde: 8 × Awesome Protocol = 5 960 kr/mån + gym, InBody, plan",
};

export default function Page() {
  const plans = getMemberships();
  return (
    <>
      <Hero eyebrow="Gym & medlemskap" title="Longevity-gym dygnet runt" lead="Från 599 kr/mån.">
        <CtaLink href="#medlemskap">Se medlemskapen</CtaLink>
      </Hero>
      <Section id="gymmet">
        <Grid cols={4}>
          <Card label="Kraft" title="Gymmet" text="Styrka för hela kroppen, anpassad efter din nivå." />
          <Card label="Syre" title="EWOT" text="Intervallträning med högkoncentrerat syre." />
          <Card label="Återhämtning" title="Rödljus" text="Ingår i alla medlemskap." />
          <Card id="baslager" label="Coachat" title="Basläger" text={'Funktionell träning med kettlebells och vikter, ledd av coach Lukas "Raw" Eliasson.'} />
        </Grid>
      </Section>
      <Section id="medlemskap" eyebrow="Medlemskap" title="Din hälsa, på dina villkor" lead="Alla medlemskap ger dig gymmet dygnet runt och en egen träningsplan." band>
        <Grid cols={4}>
          {plans.map((plan, i) => (
            <Card key={plan.priceId} label={`Medlemskap ${i + 1}`} title={plan.name} price={`${formatSek(plan.pricePerMonth)}/mån`} text={plan.tagline} featured={plan.featured}>
              <Bullets items={plan.items} />
              <p className="text-xs text-hoa-ink-muted">{values[plan.name]}</p>
              <CtaLink href={membershipUrl(plan.priceId, "membership_page")} size="sm" className="mt-auto w-full">Välj {plan.name}</CtaLink>
            </Card>
          ))}
        </Grid>
        <p className="mt-8 text-center text-sm text-hoa-ink-muted">Alla medlemskap: gym dygnet runt · introduktion och träningsplan · 12 månaders bindningstid</p>
      </Section>
    </>
  );
}
