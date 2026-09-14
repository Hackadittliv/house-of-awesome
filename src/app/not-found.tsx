import { CtaLink } from "@/components/CtaLink";
import { Container } from "@/components/Container";

export default function NotFound() {
  return (
    <Container className="py-24">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-hoa-gold">
        404
      </p>
      <h1 className="mt-3 font-display text-4xl text-hoa-ink">Sidan finns inte</h1>
      <p className="mt-4 max-w-md text-hoa-ink-muted">
        Adressen matchar ingen sida i fas 1. Gå tillbaka till startsidan eller
        showroom.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <CtaLink href="/">Till startsidan</CtaLink>
        <CtaLink href="/showroom" variant="secondary">
          Showroom
        </CtaLink>
      </div>
    </Container>
  );
}
