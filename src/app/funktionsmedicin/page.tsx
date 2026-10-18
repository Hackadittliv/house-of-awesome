import { CtaLink } from "@/components/CtaLink";
import { Bullets, Card, Grid, Hero, Section } from "@/components/v2/ui";
import { SHORT_CALL_SLUG, bookingUrl, inquiryUrl } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Funktionsmedicin & tester",
  description: "Blodprover, DNA-metylering, borrelia, tungmetaller och mögel i House of Awesome.",
  path: "/funktionsmedicin",
});

// Texterna följer LIA:s formuleringar om provtagning (lifeisawesome.se).
const LAB = "Vilka analyser som erbjuds beror på din frågeställning och laboratoriets utbud. Syfte, metod, begränsningar och pris får du före beställning.";
const tests = [
  { id: "blodprover", title: "Blodprover", slug: "blodprov", text: "Proverna analyseras via ledande laboratorier i Europa och du går igenom svaren tillsammans med oss.", points: ["Följ dina hälsomarkörer över tid", "Ett faktaunderlag för dina livsstilsval", "Avvikande värden hänvisas till vårdcentral eller läkare"] },
  { id: "dna-metylering", title: "DNA-metylering", slug: null, text: LAB, points: [] },
  { id: "borrelia", title: "Borrelia", slug: null, text: LAB, points: [] },
  { id: "tungmetaller-och-mogel", title: "Tungmetaller och mögel", slug: null, text: LAB, points: [] },
];

export default function Page() {
  return (
    <>
      <Hero eyebrow="Funktionsmedicin & tester" title="Funktionsmedicin" lead="Blodprover, DNA-metylering, borrelia, tungmetaller och mögel.">
        <CtaLink href={bookingUrl("blodprov", "fm_hero")}>Boka blodprov</CtaLink>
        <CtaLink href={bookingUrl(SHORT_CALL_SLUG, "fm_hero")} variant="secondary">Kostnadsfri rådgivning</CtaLink>
      </Hero>
      <Section>
        <Grid cols={2}>
          {tests.map((t) => (
            <Card key={t.id} id={t.id} title={t.title} text={t.text}>
              {t.points.length ? <Bullets items={t.points} /> : null}
              <CtaLink href={t.slug ? bookingUrl(t.slug, `fm_${t.id}`) : inquiryUrl("funktionsmedicin", `fm_${t.id}`)} size="sm" className="mt-auto w-fit">
                {t.slug ? "Boka" : "Gör en förfrågan"}
              </CtaLink>
            </Card>
          ))}
        </Grid>
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-hoa-ink-muted">
          Provsvar går du igenom vid en vägledning i funktionsmedicin. Vägledningen är ett komplement till vården.
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-hoa-ink-muted">
          Provtagning utförs av behörig personal när det krävs. Resultat tolkas tillsammans med symtom, historik och annan relevant information.
        </p>
      </Section>
    </>
  );
}
