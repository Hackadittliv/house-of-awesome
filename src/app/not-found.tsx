import { Container } from "@/components/Container";
import { CtaLink } from "@/components/CtaLink";

export default function NotFound() {
  return (
    <Container className="py-14 md:py-24">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-hoa-gold">404</p>
      <h1 className="mt-3 hoa-h1 leading-tight text-hoa-ink">Sidan finns inte</h1>
      <p className="mt-4 max-w-md text-hoa-ink-muted">
        Adressen matchar ingen sida. Kanske hittar du det du söker bland våra tjänster.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <CtaLink href="/">Till startsidan</CtaLink>
        <CtaLink href="/tjanster" variant="secondary">
          Tjänster
        </CtaLink>
      </div>
    </Container>
  );
}
