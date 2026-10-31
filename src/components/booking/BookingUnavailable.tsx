import { CtaLink } from "@/components/CtaLink";
import { bookingCopy as t } from "@/lib/booking/copy";
import { liaBookingUrl } from "@/lib/links";

export function BookingUnavailable({ slug }: { slug: string | null }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl text-hoa-ink">{t.unavailableTitle}</h2>
      <p className="text-hoa-ink-muted">{t.unavailableLead}</p>
      <CtaLink href={liaBookingUrl(slug, "booking_fallback")}>{t.unavailableCta}</CtaLink>
    </div>
  );
}
