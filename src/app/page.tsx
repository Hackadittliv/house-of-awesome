import Image from "next/image";

import { Container } from "@/components/Container";
import { CtaLink } from "@/components/CtaLink";
import { Disclaimer } from "@/components/Disclaimer";
import { Wordmark } from "@/components/Logo";
import { SectionIntro } from "@/components/SectionIntro";
import { ServiceCard } from "@/components/ServiceCard";
import { formatSek, getBookableServices, getMemberships, site } from "@/lib/content";
import { SHORT_CALL_SLUG, bookingUrl } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";

export const metadata = {
  ...pageMetadata({
    title: `${site.name} | Longevity i Stora Höga`,
    description: site.description,
    path: "/",
  }),
  title: { absolute: `${site.name} | Longevity i Stora Höga` },
};

const highlights = [
  {
    label: "Tillgång",
    title: "Öppet dygnet runt",
    text: "Som medlem har du tillgång till huset alla dagar, dygnet runt. Kom när det passar dig.",
  },
  {
    label: "Utrustning",
    title: "Utrustning i framkant",
    text: "Tryckkammare, Celloxy IHHT, EWOT och rödljus i samma hus. Vi tar bara in det vi själva använder.",
  },
  {
    label: "Vägledning",
    title: "Personlig vägledning",
    text: "Coachning, mätningar och en plan som följer dig över tid, oavsett ålder och utgångsläge.",
  },
];

const protocol = [
  { step: "1", title: "Kraft", text: "Kettlebells och funktionell styrka för hela kroppen." },
  { step: "2", title: "Syre", text: "Intervaller med EWOT, där du andas syrerik luft via mask." },
  { step: "3", title: "Ljus", text: "Rödljus som avslut, ett skönt sätt att varva ner." },
];

const card = "rounded-2xl border border-hoa-gold/20 bg-hoa-secondary/20 p-5";

export default function HomePage() {
  const services = getBookableServices();
  const lowestMembership = Math.min(...getMemberships().map((plan) => plan.pricePerMonth));

  return (
    <>
      <section className="px-4 pt-10 pb-16 text-center md:pt-16 md:pb-24">
        <div className="mx-auto max-w-3xl">
          <p className="font-display text-3xl font-bold text-hoa-ink md:text-5xl">Välkommen till</p>
          <Image
            src="/images/lia-uggla.webp"
            alt=""
            width={256}
            height={256}
            preload
            className="mx-auto mt-6 h-28 w-28 md:h-36 md:w-36"
          />
          <p className="mt-4">
            <Wordmark className="text-4xl md:text-6xl" />
          </p>
          <p className="subheading mt-4 text-xl text-hoa-ink md:text-3xl">
            Longevity i Stora Höga
          </p>
          <h1 className="mt-10 text-3xl text-hoa-ink md:text-5xl">
            Träning, återhämtning och longevity under ett tak.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-hoa-ink-muted">
            House of Awesome är vårt hus i Stora Höga för dig som vill träna smart, återhämta dig
            och följa din hälsa över tid.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CtaLink href={bookingUrl(null, "home_hero")}>Boka tid</CtaLink>
            <CtaLink href="/tjanster" variant="secondary">
              Se alla tjänster
            </CtaLink>
          </div>
        </div>
      </section>

      <section aria-labelledby="hojdpunkter" className="pb-16 md:pb-24">
        <h2 id="hojdpunkter" className="sr-only">
          Därför House of Awesome
        </h2>
        <Container>
          <ul className="grid gap-4 sm:grid-cols-3">
            {highlights.map((item) => (
              <li key={item.title} className={card}>
                <p className="text-sm font-semibold uppercase tracking-widest text-hoa-gold">
                  {item.label}
                </p>
                <h3 className="mt-3 text-lg text-hoa-ink md:text-xl">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-hoa-ink/80">{item.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="tjanster-rubrik" className="bg-hoa-secondary/50 py-16 md:py-24">
        <Container>
          <SectionIntro
            id="tjanster-rubrik"
            eyebrow="Tjänster"
            eyebrowTone="gold"
            title="Boka direkt"
            lead="Pass och behandlingar som du bokar och betalar hos Life Is Awesome."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 md:mt-16 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.slug} service={service} placement="home_services" />
            ))}
          </div>
          <div className="mt-10 text-center">
            <CtaLink href="/tjanster" variant="secondary">
              Alla tjänster och behandlingar
            </CtaLink>
          </div>
        </Container>
      </section>

      <section aria-labelledby="protokoll-rubrik" className="py-16 md:py-24">
        <Container>
          <SectionIntro
            id="protokoll-rubrik"
            eyebrow="Signaturpass"
            title="The Awesome Protocol"
            lead="60 minuter, tre steg, ett komplett pass. Ingår i Longevity Plus och Longevity Max."
          />
          <ol className="mx-auto mt-12 grid max-w-6xl list-none gap-4 sm:grid-cols-3 md:mt-16">
            {protocol.map((item) => (
              <li key={item.step} className={`${card} flex flex-col`}>
                <span aria-hidden className="text-sm font-semibold tracking-widest text-hoa-gold">
                  STEG {item.step}
                </span>
                <h3 className="mt-3 text-lg text-hoa-ink md:text-xl">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-hoa-ink/80">{item.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <CtaLink href="/tjanster/awesome-protocol" variant="secondary">
              Läs mer om passet
            </CtaLink>
          </div>
        </Container>
      </section>

      <section aria-labelledby="medlemskap-rubrik" className="py-16 md:py-24">
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="rounded-2xl border border-hoa-bronze/40 bg-hoa-bronze/10 p-6 md:p-8">
            <SectionIntro
              id="medlemskap-rubrik"
              eyebrow="Medlemskap"
              title="Din hälsa, på dina villkor"
              align="left"
            />
            <p className="mt-4 leading-relaxed text-hoa-ink/80">
              Alla medlemskap ger gymmet dygnet runt, en introduktion och en träningsplan.
              Skillnaden är hur mycket rödljus och hur många pass med The Awesome Protocol som
              ingår. Från{" "}
              <span className="font-semibold text-hoa-gold">{formatSek(lowestMembership)}</span>{" "}
              per månad.
            </p>
            <div className="mt-8">
              <CtaLink href="/medlemskap">Jämför medlemskap</CtaLink>
            </div>
          </div>
          <div className="relative aspect-[4/5] w-full max-w-md justify-self-center overflow-hidden rounded-2xl border border-hoa-gold/20 lg:justify-self-end">
            <Image
              src="/images/tryckkammare.webp"
              alt="Tryckkammaren i House of Awesome"
              fill
              sizes="(min-width: 1024px) 28rem, 90vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      <section aria-labelledby="huset-rubrik" className="py-16 md:py-24">
        <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative order-last aspect-[4/3] w-full overflow-hidden rounded-2xl border border-hoa-gold/20 lg:order-first">
            <Image
              src="/images/stora-hoga-landskap.webp"
              alt="Utsikt över ängar och vatten i kvällsljus vid Stora Höga"
              fill
              sizes="(min-width: 1024px) 36rem, 92vw"
              className="object-cover"
            />
          </div>
          <div>
            <SectionIntro id="huset-rubrik" eyebrow="Huset" title="Ett hus i Stora Höga" align="left" />
            <p className="mt-4 text-lg leading-relaxed text-hoa-ink/80">
              Vi saknade länge en plats där träning, återhämtning och personlig vägledning finns
              samlat. Så vi byggde den själva. House of Awesome drivs av Patrik och Alexandra,
              samma team som står bakom Life Is Awesome.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CtaLink href="/om" variant="secondary">
                Om huset
              </CtaLink>
              <CtaLink href="/besok" variant="secondary">
                Hitta hit
              </CtaLink>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="starta-rubrik" className="bg-hoa-secondary/50 py-12 md:py-16">
        <Container className="text-center">
          <SectionIntro
            id="starta-rubrik"
            title="Osäker på var du ska börja?"
            lead="Boka ett kostnadsfritt samtal på tio minuter. Vi lyssnar på dina mål och hjälper dig välja rätt första steg."
          />
          <div className="mt-8">
            <CtaLink href={bookingUrl(SHORT_CALL_SLUG, "home_cta")}>Boka ett kort samtal</CtaLink>
          </div>
        </Container>
      </section>

      <Container className="py-10">
        <Disclaimer />
        <p className="mt-3 text-xs text-hoa-ink-muted">
          Bokning och betalning sker hos{" "}
          <a href={site.operator.url} className="text-hoa-gold underline underline-offset-4">
            Life Is Awesome
          </a>
          , som driver House of Awesome.
        </p>
      </Container>
    </>
  );
}
