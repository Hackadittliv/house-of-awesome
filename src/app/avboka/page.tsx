import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { BookingUnavailable } from "@/components/booking/BookingUnavailable";
import { CancelBooking } from "@/components/booking/CancelBooking";
import { bookingEnabled } from "@/lib/booking/config";
import { bookingCopy as t } from "@/lib/booking/copy";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: t.cancelTitle,
  description: t.cancelLead,
  path: "/avboka",
  noindex: true,
});

export default function CancelPage() {
  return (
    <Container className="py-16 md:py-24">
      <div className="mx-auto max-w-2xl space-y-8">
        <PageHeader title={t.cancelTitle} lead="" />
        {bookingEnabled ? <CancelBooking /> : <BookingUnavailable slug={null} />}
      </div>
    </Container>
  );
}
