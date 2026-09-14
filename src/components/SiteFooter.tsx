import Link from "next/link";

import { Container } from "@/components/Container";
import { formatAddress, site } from "@/lib/content";
import { allNav } from "@/lib/nav";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-hoa-line bg-hoa-bg-elevated">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="font-display text-xl text-hoa-ink">
            House of <span className="text-hoa-gold">Awesome</span>
          </p>
          <p className="mt-3 max-w-md text-sm leading-6 text-hoa-ink-muted">
            {site.tagline} Syskon till {site.sibling.name}. Tidigare {site.formerName}.
          </p>
          <p className="mt-4 text-sm text-hoa-ink">{formatAddress()}</p>
          <p className="mt-1 text-sm text-hoa-ink-muted">{site.hoursNote}</p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-hoa-gold">
            Sidor
          </p>
          <ul className="mt-4 space-y-2">
            {allNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-hoa-ink-muted hover:text-hoa-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-hoa-gold">
            Life Is Awesome
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a
                href={site.sibling.href}
                className="text-hoa-ink-muted hover:text-hoa-ink"
                target="_blank"
                rel="noopener noreferrer"
              >
                {site.sibling.name}
              </a>
            </li>
            <li>
              <a
                href={site.ctas.booking.href}
                className="text-hoa-ink-muted hover:text-hoa-ink"
                target="_blank"
                rel="noopener noreferrer"
              >
                Boka session
              </a>
            </li>
            <li>
              <a
                href={site.ctas.b2b.href}
                className="text-hoa-ink-muted hover:text-hoa-ink"
                target="_blank"
                rel="noopener noreferrer"
              >
                {site.ctas.b2b.label}
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-hoa-line">
        <Container className="flex flex-col gap-2 py-5 text-xs text-hoa-ink-muted sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}</p>
          <p>Fas 1 — innehåll och katalog fylls på successivt.</p>
        </Container>
      </div>
    </footer>
  );
}
