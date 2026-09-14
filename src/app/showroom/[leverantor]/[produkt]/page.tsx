import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CtaLink } from "@/components/CtaLink";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import {
  getProduct,
  getProducts,
  getSupplier,
  site,
} from "@/lib/content";
import { categoryLabels } from "@/lib/types";

export function generateStaticParams() {
  return getProducts()
    .map((product) => {
      const supplier = getSupplier(product.supplier_id);
      if (!supplier) return null;
      return { leverantor: supplier.slug, produkt: product.slug };
    })
    .filter((value): value is { leverantor: string; produkt: string } =>
      value !== null,
    );
}

export async function generateMetadata({
  params,
}: PageProps<"/showroom/[leverantor]/[produkt]">): Promise<Metadata> {
  const { leverantor, produkt } = await params;
  const product = getProduct(leverantor, produkt);
  return {
    title: product ? product.name : "Produkt",
  };
}

export default async function ProduktPage({
  params,
}: PageProps<"/showroom/[leverantor]/[produkt]">) {
  const { leverantor, produkt } = await params;
  const supplier = getSupplier(leverantor);
  const product = getProduct(leverantor, produkt);

  if (!supplier || !product) {
    notFound();
  }

  const specEntries = Object.entries(product.specs);

  return (
    <Container className="py-16 sm:py-20">
      <p className="mb-6 text-sm text-hoa-ink-muted">
        <Link href="/showroom" className="hover:text-hoa-gold">
          Showroom
        </Link>
        {" / "}
        <Link href={`/showroom/${supplier.slug}`} className="hover:text-hoa-gold">
          {supplier.name}
        </Link>
      </p>

      <PageHeader
        eyebrow={categoryLabels[product.category]}
        title={product.name}
        lead={product.short}
      />

      <article className="mt-10 max-w-2xl text-sm leading-7 text-hoa-ink-muted">
        <p>{product.body}</p>
      </article>

      {specEntries.length > 0 ? (
        <dl className="mt-10 max-w-xl border border-hoa-line">
          {specEntries.map(([key, value]) => (
            <div
              key={key}
              className="grid grid-cols-2 gap-4 border-b border-hoa-line px-4 py-3 last:border-b-0"
            >
              <dt className="text-sm text-hoa-ink-muted">{key}</dt>
              <dd className="text-sm text-hoa-ink">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-8 text-sm text-hoa-ink-muted">
          Specifikationer saknas i fas 1-stubben.
        </p>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        {product.bookable_session ? (
          <CtaLink href={site.ctas.booking.href}>{site.ctas.booking.label}</CtaLink>
        ) : null}
        <CtaLink href={site.ctas.b2b.href} variant="secondary">
          {site.ctas.b2b.label}
        </CtaLink>
      </div>
    </Container>
  );
}
