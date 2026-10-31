import Link from "next/link";

import { HeadingText } from "@/components/HeadingText";
import { cardClass } from "@/components/v2/ui";
import { formatDuration } from "@/lib/content";
import { fitStyle } from "@/lib/heading";
import { bookingUrl, inquiryUrl } from "@/lib/links";
import type { Service } from "@/lib/types";

export function ServiceCard({ service, placement }: { service: Service; placement: string }) {
  const duration = formatDuration(service);
  const titleId = `tjanst-${service.slug}`;

  return (
    <article aria-labelledby={titleId} className={`${cardClass} flex flex-col`}>
      {/* Länken är 44 px hög; -mt-2 tar bort den extra luften över texten. */}
      <h3 id={titleId} className="hoa-fit-text -mt-2 text-hoa-ink [--hoa-size:1.125rem] md:[--hoa-size:1.25rem]" style={fitStyle(service.name, false)}>
        <Link href={`/tjanster/${service.slug}`} className="inline-flex min-h-11 items-center">
          <HeadingText text={service.name} />
        </Link>
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-hoa-ink/80">{service.lead}</p>
      <dl className="mt-4 space-y-1 text-sm">
        {duration ? (
          <div className="flex gap-2">
            <dt className="text-hoa-ink-muted">Längd</dt>
            <dd className="text-hoa-ink">{duration}</dd>
          </div>
        ) : null}
        <div className="flex gap-2">
          <dt className="text-hoa-ink-muted">Pris</dt>
          <dd className="font-semibold text-hoa-gold">{service.priceLabel ?? "Enligt förfrågan"}</dd>
        </div>
      </dl>
      <div className="mt-auto flex flex-wrap items-center gap-3 pt-5">
        <a
          href={service.bookable ? bookingUrl(service.slug, placement) : inquiryUrl(service.slug, placement)}
          className="inline-flex min-h-11 items-center justify-center rounded-lia-md bg-hoa-gold px-4 py-2 font-display text-sm font-medium text-hoa-espresso no-underline transition-colors hover:bg-hoa-gold/90"
        >
          {service.bookable ? "Boka" : "Gör en förfrågan"}
          <span className="sr-only">: {service.name}</span>
        </a>
        <Link
          href={`/tjanster/${service.slug}`}
          className="inline-flex min-h-11 items-center justify-center rounded-lia-md border border-hoa-gold/40 px-4 py-2 font-display text-sm font-medium text-hoa-ink no-underline transition-colors hover:bg-hoa-hover"
        >
          Läs mer<span className="sr-only"> om {service.name}</span>
        </Link>
      </div>
    </article>
  );
}
