import Link from "next/link";

import { formatDuration } from "@/lib/content";
import { bookingUrl, inquiryUrl } from "@/lib/links";
import type { Service } from "@/lib/types";

export function ServiceCard({ service, placement }: { service: Service; placement: string }) {
  const duration = formatDuration(service);
  const titleId = `tjanst-${service.slug}`;

  return (
    <article
      aria-labelledby={titleId}
      className="flex flex-col border border-hoa-line bg-hoa-bg-elevated p-6 transition-colors hover:border-hoa-gold/70"
    >
      <h3 id={titleId} className="text-lg text-hoa-ink">
        <Link href={`/tjanster/${service.slug}`} className="hover:text-hoa-gold">
          {service.name}
        </Link>
      </h3>
      <p className="mt-2 text-sm leading-6 text-hoa-ink-muted">{service.lead}</p>
      <dl className="mt-4 space-y-1 text-sm">
        {duration ? (
          <div className="flex gap-2">
            <dt className="text-hoa-gold">Längd</dt>
            <dd className="text-hoa-ink">{duration}</dd>
          </div>
        ) : null}
        <div className="flex gap-2">
          <dt className="text-hoa-gold">Pris</dt>
          <dd className="text-hoa-ink">{service.priceLabel ?? "Enligt förfrågan"}</dd>
        </div>
      </dl>
      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-6">
        <a
          href={service.bookable ? bookingUrl(service.slug, placement) : inquiryUrl(service.slug, placement)}
          className="inline-flex min-h-11 items-center justify-center rounded-sm bg-hoa-gold px-4 py-2 text-sm font-medium text-hoa-bg transition-colors hover:bg-hoa-gold-hover"
        >
          {service.bookable ? "Boka" : "Gör en förfrågan"}
          <span className="sr-only">: {service.name}</span>
        </a>
        <Link
          href={`/tjanster/${service.slug}`}
          className="inline-flex min-h-11 items-center text-sm text-hoa-gold underline-offset-4 hover:underline"
        >
          Läs mer<span className="sr-only"> om {service.name}</span>
        </Link>
      </div>
    </article>
  );
}
