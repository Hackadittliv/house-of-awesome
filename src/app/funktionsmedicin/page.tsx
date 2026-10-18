import { CtaLink } from "@/components/CtaLink";
import { Card, Grid, Hero, Section, Soon } from "@/components/v2/ui";
import { SHORT_CALL_SLUG, bookingUrl, inquiryUrl } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Funktionsmedicin & tester",
  description: "Blodprover, DNA-metylering, borrelia, tungmetaller och mögel i House of Awesome.",
  path: "/funktionsmedicin",
});

const tests = [
  { id: "blodprover", title: "Blodprover", slug: "blodprov" },
  { id: "dna-metylering", title: "DNA-metylering", slug: null },
  { id: "borrelia", title: "Borrelia", slug: null },
  { id: "tungmetaller-och-mogel", title: "Tungmetaller och mögel", slug: null },
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
            <Card key={t.id} id={t.id} title={t.title}>
              <Soon>Mer information kommer snart</Soon>
              <CtaLink href={t.slug ? bookingUrl(t.slug, `fm_${t.id}`) : inquiryUrl("funktionsmedicin", `fm_${t.id}`)} size="sm" className="mt-auto w-fit">
                {t.slug ? "Boka" : "Gör en förfrågan"}
              </CtaLink>
            </Card>
          ))}
        </Grid>
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-hoa-ink-muted">
          Provsvar går du igenom vid en vägledning i funktionsmedicin. Vägledningen är ett komplement till vården.
        </p>
      </Section>
    </>
  );
}
