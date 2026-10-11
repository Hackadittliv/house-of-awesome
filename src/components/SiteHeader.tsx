"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Container } from "@/components/Container";
import { CtaLink } from "@/components/CtaLink";
import { Logo } from "@/components/Logo";
import { primaryNav } from "@/lib/nav";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({ bookingHref }: { bookingHref: string }) {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;

  return (
    <header className="sticky top-0 z-50 border-b border-hoa-line/80 bg-hoa-bg/90 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Huvudmeny" className="hidden items-center gap-6 lg:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
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
          <CtaLink href={bookingHref}>Boka tid</CtaLink>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-hoa-line text-hoa-ink lg:hidden"
          aria-expanded={open}
          aria-controls="mobilmeny"
          onClick={() => setOpenPath(open ? null : pathname)}
        >
          <span className="sr-only">{open ? "Stäng meny" : "Öppna meny"}</span>
          <span aria-hidden className="text-lg leading-none">
            {open ? "×" : "☰"}
          </span>
        </button>
      </Container>

      {open ? (
        <div id="mobilmeny" className="border-t border-hoa-line bg-hoa-bg-elevated lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            <nav aria-label="Mobilmeny" className="flex flex-col gap-1">
              {primaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className={`rounded-sm px-2 py-3 text-base ${
                    isActive(pathname, item.href) ? "text-hoa-gold" : "text-hoa-ink-muted"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="pt-3">
              <CtaLink href={bookingHref}>Boka tid</CtaLink>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
