import Link from "next/link";

import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { BookingUnavailable } from "@/components/booking/BookingUnavailable";
import { CancelLinkForwarder } from "@/components/booking/CancelLinkForwarder";
import { ANNE_BOOKING_URL, anneRequestDetail } from "@/lib/anne";
import { bookingEnabled } from "@/lib/booking/config";
import { bookingCopy as t } from "@/lib/booking/copy";
import { optionDetail } from "@/lib/booking/offer-line";
import { formatDuration, getBookableServices, getInquiryServices } from "@/lib/content";
import { longevity } from "@/lib/longevity-content";
import { REBECCA } from "@/lib/rebecca";
import { SANDRA } from "@/lib/sandra";
import { pageMetadata } from "@/lib/seo";
import type { Service } from "@/lib/types";

export const metadata = pageMetadata({
  title: t.listTitle,
  description: t.listLead,
  path: "/boka",
});

// Tid och pris när de finns, annars tjänstens befintliga ingress. Inga påhittade priser.
function inquiryDetail(service: Service): string | null {
  const facts = [formatDuration(service), service.priceLabel].filter(Boolean).join(" · ");
  if (facts) return facts;
  const lead = service.lead.trim();
  return lead || null;
}

// Egna förfrågningsadresser. De ligger inte i tjänstekatalogen, eftersom en katalogpost
// också skulle skapa en sida under /boka/[slug].
const personRequests = [
  {
    id: "rebecca",
    name: `${REBECCA.service} hos ${REBECCA.name}`,
    href: REBECCA.requestPath,
    detail: optionDetail(REBECCA.options),
  },
  {
    id: "sandra",
    name: `Massage hos ${SANDRA.name}`,
    href: SANDRA.requestPath,
    detail: optionDetail(SANDRA.options),
  },
  {
    id: "anne",
    name: "Rådgivning hos Anne Wevers",
    href: ANNE_BOOKING_URL,
    detail: anneRequestDetail(longevity.anne.secondaryCta?.heading, longevity.anne.lead),
  },
] as const;

export default function BookingIndexPage() {
  const bookable = getBookableServices();
  const inquiry = [
    ...getInquiryServices().map((service) => ({
      id: service.slug,
      name: service.name,
      href: `/boka/forfragan?tjanst=${service.slug}`,
      detail: inquiryDetail(service),
    })),
    ...personRequests,
  ];

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
                <li key={service.id}>
                  <Link
                    href={service.href}
                    className="flex min-h-12 items-center justify-between gap-3 rounded-lia-md border border-hoa-line px-4 py-3 text-hoa-ink transition-colors hover:border-hoa-gold"
                  >
                    <span className="min-w-0">
                      <span className="block">{service.name}</span>
                      {service.detail ? (
                        <span className="mt-1 block text-sm text-hoa-ink-muted">{service.detail}</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-sm text-hoa-gold">{t.sendRequest}</span>
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
