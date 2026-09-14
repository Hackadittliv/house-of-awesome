import Link from "next/link";

import type { Supplier } from "@/lib/types";

export function SupplierCard({ supplier }: { supplier: Supplier }) {
  return (
    <Link
      href={`/showroom/${supplier.slug}`}
      className="group block border border-hoa-line bg-hoa-bg-elevated p-6 transition-colors hover:border-hoa-gold"
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center border border-hoa-gold/40 text-xs font-medium uppercase tracking-wider text-hoa-gold">
        {supplier.name.slice(0, 2)}
      </div>
      <h2 className="text-lg text-hoa-ink group-hover:text-hoa-gold">{supplier.name}</h2>
      <p className="mt-2 text-sm leading-6 text-hoa-ink-muted">{supplier.blurb}</p>
    </Link>
  );
}
