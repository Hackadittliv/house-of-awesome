import Image from "next/image";
import Link from "next/link";

import { CtaLink } from "@/components/CtaLink";
import { Wordmark } from "@/components/Logo";
import { Bullets, Card, Grid, Section } from "@/components/v2/ui";
import { site } from "@/lib/content";
import { SHORT_CALL_SLUG, bookingUrl } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";

export const metadata = {
  ...pageMetadata({ title: `${site.name} | Longevity i Stora Höga`, description: site.description, path: "/" }),
  title: { absolute: `${site.name} | Longevity i Stora Höga` },
};

const areas = [
  { href: "/longevity-behandlingar", title: "Longevity-behandlingar", text: "Celloxy IHHT, tryckkammare, rödljus + PEMF och EWOT." },
  { href: "/funktionsmedicin", title: "Funktionsmedicin", text: "Blodprover, DNA-metylering, borrelia, tungmetaller och mögel." },
  { href: "/behandlingar-och-samtal", title: "Behandlingar & samtal", text: "Massage, healing, bioresonans, trauma och samtal." },
  { href: "/medlemskap", title: "Gym & medlemskap", text: "Longevity-gym dygnet runt, från 599 kr/mån." },
  { href: "/awesome-protocol", title: "The Awesome Protocol", text: "Kraft, syre och ljus. Vårt signaturpass på 60 minuter." },
  { href: "/klinik-24-7", title: "24/7-klinik", text: "Obemannad longevity-klinik med bokning i mobilen." },
  { href: "/event-och-lokaler", title: "Event & lokaler", text: "Föreläsningar, workshops och heldagar. Hyr huset." },
  { href: "/longevity-resor", title: "Longevity-resor", text: "Individuella program på 3, 7 eller 14 nätter." },
  { href: "/butik", title: "Butik", text: "Handplockat och noggrant utvalt." },
];

const faq = [
  { q: "Vad är House of Awesome?", a: "En longevity-anläggning i Stora Höga där träning, återhämtning, mätning, behandlingar och vägledning finns i samma hus. Kom för en enskild session, bli medlem eller boka en longevity-resa." },
  { q: "Behöver jag vara i bra form för att börja?", a: "Nej. Upplägget anpassas efter dig, oavsett om du är 25 eller 75, nybörjare eller van." },
  { q: "Jag är osäker på vilken behandling jag ska välja. Vad gör jag?", a: "Boka en kostnadsfri rådgivning på 10 minuter. Vi lyssnar på dina mål och föreslår vad som passar dig. Inget köpkrav." },
  { q: "Finns det bindningstid?", a: "Behandlingar bokas styckvis utan abonnemang. Gymmedlemskapen har 12 månaders bindningstid." },
  { q: "Ersätter ni vården?", a: "Nej. Vi erbjuder friskvård som ett komplement till hälso- och sjukvården. Har du symtom eller en diagnos, kontakta vården för medicinsk bedömning." },
];

export default function HomePage() {
  const book = bookingUrl(null, "home_hero");
  const advice = bookingUrl(SHORT_CALL_SLUG, "home_hero");
  return (
    <>
      <section className="px-4 pt-12 pb-16 text-center md:pt-20 md:pb-24">
        <div className="mx-auto max-w-2xl">
          <p className="font-display text-2xl font-bold text-hoa-ink md:text-4xl">Välkommen till</p>
          <Image src="/images/lia-uggla.webp" alt="" width={256} height={256} preload className="mx-auto mt-6 h-24 w-24 md:h-32 md:w-32" />
          <p className="mt-4"><Wordmark className="text-4xl md:text-6xl" /></p>
          <p className="subheading mt-3 text-lg text-hoa-ink-muted md:text-2xl">Stora Höga</p>
          <h1 className="mt-10 text-3xl text-hoa-ink md:text-5xl">Mer än en hälsoanläggning. En destination.</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-hoa-ink-muted">
            Träning, återhämtning, mätning, behandlingar och vägledning under ett tak, 30 minuter norr om Göteborg.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CtaLink href={book}>Boka behandling</CtaLink>
            <CtaLink href={advice} variant="secondary">Osäker? Boka kostnadsfri rådgivning</CtaLink>
          </div>
          <ul className="mt-10 flex flex-wrap justify-center gap-2 text-xs text-hoa-ink-muted">
            {["Longevity-sökare", "Senior", "Barnfamilj", "Idrottare", "Fokus på återhämtning"].map((t) => (
              <li key={t} className="rounded-full border border-hoa-line px-3 py-1">{t}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-hoa-ink-muted">Samma grund, olika mål. Vi möter dig där du är.</p>
        </div>
      </section>

      <Section eyebrow="I huset" title="Allt samlat på ett ställe" lead="Välj ett område för att läsa mer." band>
        <Grid>
          {areas.map((a) => (
            <Link key={a.href} href={a.href} className="group rounded-2xl border border-hoa-gold/20 bg-hoa-bg/60 p-6 transition-colors hover:border-hoa-gold">
              <h3 className="text-xl text-hoa-ink">{a.title}</h3>
              <p className="mt-2 text-sm text-hoa-ink/80">{a.text}</p>
              <p className="mt-4 text-sm text-hoa-gold group-hover:underline">Utforska →</p>
            </Link>
          ))}
        </Grid>
      </Section>

      <Section eyebrow="Kom igång" title="Två enkla sätt att börja" lead="Vet du vad du vill ha? Boka direkt. Osäker? Prata med oss först, det kostar ingenting.">
        <Grid cols={2}>
          <Card label="Jag vet vad jag vill ha" title="Boka behandling" text="Välj behandling och tid direkt i bokningen. Du får information om upplägg och eventuell hälsodeklaration innan du kommer.">
            <Bullets items={["Celloxy IHHT, tryckkammare, rödljus + PEMF, EWOT", "Blodprovtagning och vitamindropp", "Massage, healing, coachning och samtal"]} />
            <CtaLink href={book} className="mt-3 w-full sm:w-fit">Boka behandling</CtaLink>
          </Card>
          <Card label="Jag känner mig osäker" title="Kostnadsfri rådgivning" text="Ett kort samtal på 10 minuter där vi lyssnar och hjälper dig hitta rätt. Inget köpkrav." featured>
            <Bullets items={["10 minuter, digitalt eller per telefon", "Helt kostnadsfritt", "Vi föreslår nästa steg utifrån dina mål"]} />
            <CtaLink href={advice} className="mt-3 w-full sm:w-fit">Boka kostnadsfri rådgivning</CtaLink>
          </Card>
        </Grid>
      </Section>

      <Section eyebrow="Vanliga frågor" title="Det du kanske undrar">
        <div className="mx-auto max-w-2xl divide-y divide-hoa-line border-y border-hoa-line">
          {faq.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg text-hoa-ink">
                {f.q}
                <span aria-hidden className="text-hoa-gold group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-hoa-ink-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>
    </>
  );
}
