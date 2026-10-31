"use client";

import { usePathname } from "next/navigation";

import { CtaLink } from "@/components/CtaLink";
import { Newsletter } from "@/components/v2/Newsletter";
import { fitStyle } from "@/lib/heading";

const title = "Osäker på vad som passar dig?";

/** Delat CTA-band och nyhetsbrev, döljs i bokningsflödet. */
export function SharedBottom({ bookHref, adviceHref }: { bookHref: string; adviceHref: string }) {
  const pathname = usePathname();
  if (pathname.startsWith("/boka") || pathname.startsWith("/avbok")) return null;
  return (
    <div data-shared-bottom>
      <section className="hoa-bottom-cta py-14 text-center md:py-16">
        <div className="@container mx-auto max-w-xl space-y-4 px-4">
          <h2 className="hoa-h2 text-hoa-ink" style={fitStyle(title)}>
            {title}
          </h2>
          <p className="text-hoa-ink-muted">Boka en kostnadsfri rådgivning. Vi lyssnar och hjälper dig välja rätt.</p>
          <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
            <CtaLink href={adviceHref}>Boka kostnadsfri rådgivning</CtaLink>
            <CtaLink href={bookHref} variant="secondary">Boka behandling direkt</CtaLink>
          </div>
          <p className="text-xs text-hoa-ink-muted">10 min · Helt kostnadsfritt · Inget köpkrav</p>
        </div>
      </section>
      <Newsletter />
    </div>
  );
}
