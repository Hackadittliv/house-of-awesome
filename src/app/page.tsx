import Link from "next/link";

import { CtaLink } from "@/components/CtaLink";
import { Container } from "@/components/Container";
import { formatAddress, getSuppliers, site } from "@/lib/content";

const highlights = [
  {
    href: "/upplevelsen",
    title: "Upplevelsen",
    text: "Utrustningsledda sessioner i en klinisk showroommiljö — få terapeuter, tydlig process.",
  },
  {
    href: "/sessioner",
    title: "Sessioner",
    text: "Bokning sker via Life Is Awesome. Inga kronpriser publiceras på den här sajten i fas 1.",
  },
  {
    href: "/showroom",
    title: "Showroom",
    text: "Professionell utrustning från utvalda leverantörer. Katalog fylls i senare.",
  },
];

export default function HomePage() {
  const suppliers = getSuppliers();

  return (
    <>
      <section className="border-b border-hoa-line">
        <Container className="grid gap-10 py-20 lg:grid-cols-[1.3fr_0.7fr] lg:items-end lg:py-28">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-hoa-gold">
              Stora Höga · {site.shortName}
            </p>
            <h1 className="mt-4 font-display text-5xl leading-[1.05] text-hoa-ink sm:text-6xl">
              Longevityklinik
              <br />
              och showroom.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-hoa-ink-muted">
              {site.tagline} Sessioner på utrustning, inte en klassisk
              behandlingsklinik. Syskon till {site.sibling.name}. Tidigare{" "}
              {site.formerName}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaLink href={site.ctas.booking.href}>{site.ctas.booking.label}</CtaLink>
              <CtaLink href="/showroom" variant="secondary">
                Utforska showroom
              </CtaLink>
            </div>
          </div>
          <aside className="border border-hoa-line bg-hoa-bg-elevated p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-hoa-gold">Besök</p>
            <p className="mt-3 text-hoa-ink">{formatAddress()}</p>
            <p className="mt-2 text-sm text-hoa-ink-muted">{site.hoursNote}</p>
            <div className="mt-5">
              <CtaLink href="/besok" variant="ghost">
                Hitta hit
              </CtaLink>
            </div>
          </aside>
        </Container>
      </section>

      <section>
        <Container className="grid gap-6 py-16 md:grid-cols-3">
          {highlights.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="border border-hoa-line bg-hoa-bg-elevated p-6 transition-colors hover:border-hoa-gold"
            >
              <h2 className="text-lg text-hoa-ink">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-hoa-ink-muted">{item.text}</p>
            </Link>
          ))}
        </Container>
      </section>

      <section className="border-y border-hoa-line bg-hoa-bg-muted">
        <Container className="flex flex-col gap-6 py-14 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.18em] text-hoa-gold">B2B</p>
            <h2 className="mt-3 font-display text-3xl text-hoa-ink">
              Professional-showroom
            </h2>
            <p className="mt-3 text-sm leading-6 text-hoa-ink-muted">
              Företag och kliniker som vill se utrustningen på plats går via{" "}
              {site.sibling.shortName} Professional — inte via en separat HOA-butik i
              fas 1.
            </p>
          </div>
          <CtaLink href={site.ctas.b2b.href}>{site.ctas.b2b.label}</CtaLink>
        </Container>
      </section>

      {suppliers.length > 0 ? (
        <section>
          <Container className="py-16">
            <p className="text-xs uppercase tracking-[0.18em] text-hoa-gold">
              Showroom
            </p>
            <h2 className="mt-3 font-display text-3xl text-hoa-ink">
              Leverantörer i fas 1
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-hoa-ink-muted">
              Routing-stubs. Fler namn i katalogen: {site.plannedPartners.join(", ")}.
            </p>
            <ul className="mt-8 flex flex-wrap gap-3">
              {suppliers.map((supplier) => (
                <li key={supplier.slug}>
                  <Link
                    href={`/showroom/${supplier.slug}`}
                    className="inline-block border border-hoa-line px-4 py-2 text-sm text-hoa-ink hover:border-hoa-gold hover:text-hoa-gold"
                  >
                    {supplier.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      ) : null}
    </>
  );
}
