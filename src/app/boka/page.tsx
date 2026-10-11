import Link from "next/link";

import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { BookingUnavailable } from "@/components/booking/BookingUnavailable";
import { CancelLinkForwarder } from "@/components/booking/CancelLinkForwarder";
import { bookingEnabled } from "@/lib/booking/config";
import { bookingCopy as t } from "@/lib/booking/copy";
import { formatDuration, getBookableServices, getInquiryServices } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: t.listTitle,
  description: t.listLead,
  path: "/boka",
});

export default function BookingIndexPage() {
  const bookable = getBookableServices();
  const inquiry = getInquiryServices();

  return (
    <Container className="space-y-14 py-16 md:py-24">
      <CancelLinkForwarder />
      <PageHeader eyebrow="Bokning" title={t.listTitle} lead={t.listLead} />

      {!bookingEnabled ? (
        <div className="mx-auto max-w-2xl">
          <BookingUnavailable slug={null} />
        </div>
      ) : (
        <>
          <section aria-labelledby="bookable" className="space-y-5">
            <h2 id="bookable" className="text-2xl text-hoa-ink">
              {t.listBookableHeading}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bookable.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/boka/${service.slug}`}
                    className="flex h-full flex-col gap-2 rounded-lia-lg border border-hoa-line bg-hoa-card p-5 transition-colors hover:border-hoa-gold"
                  >
                    <span className="font-display text-lg text-hoa-ink">{service.name}</span>
                    <span className="text-sm text-hoa-ink-muted">
                      {[formatDuration(service), service.priceLabel].filter(Boolean).join(" · ")}
                    </span>
                    <span className="mt-auto pt-2 text-sm text-hoa-gold">{t.chooseTime}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="request" className="space-y-5">
            <div className="space-y-2">
              <h2 id="request" className="text-2xl text-hoa-ink">
                {t.listRequestHeading}
              </h2>
              <p className="text-hoa-ink-muted">{t.listRequestLead}</p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {inquiry.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/boka/forfragan?tjanst=${service.slug}`}
                    className="flex min-h-12 items-center justify-between gap-3 rounded-lia-md border border-hoa-line px-4 py-3 text-hoa-ink transition-colors hover:border-hoa-gold"
                  >
                    {service.name}
                    <span className="text-sm text-hoa-gold">{t.sendRequest}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </Container>
  );
}
