import { CtaLink } from "@/components/CtaLink";
import { Bullets, Card, Grid, Hero, Section } from "@/components/v2/ui";
import { formatSek, getMemberships } from "@/lib/content";
import { bookingUrl, membershipUrl } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Medlemskap i House of Awesome",
  description: "Jämför Medlemskap för 111 kr och All inclusive för 1 444 kr per månad i Stora Höga. Båda har sex månaders bindningstid och en kostnadsfri grundintroduktion.",
  path: "/medlemskap",
});

const memberPrices = [
  ["EWOT", "333 kr per pass"],
  ["Rödljus/PEMF", "155 kr per pass"],
  ["Celloxy IHHT", "555 kr per pass"],
  ["Celloxy IHHT, 10 pass", "4 444 kr, giltigt i 6 månader från köp"],
  ["Grundintroduktion", "Kostnadsfri"],
  ["Celloxy-körkort", "999 kr inklusive en behandling med terapeut"],
];

export default function Page() {
  return (
    <>
      <Hero eyebrow="House of Awesome i Stora Höga" title="Medlemskap i huset" lead="Boka utrustning dygnet runt efter din introduktion. Välj mellan att betala per pass och att låta EWOT och rödljus/PEMF ingå.">
        <CtaLink href="#medlemskap">Jämför medlemskapen</CtaLink>
        <CtaLink href="#medlemspriser" variant="secondary">Se medlemspriser</CtaLink>
      </Hero>
      <Section id="medlemskap" title="Välj medlemskap" lead="Båda har sex månaders bindningstid och betalas automatiskt varje månad. Alla priser inkluderar 25 % moms." band>
        <Grid cols={2}>
          {getMemberships().map((plan) => (
            <Card key={plan.priceId} title={plan.name} price={`${formatSek(plan.pricePerMonth)}/mån`} text={plan.tagline} featured={plan.featured}>
              <Bullets items={plan.items} />
              <CtaLink href={membershipUrl(plan.priceId, "membership_page")} size="sm" className="mt-auto w-fit">{plan.name} hos Life Is Awesome</CtaLink>
            </Card>
          ))}
        </Grid>
      </Section>
      <Section id="medlemspriser" title="Vad kostar ett pass?" lead="Dessa priser gäller för medlemmar. I All inclusive ingår EWOT upp till veckotaket och rödljus/PEMF utan tak.">
        <p className="mx-auto mb-6 max-w-3xl">För egen bokning i medlemskalendern gäller priserna nedan eller passen som ingår i All inclusive. Om rabatten saknas när du bokar en bemannad tjänst eller får en offert, be oss bekräfta ditt pris före betalning.</p>
        <dl className="mx-auto max-w-3xl divide-y divide-hoa-line">
          {memberPrices.map(([name, price]) => (
            <div key={name} className="grid gap-1 py-4 sm:grid-cols-2 sm:gap-6">
              <dt className="font-semibold">{name}</dt>
              <dd>{price}</dd>
            </div>
          ))}
        </dl>
      </Section>
      <Section title="Innan du bokar själv" band>
        <Grid cols={2}>
          <Card title="Introduktion och digital nyckel" text="Personalen visar hur utrustningen fungerar och godkänner din kostnadsfria grundintroduktion. När medlemskapet är betalt och introduktionen är godkänd kan din digitala nyckel aktiveras för tillträde dygnet runt. Vid avslutat eller obetalt medlemskap spärras nyckeln och medlemskalendern." />
          <Card title="Celloxy på egen hand" text="Ditt första Celloxy-pass görs med terapeut. När terapeuten godkänt ditt Celloxy-körkort kan du boka enstaka pass och köpa 10-kort i medlemsportalen. Celloxy ingår inte i All inclusive." />
          <Card id="gymmet" title="Kettlebellrummet" text="När du bokar utrustning får du också använda kettlebellrummet under din bokade tid. Rummet rymmer fyra personer samtidigt och har ingen separat bokning." />
          <Card title="Om du behöver avboka" text="Avboka senast 24 timmar före passet för att få tillbaka betalningen, klippet eller platsen i veckokvoten. Vid senare avbokning eller uteblivet besök förbrukas passet." />
        </Grid>
      </Section>
      <Section id="baslager" title="Träna med coach eller boka med terapeut">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <p>Basläger är funktionell träning med kettlebells och vikter, ledd av coach Lucas ”Raw” Eliasson.</p>
          <p>Även utan medlemskap kan du boka utrustning med terapeut under bemannade tider. Då behöver du ingen medlemsintroduktion.</p>
          <CtaLink href={bookingUrl(null, "membership_staffed")}>Se bemannade tider</CtaLink>
        </div>
      </Section>
    </>
  );
}
