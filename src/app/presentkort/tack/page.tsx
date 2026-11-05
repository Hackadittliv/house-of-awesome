import { Container } from "@/components/Container";
import { CtaLink } from "@/components/CtaLink";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Tack för ditt köp",
  description: "Presentkortet är på väg via e-post.",
  path: "/presentkort/tack",
  noindex: true,
});

export default function GiftCardThanksPage() {
  return (
    <Container className="py-14 md:py-20">
      <div className="mx-auto max-w-2xl space-y-6 text-center">
        <h1 className="hoa-h1 text-hoa-ink">Tack för ditt köp</h1>
        <p className="text-hoa-ink-muted">Presentkortet kommer via e-post inom några minuter.</p>
        <CtaLink href="/butik" variant="ghost">
          Tillbaka till butiken
        </CtaLink>
      </div>
    </Container>
  );
}
