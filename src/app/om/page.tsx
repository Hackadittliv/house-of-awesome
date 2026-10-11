import Image from "next/image";

import { Container } from "@/components/Container";
import { CtaLink } from "@/components/CtaLink";
import { Eyebrow } from "@/components/Eyebrow";
import { PageHeader } from "@/components/PageHeader";
import { SectionIntro } from "@/components/SectionIntro";
import { site } from "@/lib/content";
import { b2bUrl } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Om huset i Stora Höga",
  description:
    "House of Awesome är ett hus för träning, återhämtning och longevity i Stora Höga. Drivs av Patrik och Alexandra, teamet bakom Life Is Awesome.",
  path: "/om",
});

const gym = [
  {
    title: "Longevity Gym",
    text: "Minimalistiskt och genomtänkt. Du tränar hela kroppen med kettlebells, hantlar och några få men effektiva stationer för kondition och syre.",
  },
  {
    title: "Zazen Scalar",
    text: "Paneler med Zazen Scalar finns integrerade i gymmet och omger dig medan du tränar.",
  },
  {
    title: "Mät och följ upp",
    text: "Med InBody och en personlig plan följer du din utveckling över tid, i den takt som passar dig.",
  },
];

export default function OmPage() {
  return (
    <>
      <Container className="py-16 md:py-24">
        <PageHeader
          eyebrow="Om huset"
          title="Vi byggde platsen vi själva saknade"
          lead="Vi letade länge efter en plats där träning, återhämtning och personlig vägledning finns samlat. Till slut byggde vi den själva, i Stora Höga."
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl border border-hoa-gold/20">
            <Image
              src="/images/patrik-och-alexandra.webp"
              alt="Patrik och Alexandra, grundarna av Life Is Awesome och House of Awesome"
              fill
              preload
              sizes="(min-width: 1024px) 28rem, 90vw"
              className="object-cover"
            />
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-hoa-ink/80">
            <h2 className="text-2xl text-hoa-ink md:text-3xl">Patrik och Alexandra</h2>
            <p>
              Bakom House of Awesome står Patrik och Alexandra, samma par som driver Life Is
              Awesome. Där delar vi kunskap om hälsa och livsstil digitalt. Här i huset kan du
              uppleva det på plats.
            </p>
            <p>
              Huset är till för alla åldrar och alla nivåer. Oavsett om du vill hålla dig stark
              länge, prestera bättre eller helt enkelt må bra, får du ett upplägg som utgår från
              dig.
            </p>
            <p>
              House of Awesome hette tidigare {site.formerName}. Namnet är nytt och utbudet har
              förnyats.
            </p>
          </div>
        </div>
      </Container>

      <Container>
        <section
          aria-labelledby="platsen"
          className="relative isolate overflow-hidden rounded-2xl border border-hoa-gold/20"
        >
          <Image
            src="/images/stora-hoga-landskap.webp"
            alt="Landskapet runt Stora Höga i kvällsljus"
            fill
            sizes="(min-width: 1152px) 72rem, 100vw"
            className="-z-20 object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-hoa-bg/90 via-hoa-bg/75 to-hoa-bg/40" />
          <div className="px-6 py-16 md:px-12 md:py-20">
            <Eyebrow>Platsen</Eyebrow>
            <h2 id="platsen" className="mt-3 text-3xl leading-tight text-hoa-ink md:text-5xl">
              Stora Höga
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-hoa-ink">
              Huset ligger på {site.address.street} i Stora Höga i Stenungsunds kommun, med ängar och
              vatten runt knuten. {site.hours.members}
            </p>
            <div className="mt-8">
              <CtaLink href="/besok" variant="secondary">
                Hitta hit
              </CtaLink>
            </div>
          </div>
        </section>
      </Container>

      <Container className="py-16 md:py-24">
        <SectionIntro id="i-huset" eyebrow="I huset" title="Kvalitet före kvantitet" />
        <div className="mt-12 grid gap-4 md:mt-16 md:grid-cols-3">
          {gym.map((item) => (
            <div key={item.title} className="rounded-2xl border border-hoa-gold/20 bg-hoa-secondary/20 p-5 md:p-6">
              <h3 className="text-lg text-hoa-ink md:text-xl">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-hoa-ink/80">{item.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <CtaLink href="/tjanster">Se alla tjänster</CtaLink>
        </div>
      </Container>

      <section id="showroom" aria-labelledby="showroom-rubrik" className="bg-hoa-secondary/50">
        <Container className="flex flex-col gap-6 py-12 md:py-16 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <Eyebrow tone="gold">För företag</Eyebrow>
            <h2 id="showroom-rubrik" className="mt-3 text-2xl text-hoa-ink md:text-3xl">
              Showroom för professionell utrustning
            </h2>
            <p className="mt-3 text-sm leading-6 text-hoa-ink-muted">
              Huset är också ett showroom där företag och kliniker kan se utrustningen på plats,
              bland annat från {site.showroomPartners.slice(0, -1).join(", ")} och{" "}
              {site.showroomPartners.at(-1)}. Förfrågningar går via Life Is Awesome Professional.
            </p>
          </div>
          <CtaLink href={b2bUrl("about_showroom")}>Till Professional</CtaLink>
        </Container>
      </section>
    </>
  );
}
