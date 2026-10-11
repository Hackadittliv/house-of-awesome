import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { BookingUnavailable } from "@/components/booking/BookingUnavailable";
import { RequestPage } from "@/components/booking/RequestPage";
import { bookingEnabled } from "@/lib/booking/config";
import { bookingCopy as t } from "@/lib/booking/copy";
import { getServices } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: t.requestTitle,
  description: t.requestLead,
  path: "/boka/forfragan",
});

export default function RequestFormPage() {
  const services = Object.fromEntries(getServices().map((service) => [service.slug, service.name]));
  return (
    <Container className="py-16 md:py-24">
      <div className="mx-auto max-w-2xl space-y-10">
        <PageHeader eyebrow="Förfrågan" title={t.requestTitle} lead={t.requestLead} />
        {bookingEnabled ? <RequestPage services={services} /> : <BookingUnavailable slug={null} />}
      </div>
    </Container>
  );
}
