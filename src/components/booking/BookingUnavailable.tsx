import { CtaLink } from "@/components/CtaLink";
import { bookingCopy as t } from "@/lib/booking/copy";
import { INTRODUCTION_SLUG } from "@/lib/booking/introduction";
import { liaBookingUrl, mailtoUrl } from "@/lib/links";

export function BookingUnavailable({ slug }: { slug: string | null }) {
  const introduction = slug === INTRODUCTION_SLUG;
  return (
    <div className="space-y-4">
      <h2 className="text-2xl text-hoa-ink">{t.unavailableTitle}</h2>
      <p className="text-hoa-ink-muted">{introduction ? t.introductionUnavailableLead : t.unavailableLead}</p>
      <CtaLink href={introduction ? mailtoUrl("Kostnadsfri introduktion med Patrik") : liaBookingUrl(slug, "booking_fallback")}>
        {introduction ? t.introductionUnavailableCta : t.unavailableCta}
      </CtaLink>
    </div>
  );
}
