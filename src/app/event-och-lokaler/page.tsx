import { CtaLink } from "@/components/CtaLink";
import { Card, Grid, Hero, Section, Soon } from "@/components/v2/ui";
import { mailtoUrl } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Event & lokaler",
  description: "Föreläsningar, workshops och heldagar i House of Awesome. Hyr huset för ditt event.",
  path: "/event-och-lokaler",
});

export default function Page() {
  const inquiry = mailtoUrl("Förfrågan om event i House of Awesome");
  return (
    <>
      <Hero eyebrow="Event · Workshops · Föreläsningar" title="Ett hus att samlas i" lead="Egna föreläsningar och workshops, och ett hus du kan hyra för dina." />
      <Section eyebrow="Kommande i huset" title="Kalendern">
        <Grid>
          <Card label="Inspirationsdag" title="Cirkeln" text="Flera av våra partners delar scenen. Föreläsningar, provsessioner och samtal."><Soon>Datum kommer snart</Soon></Card>
          <Card label="Workshop" title="Andning & kyla" text="Andning, fokus och kallexponering med certifierad Wim Hof Method-instruktör."><Soon>Datum kommer snart</Soon></Card>
          <Card label="Föreläsning" title="Allt ligger i livsstilen" text="Patrik och Alexandra om grunden för ett långt och friskt liv."><Soon>Datum kommer snart</Soon></Card>
        </Grid>
      </Section>
      <Section id="hyr" eyebrow="Hyr huset" title="Håll ditt event hos oss" lead="För föreläsare, coacher, terapeuter och företag. Dina deltagare får mer än en vanlig konferenslokal." band>
        <Grid cols={4}>
          <Card title="Föreläsning" text="Kvällsföreläsning med mingel och möjlighet att prova sessioner." />
          <Card title="Workshop" text="Halvdag med praktiska moment i gym och behandlingsrum." />
          <Card title="Heldag" text="Program från morgon till eftermiddag med mat, föreläsning och upplevelser." />
          <Card title="Företagsdag" text="Friskvård för teamet: mätningar, inspiration och The Awesome Protocol." />
        </Grid>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Soon>Platser, teknik och priser kommer snart</Soon>
          <CtaLink href={inquiry}>Förfrågan om event</CtaLink>
        </div>
      </Section>
    </>
  );
}
