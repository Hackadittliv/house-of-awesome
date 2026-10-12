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
    <header className="sticky top-0 z-50 border-b border-hoa-line bg-hoa-bg shadow-sm">
      <Container wide className="flex h-24 items-center justify-between gap-4 sm:h-28 lg:h-32">
        <Logo />

        <nav aria-label="Huvudmeny" className="hidden items-center gap-7 lg:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className={`inline-flex min-h-11 items-center text-sm font-medium transition-colors ${
                isActive(pathname, item.href) ? "text-hoa-gold" : "text-hoa-ink hover:text-hoa-gold"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <CtaLink href={bookingHref} size="sm">
            Boka tid
          </CtaLink>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-lia-md text-hoa-ink transition-colors hover:bg-hoa-bronze lg:hidden"
          aria-expanded={open}
          aria-controls="mobilmeny"
          onClick={() => setOpenPath(open ? null : pathname)}
        >
          <span className="sr-only">{open ? "Stäng meny" : "Öppna meny"}</span>
          <span aria-hidden className="text-xl leading-none">
            {open ? "×" : "☰"}
          </span>
        </button>
      </Container>

      {open ? (
        <div id="mobilmeny" className="border-t border-hoa-line bg-hoa-bg lg:hidden">
          <Container wide className="flex flex-col gap-2 py-6">
            <nav aria-label="Mobilmeny" className="flex flex-col gap-1">
              {primaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center text-lg font-medium ${
                    isActive(pathname, item.href) ? "text-hoa-gold" : "text-hoa-ink"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <CtaLink href={bookingHref} size="sm" className="mt-4 w-full">
              Boka tid
            </CtaLink>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
