import Image from "next/image";

import { Container } from "@/components/Container";
import { CtaLink } from "@/components/CtaLink";
import { Eyebrow } from "@/components/Eyebrow";
import { PageHeader } from "@/components/PageHeader";
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
      <Container className="py-16 sm:py-20">
        <PageHeader
          eyebrow="Om huset"
          title="Vi byggde platsen vi själva saknade"
          lead="Vi letade länge efter en plats där träning, återhämtning och personlig vägledning finns samlat. Till slut byggde vi den själva, i Stora Höga."
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden border border-hoa-line">
            <Image
              src="/images/patrik-och-alexandra.webp"
              alt="Patrik och Alexandra, grundarna av Life Is Awesome och House of Awesome"
              fill
              preload
              sizes="(min-width: 1024px) 28rem, 90vw"
              className="object-cover"
            />
          </div>
          <div className="space-y-5 leading-7 text-hoa-ink-muted">
            <h2 className="font-display text-3xl text-hoa-ink">Patrik och Alexandra</h2>
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

      <section aria-labelledby="platsen" className="relative isolate overflow-hidden border-y border-hoa-line">
        <Image
          src="/images/stora-hoga-landskap.webp"
          alt="Landskapet runt Stora Höga i kvällsljus"
          fill
          sizes="100vw"
          className="-z-20 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-hoa-bg/80" />
        <Container className="py-20">
          <Eyebrow>Platsen</Eyebrow>
          <h2 id="platsen" className="mt-3 font-display text-4xl text-hoa-ink">
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
        </Container>
      </section>

      <Container className="py-16 sm:py-20">
        <Eyebrow>I huset</Eyebrow>
        <h2 className="mt-3 font-display text-4xl text-hoa-ink">Kvalitet före kvantitet</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {gym.map((item) => (
            <div key={item.title} className="border border-hoa-line bg-hoa-bg-elevated p-6">
              <h3 className="text-lg text-hoa-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-hoa-ink-muted">{item.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <CtaLink href="/tjanster">Se alla tjänster</CtaLink>
        </div>
      </Container>

      <section id="showroom" aria-labelledby="showroom-rubrik" className="border-t border-hoa-line bg-hoa-bg-muted">
        <Container className="flex flex-col gap-6 py-14 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <Eyebrow>För företag</Eyebrow>
            <h2 id="showroom-rubrik" className="mt-3 font-display text-3xl text-hoa-ink">
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
