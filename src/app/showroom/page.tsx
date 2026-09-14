import type { Metadata } from "next";

import { CtaLink } from "@/components/CtaLink";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { SupplierCard } from "@/components/SupplierCard";
import { getSuppliers, site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Showroom",
};

export default function ShowroomPage() {
  const suppliers = getSuppliers();

  return (
    <Container className="py-16 sm:py-20">
      <PageHeader
        eyebrow="Professional"
        title="Showroom"
        lead="Ett fullt Professional-showroom i samma hus som kliniken. Fas 1 visar struktur och routing — inte en färdig produktkatalog."
      />

      <div className="mt-10">
        <CtaLink href={site.ctas.b2b.href}>{site.ctas.b2b.label}</CtaLink>
      </div>

      <section className="mt-14">
        <h2 className="text-sm uppercase tracking-[0.18em] text-hoa-gold">
          Leverantörer med routing
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {suppliers.map((supplier) => (
            <SupplierCard key={supplier.slug} supplier={supplier} />
          ))}
        </div>
      </section>

      <section className="mt-14 border border-hoa-line bg-hoa-bg-elevated p-6">
        <h2 className="text-lg text-hoa-ink">Planerade namn</h2>
        <p className="mt-2 text-sm text-hoa-ink-muted">
          Partnernamn för kommande katalog. Inga produkter är påhittade utöver
          routing-stubs.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {site.plannedPartners.map((name) => (
            <li
              key={name}
              className="border border-hoa-line px-3 py-1 text-sm text-hoa-ink-muted"
            >
              {name}
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
