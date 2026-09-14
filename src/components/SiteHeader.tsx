"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { CtaLink } from "@/components/CtaLink";
import { Container } from "@/components/Container";
import { site } from "@/lib/content";
import { allNav, primaryNav } from "@/lib/nav";

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-hoa-line/80 bg-hoa-bg/90 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="shrink-0 font-display text-lg tracking-wide text-hoa-ink">
          House of <span className="text-hoa-gold">Awesome</span>
        </Link>

        <nav aria-label="Huvudmeny" className="hidden items-center gap-6 lg:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm tracking-wide transition-colors ${
                isActive(pathname, item.href)
                  ? "text-hoa-gold"
                  : "text-hoa-ink-muted hover:text-hoa-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <CtaLink href={site.ctas.booking.href}>{site.ctas.booking.label}</CtaLink>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-hoa-line text-hoa-ink lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <span className="sr-only">{open ? "Stäng meny" : "Öppna meny"}</span>
          <span aria-hidden className="text-lg leading-none">
            {open ? "×" : "☰"}
          </span>
        </button>
      </Container>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-hoa-line bg-hoa-bg-elevated lg:hidden"
        >
          <Container className="flex flex-col gap-1 py-4">
            {allNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-sm px-2 py-2 text-sm ${
                  isActive(pathname, item.href)
                    ? "text-hoa-gold"
                    : "text-hoa-ink-muted"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3">
              <CtaLink href={site.ctas.booking.href}>{site.ctas.booking.label}</CtaLink>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
