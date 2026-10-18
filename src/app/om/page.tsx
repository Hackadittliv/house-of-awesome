import { CtaLink } from "@/components/CtaLink";
import { Card, Grid, Hero, Section, Soon } from "@/components/v2/ui";
import { pageMetadata } from "@/lib/seo";

import { site } from "@/lib/content";

export const metadata = pageMetadata({
  title: "Om oss",
  description: "House of Awesome drivs av Life is Awesome AB. Möt teamet bakom huset.",
  path: "/om",
});

const team = [
  ["Medgrundare", "Patrik Nilsson", "Certifierad Wim Hof Method-instruktör och trebarnspappa. Byggde tidigare ett åkeri med 200 lastbilar. Leder utveckling och partnerskap."],
  ["Medgrundare", "Alexandra Schneider", "Ansvarar för innehåll och drift. Medförfattare till boken Allt ligger i livsstilen."],
  ["Coach", "Lukas Eliasson", "Coach och ansvarig för gymmet och Basläger. Bygger träningskonceptet och tar hand om medlemmarna."],
  ["Digitalt", "Christian Wederbrand", "Bygger den digitala plattformen: webb, bokning, medlemsportal och partnernätverket."],
  ["Delägare", "Per Berglund", "Delägare och investerare genom EB Invest. Bidrar med erfarenhet av att bygga bolag."],
];

export default function Page() {
  return (
    <>
      <Hero eyebrow="Där vetenskap, själ och rörelse möts" title="Vi lovar inga mirakel" lead="Vi delar det som fungerade för oss och våra medlemmar." />
      <Section>
        <div className="mx-auto max-w-2xl space-y-6 text-center text-hoa-ink/90">
          <p>House of Awesome drivs av Life is Awesome AB. Vi utvecklar protokoll med noggrant utvalda teknikpartners och provar dem här i vårt eget hus.</p>
          <p>Genom Life is Awesome Professional hjälper vi andra att bygga framtidens hälsoanläggning.</p>
          <Soon>Hela vår story kommer snart</Soon>
          <div><CtaLink href={site.operator.url} variant="secondary">Till lifeisawesome.se</CtaLink></div>
        </div>
      </Section>
      <Section eyebrow="Teamet" title="Människorna bakom huset" band>
        <Grid>
          {team.map(([role, name, text]) => <Card key={name} label={role} title={name} text={text} />)}
        </Grid>
      </Section>
    </>
  );
}
