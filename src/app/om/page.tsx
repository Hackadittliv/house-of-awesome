import { CtaLink } from "@/components/CtaLink";
import { Avatar, Card, Grid, Hero, Section } from "@/components/v2/ui";
import { PORTRAITS } from "@/lib/people";
import { pageMetadata } from "@/lib/seo";

import { site } from "@/lib/content";

export const metadata = pageMetadata({
  title: "Om oss",
  description: "House of Awesome drivs av Life is Awesome AB. Möt teamet bakom huset.",
  path: "/om",
});

const team: [string, string, string, keyof typeof PORTRAITS | null][] = [
  ["Medgrundare", "Patrik Nilsson", "Certifierad Wim Hof Method-instruktör och trebarnspappa. Byggde tidigare ett åkeri med 200 lastbilar. Leder utveckling och partnerskap.", "patrik"],
  ["Medgrundare", "Alexandra Schneider", "Ansvarar för innehåll och drift. Medförfattare till boken Allt ligger i livsstilen.", null],
  ["Coach", "Lucas Eliasson", "Coach och ansvarig för gymmet och Basläger. Bygger träningskonceptet och tar hand om medlemmarna.", "lucas"],
  ["Digitalt", "Christian Wederbrand", "Bygger den digitala plattformen: webb, bokning, medlemsportal och partnernätverket.", null],
  ["Delägare", "Per Berglund", "Delägare och investerare genom EB Invest. Bidrar med erfarenhet av att bygga bolag.", null],
];

// Kortad från "Vår story" på lifeisawesome.se/om-oss.
const story = [
  ["En vanlig familj", "Vi heter Patrik och Alexandra och har tre barn. Vi levde ett vanligt liv med jobb och vardag, tills hälsan blev akut."],
  ["När kroppen sa något annat", "Alexandra blev långvarigt dålig. Energin försvann och vardagen förändrades. Tester såg ofta bra ut, men kroppen sa något helt annat."],
  ["Rätt ordning spelar roll", "Vi testade, läste, reste och betalade. En insikt kom långsamt: även bra metoder kan bli fel om du börjar i fel ände."],
  ["Kartan växte fram", "Patrik pratade med läkare, terapeuter, forskare och människor som tagit sig tillbaka. Alexandra började lyssna på kroppen igen: mat, mage, rytm och återhämtning."],
  ["Därför finns huset", "Vi vill göra vägen kortare för dig. Här samlar vi det vi själva hade behövt, i ett hus i Stora Höga."],
];

export default function Page() {
  return (
    <>
      <Hero eyebrow="Där vetenskap, själ och rörelse möts" title="Vi lovar inga mirakel" lead="Vi delar det som fungerade för oss och våra medlemmar." />
      <Section>
        <div className="mx-auto max-w-2xl space-y-6 text-center text-hoa-ink/90">
          <p>House of Awesome drivs av Life is Awesome AB. Vi utvecklar protokoll med noggrant utvalda teknikpartners och provar dem här i vårt eget hus.</p>
          <p>Genom Life is Awesome Professional hjälper vi andra att bygga framtidens hälsoanläggning.</p>
        </div>
      </Section>
      <Section id="story" eyebrow="Vår story" title="Vi byggde platsen vi själva hade behövt" band>
        <div className="mx-auto max-w-2xl space-y-8">
          {story.map(([title, text]) => (
            <article key={title} className="space-y-2">
              <h3 className="text-xl text-hoa-ink">{title}</h3>
              <p className="leading-relaxed text-hoa-ink/85">{text}</p>
            </article>
          ))}
          <div className="text-center"><CtaLink href={`${site.operator.url.replace(/\/$/, "")}/om-oss`} variant="secondary">Läs hela storyn på lifeisawesome.se</CtaLink></div>
        </div>
      </Section>
      <Section eyebrow="Teamet" title="Människorna bakom huset" band>
        <Grid>
          {team.map(([role, name, text, portrait]) => (
            <Card key={name} label={role} title={name} text={text}>
              {portrait ? <Avatar {...PORTRAITS[portrait]} /> : null}
            </Card>
          ))}
        </Grid>
      </Section>
    </>
  );
}
