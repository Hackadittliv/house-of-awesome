import Image from "next/image";
import Link from "next/link";

import { CtaLink } from "@/components/CtaLink";
import { FacadeImage } from "@/components/FacadeImage";
import { Wordmark } from "@/components/Logo";
import { Avatar, Card, Grid, Section, cardClass } from "@/components/v2/ui";
import { getFaqItems, getService, site } from "@/lib/content";
import { SHORT_CALL_SLUG, bookingUrl } from "@/lib/links";
import { PORTRAITS } from "@/lib/people";
import { pageMetadata } from "@/lib/seo";

export const metadata = {
  // OG bilden är fasaden i src/app/opengraph-image.jpg.
  ...pageMetadata({ title: `${site.name} | Longevity i Stora Höga`, description: site.description, path: "/", ownOgImage: true }),
  title: { absolute: `${site.name} | Longevity i Stora Höga` },
};

// Samma bilder och alt texter som på /longevity-behandlingar. Texten är tjänstens lead i content/services.json.
const treatments = [
  {
    slug: "ihht-50",
    title: "Celloxy IHHT",
    href: "/longevity-behandlingar#celloxy-ihht",
    more: "Läs mer om Celloxy IHHT",
    image: { src: "/images/celloxy-ihht.webp", alt: "Kvinna vilar i en behandlingsstol med Celloxy-mask, bredvid står Celloxy-maskinen" },
  },
  {
    slug: "hbot-60",
    title: "Tryckkammare",
    href: "/longevity-behandlingar#tryckkammare",
    more: "Läs mer om tryckkammaren",
    image: { src: "/images/tryckkammare-hoa.webp", alt: "Den vita tryckkammaren i House of Awesome med en bänk i ljust trä" },
  },
  {
    slug: "redlight-20",
    title: "Rödljus",
    href: "/longevity-behandlingar#rodljus-pemf",
    more: "Läs mer om rödljus",
    image: { src: "/images/rodljus.webp", alt: "En person ligger avslappnad under rödljuspanelen i House of Awesome" },
  },
];

const moreInHouse = [
  { href: "/medlemskap", label: "Gym och medlemskap" },
  { href: "/awesome-protocol", label: "The Awesome Protocol" },
  { href: "/funktionsmedicin", label: "Funktionsmedicin" },
  { href: "/behandlingar-och-samtal", label: "Coachning och samtal" },
  { href: "/tjanster/vitamindropp", label: "Vitamindropp" },
  { href: "/tjanster/blodprov", label: "Provtagning" },
];

// Korta texter från /om och /behandlingar-och-samtal.
const people: { portrait: keyof typeof PORTRAITS; role: string; name: string; text: string }[] = [
  {
    portrait: "lucas",
    role: "Coach",
    name: "Lucas Eliasson",
    text: "Coach och ansvarig för gymmet och Basläger. Bygger träningskonceptet och tar hand om medlemmarna.",
  },
  {
    portrait: "rebecca",
    role: "Healing",
    name: "Rebecca Gustafsson",
    text: "Energimedicinsk healingterapi (EMHT). På plats i huset eller på distans.",
  },
  {
    portrait: "patrik",
    role: "Medgrundare",
    name: "Patrik Nilsson",
    text: "Certifierad Wim Hof Method-instruktör och trebarnspappa. Byggde tidigare ett åkeri med 200 lastbilar. Leder utveckling och partnerskap.",
  },
];

// Frågorna hämtas från content/faq.json, där alla finns på /faq.
const faqIds = ["vem-driver", "var", "form"];

export default function HomePage() {
  const faq = faqIds.flatMap((id) => getFaqItems().filter((item) => item.id === id));
  return (
    <>
      <section id="valkommen" aria-labelledby="valkommen-rubrik">
        <div className="px-4 pt-8 pb-10 text-center md:pt-12 md:pb-12">
          <div className="mx-auto max-w-3xl">
            <Image src="/images/lia-uggla.webp" alt="" width={256} height={256} className="mx-auto h-14 w-14 md:h-20 md:w-20" />
            <h1 id="valkommen-rubrik" className="mt-4 text-hoa-ink">
              <span className="block text-2xl md:text-4xl">Välkommen till</span>{" "}
              <Wordmark className="mt-2 block text-4xl md:text-6xl" />{" "}
              <span className="subheading mt-1 block text-lg text-hoa-ink-muted md:text-2xl">i Stora Höga</span>
            </h1>
            <p className="mt-6 font-display text-2xl font-bold text-hoa-ink md:text-4xl">Ett helt hus av möjligheter</p>
            <p className="mx-auto mt-3 max-w-xl text-lg text-hoa-ink-muted md:max-w-none">
              För hälsa, inspiration, utveckling och gemenskap, 30 minuter norr om Göteborg.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <CtaLink href={bookingUrl(SHORT_CALL_SLUG, "home_hero")}>Boka kostnadsfritt samtal med Patrik</CtaLink>
              <CtaLink href={bookingUrl(null, "home_hero")} variant="secondary">Boka behandling</CtaLink>
            </div>
          </div>
        </div>
        <FacadeImage />
        <div className="px-4 pt-6">
          <p className="mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-hoa-gold/30 bg-hoa-secondary/20 px-4 py-3 text-left text-sm text-hoa-ink-muted">
            <span aria-hidden>🐾</span>
            <span>Vi har en hund i huset. Hunden håller till på en avgränsad plats, skild från behandlingsrummen.</span>
          </p>
        </div>
      </section>

      <Section id="mote-med-patrik" eyebrow="Möte med Patrik" title="Hälsa har blivit för krångligt. Vi gör det enkelt igen." band>
        <div className="grid items-start gap-8 md:grid-cols-2 md:gap-12">
          <div className="space-y-4">
            <p className="font-display text-xl font-bold leading-snug text-hoa-ink md:text-2xl">
              Vi börjar med grunden: din livsstil och din vardag. Sedan bygger vi vidare därifrån.
            </p>
            <p className="text-lg leading-relaxed text-hoa-ink md:text-xl">Vi hjälper dig att förstå vad som är viktigast att fokusera på först.</p>
            <p className="leading-relaxed text-hoa-ink-muted">Mätning och optimering använder vi när det faktiskt tillför värde.</p>
            <p className="leading-relaxed text-hoa-ink-muted">Vi bygger hälsa och en livsstil som håller över tid.</p>
          </div>
          <div className="relative aspect-[4/5] w-full max-w-sm justify-self-center overflow-hidden rounded-2xl border border-hoa-gold/20 md:row-span-2 md:max-w-md">
            <Image
              src={PORTRAITS.patrik.src}
              alt={PORTRAITS.patrik.alt}
              fill
              sizes="(min-width: 768px) 28rem, (min-width: 448px) 24rem, 90vw"
              className="object-cover object-top"
            />
          </div>
          <Card label="Kostnadsfritt samtal på 10 minuter med" title="Patrik Nilsson" text="Grundare av Life is Awesome" featured>
            <CtaLink href={bookingUrl(SHORT_CALL_SLUG, "home_patrik")} className="mt-2 w-full sm:w-fit">Boka samtal med Patrik</CtaLink>
          </Card>
        </div>
      </Section>

      <Section id="om-huset" eyebrow="Huset i Stora Höga" title="Om House of Awesome" band>
        <div className="grid gap-10 leading-relaxed text-hoa-ink/85 md:grid-cols-2 md:gap-14">
          <div className="space-y-10">
            <article className="space-y-4">
              <h3 className="text-2xl text-hoa-ink">En plats utöver det vanliga</h3>
              <p>
                Hit kan du komma precis som du är. Oavsett om du är i bra form och vill optimera din hälsa ytterligare, eller om du är
                ny och söker stöd och vägledning inom helhetshälsa.
              </p>
              <p>
                Här finns allt från tryckkammare, Celloxy IHHT och rödljus till vitamindropp och livsstilscoachning. Vill du se hur du
                ligger till i dina värden finns också provtagning.
              </p>
            </article>
            <article className="space-y-4">
              <h3 className="text-2xl text-hoa-ink">En plats för möten</h3>
              <p>
                Vi välkomnar dig som söker en inspirerande lokal för event och aktiviteter. Här finns en mysig yta för klasser i yoga,
                breathwork och meditation.
              </p>
              <p>I det stora köket finns ett stort bord och en bardisk, perfekt för matlagning, matlagningskurser eller konferens.</p>
              <p>
                Du är fri att använda lokalerna till det mesta: kurser, måleri, smyckestillverkning eller det du vill skapa och bidra med
                till huset. Det här skapar vi tillsammans.
              </p>
            </article>
          </div>
          <div className="space-y-10">
            <article className="space-y-4">
              <h3 className="text-2xl text-hoa-ink">Vi står för platsen</h3>
              <p className="font-display text-xl leading-snug text-hoa-ink">Du bidrar med din kunskap, dina kunder och dina event.</p>
              <p>Tillsammans skapar vi ett givande samarbete där vi kan växa, utvecklas och skapa värde för fler människor.</p>
            </article>
            <article className="space-y-4">
              <h3 className="text-2xl text-hoa-ink">Vår vision</h3>
              <p>
                Vår vision är ett levande hus där det alltid händer spännande saker. En plats fylld av möjligheter, möten och
                upplevelser, med en gemensam nämnare: välmående, inspiration och glädje.
              </p>
              <p>
                Här ska människor mötas, upptäcka nya saker och inspireras att utvecklas. Helt enkelt en plats som vi själva alltid har
                önskat fanns. Så vi bestämde oss för att ta chansen och skapa den själva.
              </p>
            </article>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <CtaLink href="/om" variant="secondary">Läs mer om huset</CtaLink>
          <CtaLink href="/event-och-lokaler#hyr" variant="ghost">Hyr huset för ditt event</CtaLink>
        </div>
      </Section>

      <Section id="utbud" eyebrow="I huset" title="Utbudet i korthet">
        <Grid>
          {treatments.map((t) => (
            <Card key={t.slug} title={t.title} image={t.image} text={getService(t.slug)?.lead}>
              <CtaLink href={t.href} variant="ghost" className="mt-auto w-fit">{t.more}</CtaLink>
            </Card>
          ))}
        </Grid>
        <div className="mt-10 text-center">
          <h3 className="text-lg text-hoa-ink">Mer i huset</h3>
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {moreInHouse.map((m) => (
              <li key={m.href}>
                <Link
                  href={m.href}
                  className="inline-flex min-h-11 items-center rounded-full border border-hoa-line px-4 text-sm text-hoa-ink transition-colors hover:border-hoa-gold hover:text-hoa-gold"
                >
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section id="personerna" eyebrow="Personerna" title="Människorna i huset" band>
        <ul className="grid gap-4 md:grid-cols-3">
          {people.map((p) => (
            <li key={p.name} className={`${cardClass} flex flex-col items-center gap-3 text-center`}>
              <Avatar {...PORTRAITS[p.portrait]} size="lg" />
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-hoa-bronze">{p.role}</p>
              <h3 className="text-xl text-hoa-ink">{p.name}</h3>
              <p className="text-sm leading-relaxed text-hoa-ink/80">{p.text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <CtaLink href="/om" variant="secondary">Möt hela teamet</CtaLink>
          <CtaLink href="/behandlingar-och-samtal#terapeuter" variant="ghost">Terapeuter och coacher</CtaLink>
        </div>
      </Section>

      <Section
        id="event"
        eyebrow="Event och lokaler"
        title="Ett hus att samlas i"
        lead="Föreläsningar, workshops och heldagar. Du kan också hyra huset för ditt eget event."
      >
        <div className="text-center">
          <CtaLink href="/event-och-lokaler" variant="secondary">Se event och lokaler</CtaLink>
        </div>
      </Section>

      <Section id="vanliga-fragor" eyebrow="Vanliga frågor" title="Det du kanske undrar" band>
        <div className="mx-auto max-w-2xl divide-y divide-hoa-line border-y border-hoa-line">
          {faq.map((f) => (
            <details key={f.id} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg text-hoa-ink">
                {f.question}
                <span aria-hidden className="text-hoa-gold group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-hoa-ink-muted">{f.answer}</p>
            </details>
          ))}
        </div>
        <div className="mt-8 text-center">
          <CtaLink href="/faq" variant="ghost">Fler frågor och svar</CtaLink>
        </div>
      </Section>
    </>
  );
}
