import Image from "next/image";
import { ReferralLink as Link } from "@/components/ReferralLink";

import { CtaLink } from "@/components/CtaLink";
import { FacadeImage } from "@/components/FacadeImage";
import { FaqList } from "@/components/FaqList";
import { Wordmark } from "@/components/Logo";
import { Avatar, Card, Grid, Section, cardClass, gridGap } from "@/components/v2/ui";
import { getFaqItems, getService, site } from "@/lib/content";
import { bookingUrl, founderConversationUrl } from "@/lib/links";
import { founders, PORTRAITS } from "@/lib/people";
import { REBECCA } from "@/lib/rebecca";
import { SANDRA } from "@/lib/sandra";
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
  { href: "/behandlingar-och-samtal", label: "Behandlingar och samtal" },
  { href: "/tjanster/vitamindropp", label: "Vitamindropp" },
  { href: "/tjanster/blodprov", label: "Provtagning" },
];

// Korta texter från /om och /behandlingar-och-samtal.
const people: { portrait: keyof typeof PORTRAITS; role: string; name: string; text: string }[] = [
  ...founders,
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
];

// Frågorna hämtas från content/faq.json, där alla finns på /faq.
const faqIds = ["vem-driver", "var", "form"];

export default function HomePage() {
  const faq = faqIds.flatMap((id) => getFaqItems().filter((item) => item.id === id));
  return (
    <>
      <section id="valkommen" aria-labelledby="valkommen-rubrik">
        <div className="px-4 pt-8 pb-10 text-center md:pt-12 md:pb-12">
          <div className="@container mx-auto max-w-3xl">
            <Image src="/images/hoa-uggla-guld.webp" alt="" width={256} height={256} className="mx-auto h-14 w-14 md:h-20 md:w-20" />
            <h1 id="valkommen-rubrik" className="mt-4 text-hoa-ink">
              {/* VÄLKOMMEN är 6,45 em; storleken krymper bara om ordet annars inte ryms, till exempel vid förstorad text. */}
              <span className="block text-[min(1.5rem,100cqi/6.6)] md:text-4xl">Välkommen till</span>{" "}
              {/* Ordmärket ryms på en rad från 360 px (10,6 em i versaler). Vid förstorad text på smala
                  skärmar stannar det vid storleken där AWESOME (5,31 em) ryms; det är ändå större än vid normal text. */}
              <Wordmark className="mt-2 block text-[min(clamp(1.75rem,8.4vw,3.75rem),100cqi/5.31)]" />{" "}
              <span className="subheading mt-1 block text-lg text-hoa-ink-muted md:text-2xl">i Stora Höga</span>
            </h1>
            {/* "möjligheter" är 5,6 em (uppmätt i Chrome); vid förstorad text på smala skärmar stannar
                storleken där ordet ryms, ändå större än vid normal text. Radavståndet är text-2xl:s. */}
            <p className="mt-6 font-display text-[min(1.5rem,100cqi/5.7)]/[calc(2/1.5)] font-bold text-hoa-ink md:text-4xl">Ett helt hus av möjligheter</p>
            <p className="mx-auto mt-3 max-w-xl text-lg text-hoa-ink-muted md:max-w-none">
              För hälsa, inspiration, utveckling och gemenskap, 30 minuter norr om Göteborg.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <CtaLink href="#grundarna">Välj ett kostnadsfritt samtal</CtaLink>
              <CtaLink href={bookingUrl(null, "home_hero")} variant="secondary">Boka behandling</CtaLink>
            </div>
            <div className="mt-5 flex flex-col items-center justify-center gap-1 text-sm sm:flex-row sm:gap-3">
              <p className="text-hoa-ink-muted">Osäker på vad som passar dig?</p>
              <CtaLink href="/behovsanalys" variant="ghost">
                Gör vår behovsanalys
                <span aria-hidden="true">→</span>
              </CtaLink>
            </div>
          </div>
        </div>
        <FacadeImage />
        <p className="mx-auto max-w-md px-4 py-5 text-center text-sm leading-relaxed text-hoa-ink-muted">
          <span aria-hidden className="mr-1.5">🐾</span>
          Vi har en hund i huset. Hunden håller till på en avgränsad plats, skild från behandlingsrummen.
        </p>
      </section>

      <Section
        id="grundarna"
        title="Möt Alexandra och Patrik"
        lead="Vad vill du börja med? Välj vem du vill prata med. Det första samtalet är kostnadsfritt och tar tio minuter."
        band
      >
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
          {founders.map((founder) => (
            <article
              key={founder.portrait}
              id={`mote-med-${founder.portrait}`}
              className="hoa-surface-dark flex scroll-mt-28 flex-col overflow-hidden rounded-2xl"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={PORTRAITS[founder.portrait].src}
                  alt={PORTRAITS[founder.portrait].alt}
                  fill
                  sizes="(min-width: 960px) 28rem, (min-width: 640px) 47vw, 95vw"
                  className="object-cover object-[center_10%]"
                />
              </div>
              <div className="flex flex-1 flex-col items-start p-6">
                <p className="text-sm text-hoa-gold">{founder.role}</p>
                <h3 className="mt-1 text-2xl text-hoa-ink">{founder.name}</h3>
                <p className="mt-3 mb-5 leading-relaxed text-hoa-ink-muted">{founder.conversation}</p>
                <CtaLink href={founderConversationUrl(founder.portrait, "home")} className="mt-auto">{founder.action}</CtaLink>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section id="om-huset" eyebrow="Huset i Stora Höga" title="Om House of Awesome" band>
        <div className="grid grid-cols-1 gap-10 leading-relaxed text-hoa-ink/85 md:grid-cols-2 md:gap-14">
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
                  className="inline-flex min-h-11 items-center rounded-full border border-hoa-line px-4 text-sm text-hoa-ink no-underline transition-colors hover:border-hoa-gold hover:text-hoa-gold"
                >
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>


      <Section id="personerna" eyebrow="Personerna" title="Människorna i huset" band>
        <ul className={`grid grid-cols-1 ${gridGap} sm:grid-cols-2 lg:grid-cols-4`}>
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

      <section aria-labelledby="forfragan" className="px-4 py-14 text-center md:py-20">
        <div className="mx-auto max-w-2xl space-y-4">
          <h2 id="forfragan" className="text-2xl text-hoa-ink">Healing och massage efter förfrågan</h2>
          <p className="text-hoa-ink-muted">Healing hos Rebecca och massage hos Sandra Bengts bokas efter förfrågan.</p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CtaLink href={REBECCA.requestPath} variant="secondary">Förfrågan till Rebecca</CtaLink>
            <CtaLink href={SANDRA.requestPath} variant="secondary">Förfrågan om massage hos Sandra Bengts</CtaLink>
          </div>
        </div>
      </section>



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
        <FaqList items={faq} className="mx-auto max-w-2xl" />
        <div className="mt-8 text-center">
          <CtaLink href="/faq" variant="ghost">Fler frågor och svar</CtaLink>
        </div>
      </Section>
    </>
  );
}
