import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/Container";
import { CtaLink } from "@/components/CtaLink";
import { Disclaimer } from "@/components/Disclaimer";
import { Eyebrow } from "@/components/Eyebrow";
import { JsonLd } from "@/components/JsonLd";
import { categoryLabels, formatDuration, getService, getServices, site } from "@/lib/content";
import { bookingUrl, inquiryUrl, mailtoUrl } from "@/lib/links";
import { breadcrumbJsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getServices().map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps<"/tjanster/[slug]">) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  const duration = formatDuration(service);
  return pageMetadata({
    title: service.name,
    description: [service.lead, duration ? `${duration}.` : null, `${site.name} i Stora Höga.`]
      .filter(Boolean)
      .join(" "),
    path: `/tjanster/${service.slug}`,
  });
}

export default async function ServicePage({ params }: PageProps<"/tjanster/[slug]">) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const duration = formatDuration(service);
  const related = getServices()
    .filter((other) => other.slug !== service.slug && other.category === service.category)
    .slice(0, 3);

  return (
    <>
      <Container className="py-16 md:py-24">
        <nav aria-label="Brödsmulor" className="text-sm text-hoa-ink-muted">
          <ol className="flex flex-wrap gap-2">
            <li>
              <Link href="/" className="hover:text-hoa-gold">
                Hem
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/tjanster" className="hover:text-hoa-gold">
                Tjänster
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-hoa-ink">
              {service.shortName}
            </li>
          </ol>
        </nav>

        <div
          className={`mt-10 grid gap-12 ${service.image ? "lg:grid-cols-[1.2fr_0.8fr]" : "lg:grid-cols-[1.4fr_0.6fr]"}`}
        >
          <div>
            <Eyebrow>{categoryLabels[service.category]}</Eyebrow>
            <h1 className="mt-3 text-3xl leading-tight text-hoa-ink md:text-5xl">
              {service.name}
            </h1>
            <p className="mt-4 text-lg leading-8 text-hoa-ink">{service.lead}</p>
            <div className="mt-6 space-y-4 leading-7 text-hoa-ink-muted">
              {service.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <ul className="mt-8 space-y-3">
              {service.points.map((point) => (
                <li key={point} className="flex gap-3 text-hoa-ink">
                  <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-hoa-gold" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          <aside className="h-fit space-y-6">
            {service.image ? (
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-hoa-gold/20">
                <Image
                  src={service.image}
                  alt={service.imageAlt ?? ""}
                  fill
                  preload
                  sizes="(min-width: 1024px) 26rem, 90vw"
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="rounded-2xl border border-hoa-gold/20 bg-hoa-secondary/20 p-5 md:p-6">
              <dl className="space-y-3 text-sm">
                {duration ? (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-hoa-gold">Längd</dt>
                    <dd className="mt-1 text-hoa-ink">{duration}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-hoa-gold">Pris</dt>
                  <dd className="mt-1 text-hoa-ink">{service.priceLabel ?? "Enligt förfrågan"}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.25em] text-hoa-gold">Plats</dt>
                  <dd className="mt-1 text-hoa-ink">
                    {service.location === "digital"
                      ? "Digitalt via videosamtal"
                      : `I huset på ${site.address.street}, ${site.address.city}`}
                  </dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-col gap-3">
                {service.bookable ? (
                  <CtaLink href={bookingUrl(service.slug, "service_page")}>Boka {service.shortName}</CtaLink>
                ) : (
                  <>
                    <CtaLink href={inquiryUrl(service.slug, "service_page")}>Boka ett kort samtal</CtaLink>
                    <CtaLink href={mailtoUrl(`Förfrågan: ${service.name}`)} variant="secondary">
                      Mejla en förfrågan
                    </CtaLink>
                  </>
                )}
              </div>
              <p className="mt-4 text-xs leading-5 text-hoa-ink-muted">
                {service.bookable
                  ? "Bokning och betalning sker hos Life Is Awesome, som driver House of Awesome."
                  : "Det korta samtalet är kostnadsfritt och sker via video. Där bokar vi en tid som passar."}
              </p>
            </div>
          </aside>
        </div>

        <Disclaimer className="mt-14" />
      </Container>

      {related.length > 0 ? (
        <section aria-labelledby="fler-tjanster" className="bg-hoa-secondary/50">
          <Container className="py-14">
            <h2 id="fler-tjanster" className="text-2xl text-hoa-ink md:text-3xl">
              Fler inom {categoryLabels[service.category].toLowerCase()}
            </h2>
            <ul className="mt-6 flex flex-wrap gap-3">
              {related.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={`/tjanster/${other.slug}`}
                    className="inline-flex min-h-11 items-center rounded-full border border-hoa-gold/40 px-5 py-2 font-display text-sm font-medium text-hoa-ink transition-colors hover:bg-hoa-gold/10"
                  >
                    {other.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/tjanster"
                  className="inline-flex min-h-11 items-center px-4 py-2 text-sm text-hoa-gold underline-offset-4 hover:underline"
                >
                  Alla tjänster
                </Link>
              </li>
            </ul>
          </Container>
        </section>
      ) : null}

      <JsonLd data={serviceJsonLd(service)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Hem", path: "/" },
          { name: "Tjänster", path: "/tjanster" },
          { name: service.name, path: `/tjanster/${service.slug}` },
        ])}
      />
    </>
  );
}
