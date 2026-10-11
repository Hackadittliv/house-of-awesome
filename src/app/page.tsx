import Image from "next/image";

import { Container } from "@/components/Container";
import { CtaLink } from "@/components/CtaLink";
import { Disclaimer } from "@/components/Disclaimer";
import { Eyebrow } from "@/components/Eyebrow";
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
    title: "Öppet dygnet runt",
    text: "Som medlem har du tillgång till huset alla dagar, dygnet runt. Kom när det passar dig.",
  },
  {
    title: "Utrustning i framkant",
    text: "Tryckkammare, Celloxy IHHT, EWOT och rödljus i samma hus. Vi tar bara in det vi själva använder.",
  },
  {
    title: "Personlig vägledning",
    text: "Coachning, mätningar och en plan som följer dig över tid, oavsett ålder och utgångsläge.",
  },
];

const protocol = [
  { step: "1", title: "Kraft", text: "Kettlebells och funktionell styrka för hela kroppen." },
  { step: "2", title: "Syre", text: "Intervaller med EWOT, där du andas syrerik luft via mask." },
  { step: "3", title: "Ljus", text: "Rödljus som avslut, ett skönt sätt att varva ner." },
];

export default function HomePage() {
  const services = getBookableServices();
  const lowestMembership = Math.min(...getMemberships().map((plan) => plan.pricePerMonth));

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-hoa-line">
        <Image
          src="/images/stora-hoga-landskap.webp"
          alt="Utsikt över ängar och vatten i kvällsljus vid Stora Höga"
          fill
          preload
          sizes="100vw"
          className="-z-20 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-hoa-bg via-hoa-bg/85 to-hoa-bg/40" />
        <Container className="py-20 sm:py-28 lg:py-36">
          <Eyebrow>Stora Höga · Longevity</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] text-hoa-ink sm:text-6xl lg:text-7xl">
            Träning, återhämtning och longevity under ett tak.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-hoa-ink">
            House of Awesome är vårt hus i Stora Höga för dig som vill träna smart, återhämta dig
            och följa din hälsa över tid.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CtaLink href={bookingUrl(null, "home_hero")}>Boka tid</CtaLink>
            <CtaLink href="/tjanster" variant="secondary">
              Se alla tjänster
            </CtaLink>
          </div>
        </Container>
      </section>

      <section aria-labelledby="hojdpunkter">
        <h2 id="hojdpunkter" className="sr-only">
          Därför House of Awesome
        </h2>
        <Container className="grid gap-6 py-16 md:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="border-t border-hoa-gold/50 pt-5">
              <h3 className="font-display text-2xl text-hoa-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-hoa-ink-muted">{item.text}</p>
            </div>
          ))}
        </Container>
      </section>

      <section aria-labelledby="tjanster-rubrik" className="border-t border-hoa-line bg-hoa-bg-muted">
        <Container className="py-16 sm:py-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Eyebrow>Tjänster</Eyebrow>
              <h2 id="tjanster-rubrik" className="mt-3 font-display text-4xl text-hoa-ink">
                Boka direkt
              </h2>
            </div>
            <CtaLink href="/tjanster" variant="ghost" className="self-start px-0 sm:self-auto">
              Alla tjänster och behandlingar
            </CtaLink>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.slug} service={service} placement="home_services" />
            ))}
          </div>
        </Container>
      </section>

      <section aria-labelledby="protokoll-rubrik">
        <Container className="py-16 sm:py-20">
          <Eyebrow>Signaturpass</Eyebrow>
          <h2 id="protokoll-rubrik" className="mt-3 font-display text-4xl text-hoa-ink">
            The Awesome Protocol
          </h2>
          <p className="mt-3 max-w-2xl text-hoa-ink-muted">
            60 minuter, tre steg, ett komplett pass. Ingår i Longevity Plus och Longevity Max.
          </p>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {protocol.map((item) => (
              <li key={item.step} className="border border-hoa-line bg-hoa-bg-elevated p-6">
                <p className="font-display text-3xl text-hoa-gold">{item.step}</p>
                <h3 className="mt-2 text-lg uppercase tracking-[0.12em] text-hoa-ink">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-hoa-ink-muted">{item.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-8">
            <CtaLink href="/tjanster/awesome-protocol" variant="secondary">
              Läs mer om passet
            </CtaLink>
          </div>
        </Container>
      </section>

      <section aria-labelledby="medlemskap-rubrik" className="border-y border-hoa-line bg-hoa-bg-elevated">
        <Container className="grid gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <Eyebrow>Medlemskap</Eyebrow>
            <h2 id="medlemskap-rubrik" className="mt-3 font-display text-4xl text-hoa-ink">
              Din hälsa, på dina villkor
            </h2>
            <p className="mt-4 max-w-xl text-hoa-ink-muted">
              Alla medlemskap ger gymmet dygnet runt, en introduktion och en träningsplan.
              Skillnaden är hur mycket rödljus och hur många pass med The Awesome Protocol som
              ingår. Från {formatSek(lowestMembership)} per månad.
            </p>
            <div className="mt-8">
              <CtaLink href="/medlemskap">Jämför medlemskap</CtaLink>
            </div>
          </div>
          <div className="relative aspect-[4/5] w-full max-w-md justify-self-center overflow-hidden border border-hoa-line lg:justify-self-end">
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

      <section aria-labelledby="huset-rubrik">
        <Container className="py-16 sm:py-20">
          <Eyebrow>Huset</Eyebrow>
          <h2 id="huset-rubrik" className="mt-3 font-display text-4xl text-hoa-ink">
            Ett hus i Stora Höga
          </h2>
          <p className="mt-4 max-w-2xl text-hoa-ink-muted">
            Vi saknade länge en plats där träning, återhämtning och personlig vägledning finns
            samlat. Så vi byggde den själva. House of Awesome drivs av Patrik och Alexandra,
            samma team som står bakom Life Is Awesome.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <CtaLink href="/om" variant="secondary">
              Om huset
            </CtaLink>
            <CtaLink href="/besok" variant="ghost">
              Hitta hit
            </CtaLink>
          </div>
        </Container>
      </section>

      <section aria-labelledby="starta-rubrik" className="border-t border-hoa-line bg-hoa-bg-muted">
        <Container className="flex flex-col gap-6 py-14 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <h2 id="starta-rubrik" className="font-display text-3xl text-hoa-ink">
              Osäker på var du ska börja?
            </h2>
            <p className="mt-3 text-sm leading-6 text-hoa-ink-muted">
              Boka ett kostnadsfritt samtal på tio minuter. Vi lyssnar på dina mål och hjälper dig
              välja rätt första steg.
            </p>
          </div>
          <CtaLink href={bookingUrl(SHORT_CALL_SLUG, "home_cta")}>Boka ett kort samtal</CtaLink>
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
