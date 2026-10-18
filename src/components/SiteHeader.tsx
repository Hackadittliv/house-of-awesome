"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Container } from "@/components/Container";
import { CtaLink } from "@/components/CtaLink";
import { Logo } from "@/components/Logo";
import { type MenuEntry, isGroup, mainMenu } from "@/lib/nav";

function Plus({ open }: { open: boolean }) {
  return (
    <span aria-hidden className="text-2xl leading-none text-hoa-gold">
      {open ? "−" : "+"}
    </span>
  );
}

function MobileEntry({ entry, onNavigate }: { entry: MenuEntry; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <div className="flex items-center justify-between gap-3">
        <Link href={entry.href} onClick={onNavigate} className="inline-flex min-h-12 items-center text-lg text-hoa-ink">
          {entry.label}
        </Link>
        {entry.sections ? (
          <button
            type="button"
            aria-expanded={open}
            aria-label={`${open ? "Fäll ihop" : "Fäll ut"} ${entry.label}`}
            onClick={() => setOpen(!open)}
            className="inline-flex h-12 w-12 items-center justify-center"
          >
            <Plus open={open} />
          </button>
        ) : null}
      </div>
      {open && entry.sections ? (
        <ul className="mb-2 space-y-1 border-l border-hoa-gold/30 pl-4">
          {entry.sections.map((s) => (
            <li key={s.href}>
              <Link href={s.href} onClick={onNavigate} className="inline-flex min-h-10 items-center text-base text-hoa-ink-muted hover:text-hoa-gold">
                {s.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function MobileGroup({ label, items, onNavigate }: { label: string; items: MenuEntry[]; onNavigate: () => void }) {
  const [open, setOpen] = useState(true);
  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex min-h-12 w-full items-center justify-between text-left text-xl font-display font-semibold text-hoa-ink"
      >
        {label}
        <Plus open={open} />
      </button>
      {open ? (
        <ul className="mb-2 pl-4">
          {items.map((item) => (
            <MobileEntry key={item.href} entry={item} onNavigate={onNavigate} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function SiteHeader({ bookingHref }: { bookingHref: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-hoa-line bg-hoa-bg">
      <Container wide className="flex h-20 items-center justify-between gap-4 lg:h-24">
        <Logo />

        <nav aria-label="Huvudmeny" className="hidden items-center gap-6 xl:flex">
          {mainMenu.map((entry) =>
            isGroup(entry) ? (
              <div key={entry.label} className="group relative">
                <button type="button" className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-hoa-ink hover:text-hoa-gold">
                  {entry.label} <span aria-hidden>▾</span>
                </button>
                <div className="invisible absolute left-0 top-full w-72 rounded-2xl border border-hoa-gold/20 bg-hoa-bg p-3 opacity-0 shadow-gold transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  {entry.items.map((item) => (
                    <Link key={item.href} href={item.href} className="block rounded-lia-md px-3 py-2 text-sm text-hoa-ink hover:bg-hoa-secondary/50 hover:text-hoa-gold">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={entry.href}
                href={entry.href}
                aria-current={pathname === entry.href.split("#")[0] ? "page" : undefined}
                className="inline-flex min-h-11 items-center text-sm font-medium text-hoa-ink hover:text-hoa-gold aria-[current=page]:text-hoa-gold"
              >
                {entry.label}
              </Link>
            ),
          )}
          <Link href="/om" className="inline-flex min-h-11 items-center text-sm font-medium text-hoa-ink hover:text-hoa-gold">
            Om oss
          </Link>
        </nav>

        <div className="hidden xl:block">
          <CtaLink href={bookingHref} size="sm" className="px-6">
            Boka
          </CtaLink>
        </div>

        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-lia-md px-2 text-sm text-hoa-ink xl:hidden"
          aria-expanded={open}
          aria-controls="mobilmeny"
          onClick={() => setOpen(true)}
        >
          <span aria-hidden className="text-xl leading-none">☰</span>
          Meny
        </button>
      </Container>

      {open ? (
        <div id="mobilmeny" role="dialog" aria-modal="true" aria-label="Meny" className="fixed inset-0 z-[60] flex flex-col bg-hoa-bg xl:hidden">
          <div className="flex h-20 shrink-0 items-center justify-between border-b border-hoa-line px-4 sm:px-6">
            <p className="font-display text-sm font-bold tracking-[0.25em] text-hoa-gold">HOUSE OF AWESOME</p>
            <button type="button" onClick={close} className="inline-flex h-12 w-12 items-center justify-center text-3xl text-hoa-ink">
              <span aria-hidden>×</span>
              <span className="sr-only">Stäng meny</span>
            </button>
          </div>
          <nav aria-label="Mobilmeny" className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            <ul className="space-y-1">
              {mainMenu.map((entry) =>
                isGroup(entry) ? (
                  <MobileGroup key={entry.label} label={entry.label} items={entry.items} onNavigate={close} />
                ) : (
                  <MobileEntry key={entry.href} entry={{ ...entry, label: entry.label }} onNavigate={close} />
                ),
              )}
            </ul>
          </nav>
          <div className="shrink-0 border-t border-hoa-line p-4 sm:p-6">
            <CtaLink href={bookingHref} className="min-h-14 w-full text-lg">
              Boka
            </CtaLink>
          </div>
        </div>
      ) : null}
    </header>
  );
}
