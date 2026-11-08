"use client";

import { usePathname } from "next/navigation";

import { CtaLink } from "@/components/CtaLink";
import { Newsletter } from "@/components/v2/Newsletter";
import { fitStyle } from "@/lib/heading";

const title = "Osäker på vad som passar dig?";

/** Delat CTA-band och nyhetsbrev, döljs i bokningsflödet. */
export function SharedBottom({ bookHref, adviceHref }: { bookHref: string; adviceHref: string }) {
  const pathname = usePathname();
  if (pathname.startsWith("/boka") || pathname.startsWith("/avbok") || /^\/behovsanalys(?:\/|$)/.test(pathname)) return null;
  return (
    <div data-shared-bottom>
      <section className="hoa-bottom-cta py-14 text-center md:py-16">
        <div className="@container mx-auto max-w-xl space-y-4 px-4">
          <h2 className="hoa-h2 text-hoa-ink" style={fitStyle(title)}>
            {title}
          </h2>
          <p className="text-hoa-ink-muted">Börja med några frågor om vad du behöver. Vi återkommer personligen och hjälper dig vidare.</p>
          <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
            <CtaLink href="/behovsanalys">Gör en behovsanalys</CtaLink>
            <CtaLink href={adviceHref} variant="secondary">Boka kostnadsfri rådgivning</CtaLink>
          </div>
          <CtaLink href={bookHref} variant="ghost">Boka behandling direkt</CtaLink>
        </div>
      </section>
      <Newsletter />
    </div>
  );
}
