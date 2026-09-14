import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CtaLink } from "@/components/CtaLink";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import {
  getProductsBySupplier,
  getSupplier,
  getSuppliers,
  site,
} from "@/lib/content";
import { categoryLabels } from "@/lib/types";

export function generateStaticParams() {
  return getSuppliers().map((supplier) => ({ leverantor: supplier.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/showroom/[leverantor]">): Promise<Metadata> {
  const { leverantor } = await params;
  const supplier = getSupplier(leverantor);
  return {
    title: supplier ? supplier.name : "Leverantör",
  };
}

export default async function LeverantorPage({
  params,
}: PageProps<"/showroom/[leverantor]">) {
  const { leverantor } = await params;
  const supplier = getSupplier(leverantor);

  if (!supplier) {
    notFound();
  }

  const products = getProductsBySupplier(supplier.slug);

  return (
    <Container className="py-16 sm:py-20">
      <p className="mb-6 text-sm">
        <Link href="/showroom" className="text-hoa-ink-muted hover:text-hoa-gold">
          ← Showroom
        </Link>
      </p>
      <PageHeader
        eyebrow="Leverantör"
        title={supplier.name}
        lead={supplier.blurb}
      />

      {supplier.website ? (
        <div className="mt-8">
          <CtaLink href={supplier.website} variant="secondary">
            Webbplats
          </CtaLink>
        </div>
      ) : null}

      <section className="mt-12">
        <h2 className="text-sm uppercase tracking-[0.18em] text-hoa-gold">
          Produkter
        </h2>
        {products.length === 0 ? (
          <p className="mt-4 max-w-xl text-sm leading-6 text-hoa-ink-muted">
            Ingen produkt är kopplad ännu. När katalogdata finns renderas den
            här från `content/products.json`.
          </p>
        ) : (
          <ul className="mt-6 grid gap-4">
            {products.map((product) => (
              <li key={product.slug}>
                <Link
                  href={`/showroom/${supplier.slug}/${product.slug}`}
                  className="block border border-hoa-line bg-hoa-bg-elevated p-6 hover:border-hoa-gold"
                >
                  <p className="text-xs uppercase tracking-[0.16em] text-hoa-gold">
                    {categoryLabels[product.category]}
                  </p>
                  <h3 className="mt-2 text-lg text-hoa-ink">{product.name}</h3>
                  <p className="mt-2 text-sm text-hoa-ink-muted">{product.short}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-12">
        <CtaLink href={site.ctas.b2b.href} variant="ghost">
          {site.ctas.b2b.label}
        </CtaLink>
      </div>
    </Container>
  );
}
