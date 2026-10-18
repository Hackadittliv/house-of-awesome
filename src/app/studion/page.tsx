import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { BookingUnavailable } from "@/components/booking/BookingUnavailable";
import { StudionBooking } from "@/components/booking/StudionBooking";
import { bookingEnabled } from "@/lib/booking/config";
import { studionCopy as t } from "@/lib/booking/studion";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: t.title,
  description: t.lead,
  path: "/studion",
  noindex: true,
});

export default function StudionPage() {
  return (
    <Container className="py-16 md:py-24">
      <div className="mx-auto max-w-5xl space-y-8">
        <PageHeader title={t.title} lead={t.lead} />
        {bookingEnabled ? <StudionBooking /> : <BookingUnavailable slug={null} />}
      </div>
    </Container>
  );
}
