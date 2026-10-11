import Link from "next/link";

import { Container } from "@/components/Container";
import { Confirmation } from "@/components/booking/Confirmation";
import { bookingCopy as t } from "@/lib/booking/copy";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: t.thanksPageTitle,
  description: t.thanksPageLead,
  path: "/boka/tack",
  noindex: true,
});

export default function BookingThanksPage() {
  return (
    <Container className="py-16 md:py-24">
      <div className="mx-auto max-w-2xl space-y-8">
        <Confirmation />
        <Link href="/tjanster" className="inline-block text-sm text-hoa-gold underline-offset-4 hover:underline">
          {t.backToServices}
        </Link>
      </div>
    </Container>
  );
}
