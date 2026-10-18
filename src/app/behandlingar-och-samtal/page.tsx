import { CtaLink } from "@/components/CtaLink";
import { Card, Grid, Hero, Section, Soon } from "@/components/v2/ui";
import { bookingUrl, inquiryUrl, mailtoUrl } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Behandlingar & samtal",
  description: "Massage, healing, coachning, vägledning, traumaterapi och samtal i House of Awesome.",
  path: "/behandlingar-och-samtal",
});

export default function Page() {
  const book = bookingUrl("manuella-behandlingar", "beh_card");
  return (
    <>
      <Hero eyebrow="Behandlingar & samtal" title="För kropp och sinne" lead="Massage, healing, bioresonans, coachning och samtal.">
        <CtaLink href={bookingUrl(null, "beh_hero")}>Boka behandling eller samtal</CtaLink>
      </Hero>
      <Section>
        <Grid>
          <Card id="massage" label="Kropp" title="Massage">
            <Soon>Pris och upplägg kommer snart</Soon>
            <CtaLink href={book} size="sm" className="mt-auto w-fit">Boka</CtaLink>
          </Card>
          <Card id="healing" label="Energi" title="Healing" text="Energimedicinsk healingterapi (EMHT) med Rebecca Gustafsson, på plats eller på distans.">
            <ul className="space-y-1 text-sm text-hoa-ink">
              <li><span className="text-hoa-gold">950 kr</span> · 45 min på plats</li>
              <li><span className="text-hoa-gold">750 kr</span> · 45 min på distans</li>
              <li><span className="text-hoa-gold">1 500 kr</span> · 75 min</li>
            </ul>
            <CtaLink href={book} size="sm" className="mt-auto w-fit">Boka healing</CtaLink>
          </Card>
          <Card id="bioresonans" label="Frekvens" title="Bioresonans">
            <Soon>Mer information kommer snart</Soon>
          </Card>
          <Card id="coachning" label="Livsstil · 1 timme" title="Coachning" price="1 500 kr" text="Vi går igenom träning, stress och återhämtning och gör en plan du faktiskt orkar leva efter.">
            <CtaLink href={bookingUrl("coaching-45", "beh_coaching")} size="sm" className="mt-auto w-fit">Boka coachning</CtaLink>
          </Card>
          <Card id="vagledning" label="Funktionsmedicin · 1 timme" title="Vägledning i funktionsmedicin" price="1 500 kr" text="Ett samtal om din helhet, dina provsvar och relevanta nästa steg. Ett komplement till vården.">
            <CtaLink href={inquiryUrl("funktionsmedicin", "beh_vagledning")} size="sm" className="mt-auto w-fit">Boka vägledning</CtaLink>
          </Card>
          <Card id="samtal" label="Nervsystem & sinne" title="Traumaterapi och samtal" text="Kroppsorienterad bearbetning av stress och trauma i trygg takt. Ett tryggt rum för sinnet, som komplement till vården.">
            <CtaLink href={book} size="sm" className="mt-auto w-fit">Boka samtal</CtaLink>
          </Card>
        </Grid>
      </Section>
      <Section id="terapeuter" eyebrow="Terapeuter & coacher" title="Möt dem som arbetar i huset" band>
        <Grid>
          <Card label="Healing" title="Rebecca Gustafsson" text="Energimedicinsk healingterapi (EMHT). På plats i huset eller på distans.">
            <Soon>Bild och presentation kommer snart</Soon>
          </Card>
          <Card label="Coach" title="Lukas Eliasson" text="Träning, Basläger och The Awesome Protocol, med fokus på en stark kropp som håller hela livet." />
          <Card label="Är du terapeut?" title="Hyr behandlingsrum" text="Arbeta i ett hus med diagnostik, gym och behandlingar, med kunder som redan söker helhet.">
            <CtaLink href={mailtoUrl("Behandlingsrum i House of Awesome")} size="sm" variant="secondary" className="mt-auto w-fit">Hör av dig</CtaLink>
          </Card>
        </Grid>
      </Section>
    </>
  );
}
