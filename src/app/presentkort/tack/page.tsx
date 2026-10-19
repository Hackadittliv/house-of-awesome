import Link from "next/link";

import { Container } from "@/components/Container";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Tack för ditt köp",
  description: "Presentkortet är på väg via e-post.",
  path: "/presentkort/tack",
  noindex: true,
});

export default function GiftCardThanksPage() {
  return (
    <Container className="py-16 md:py-24">
      <div className="mx-auto max-w-2xl space-y-6 text-center">
        <h1 className="font-display text-3xl text-hoa-ink">Tack för ditt köp</h1>
        <p className="text-hoa-ink-muted">Presentkortet kommer via e-post inom några minuter.</p>
        <Link href="/butik" className="inline-block text-sm text-hoa-gold underline-offset-4 hover:underline">
          Tillbaka till butiken
        </Link>
      </div>
    </Container>
  );
}
