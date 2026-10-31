import Link from "next/link";
import { notFound } from "next/navigation";

import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { BookingUnavailable } from "@/components/booking/BookingUnavailable";
import { RequestForm } from "@/components/booking/RequestForm";
import { bookingEnabled } from "@/lib/booking/config";
import { bookingCopy as t } from "@/lib/booking/copy";
import { getService, getServices } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return getServices().map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps<"/boka/[slug]">) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return pageMetadata({
    title: `Boka ${service.shortName}`,
    description: service.lead,
    path: `/boka/${service.slug}`,
  });
}

export default async function BookServicePage({ params }: PageProps<"/boka/[slug]">) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  return (
    <Container className="py-16 md:py-24">
      <div className="mx-auto max-w-3xl space-y-8">
        <nav aria-label="Brödsmulor" className="text-sm text-hoa-ink-muted">
          <Link href="/boka" className="hover:text-hoa-gold">
            {t.backToServices}
          </Link>
        </nav>
        <header className="space-y-3">
          <Eyebrow>{service.bookable ? t.listBookableHeading : t.listRequestHeading}</Eyebrow>
          <h1 className="text-3xl leading-tight text-hoa-ink md:text-5xl">{service.name}</h1>
          <p className="text-lg leading-relaxed text-hoa-ink-muted">{service.lead}</p>
        </header>

        {!bookingEnabled ? (
          <BookingUnavailable slug={service.bookable ? service.slug : null} />
        ) : service.bookable ? (
          <BookingFlow slug={service.slug} serviceName={service.name} healthDeclaration={Boolean(service.healthDeclaration)} />
        ) : (
          <div className="space-y-4">
            <p className="text-hoa-ink-muted">{t.listRequestLead}</p>
            <RequestForm serviceSlug={service.slug} serviceName={service.name} />
          </div>
        )}
      </div>
    </Container>
  );
}
