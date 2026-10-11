import Link from "next/link";

import { Container } from "@/components/Container";
import { CookieSettingsButton } from "@/components/consent/CookieSettingsButton";
import { formatAddress, site } from "@/lib/content";
import { b2bUrl, bookingUrl, mailtoUrl, telUrl } from "@/lib/links";
import { legalNav, primaryNav } from "@/lib/nav";

const linkClass = "text-sm text-hoa-ink-muted hover:text-hoa-ink";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-hoa-line bg-hoa-bg-elevated">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <p className="font-display text-xl text-hoa-ink">
            House of <span className="text-hoa-gold">Awesome</span>
          </p>
          <p className="mt-3 max-w-md text-sm leading-6 text-hoa-ink-muted">{site.tagline}</p>
          <address className="mt-4 space-y-1 text-sm not-italic text-hoa-ink">
            <p>{formatAddress()}</p>
            <p>
              <a href={telUrl()} className="hover:text-hoa-gold">
                {site.contact.phoneDisplay}
              </a>
            </p>
            <p>
              <a href={mailtoUrl()} className="hover:text-hoa-gold">
                {site.contact.email}
              </a>
            </p>
          </address>
        </div>

        <nav aria-label="Sidfot">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-hoa-gold">Sidor</p>
          <ul className="mt-4 space-y-2">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-hoa-gold">
            Life Is Awesome
          </p>
          <ul className="mt-4 space-y-2">
            <li>
              <a href={bookingUrl(null, "footer")} className={linkClass}>
                Boka tid
              </a>
            </li>
            <li>
              <a href={b2bUrl("footer")} className={linkClass}>
                Professional, för företag
              </a>
            </li>
            <li>
              <a href={site.operator.url} className={linkClass}>
                lifeisawesome.se
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-hoa-line">
        <Container className="flex flex-col gap-3 py-5 text-xs text-hoa-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.operator.legalName}, org.nr {site.operator.orgNr}.
            House of Awesome drivs av {site.operator.legalName}.
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-hoa-ink">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <CookieSettingsButton className="hover:text-hoa-ink" />
            </li>
          </ul>
        </Container>
      </div>
    </footer>
  );
}
