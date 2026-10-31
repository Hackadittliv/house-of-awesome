import Link from "next/link";

import { Container } from "@/components/Container";
import { Wordmark } from "@/components/Logo";
import { CookieSettingsButton } from "@/components/consent/CookieSettingsButton";
import { formatAddress, site } from "@/lib/content";
import { b2bUrl, mailtoUrl, telUrl } from "@/lib/links";
import { aboutNav, legalNav, primaryNav } from "@/lib/nav";
import { sellerLine, sellerTermsUrl, termsLabel } from "@/lib/seller";

// Fristående länkar har minst 44 x 44 px klickyta, även med text i 12 och 14 px.
const target = "inline-flex min-h-11 min-w-11 items-center";
const linkClass = `${target} text-sm text-hoa-ink-muted transition-colors hover:text-hoa-gold`;
const head = "text-xs font-semibold uppercase tracking-[0.25em] text-hoa-gold";

export function SiteFooter() {
  return (
    <footer className="hoa-surface-dark mt-auto border-t border-hoa-line bg-hoa-bg">
      <Container className="grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Wordmark className="text-xl" />
          <p className="mt-3 text-sm text-hoa-ink-muted">Där vetenskap, själ och rörelse möts.</p>
          <p className="mt-1 text-xs text-hoa-ink-muted">{sellerLine}</p>
        </div>
        <nav aria-label="House of Awesome">
          <p className={head}>House of Awesome</p>
          <ul className="mt-2">
            {[...primaryNav, ...aboutNav].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Utforska">
          <p className={head}>Utforska</p>
          <ul className="mt-2">
            <li><a href={site.operator.url} className={linkClass}>Börja här</a></li>
            <li><a href={site.operator.url} className={linkClass}>Recept</a></li>
            <li><a href={site.operator.url} className={linkClass}>Podcasts</a></li>
            <li><a href={site.operator.url} className={linkClass}>Parasitkollen</a></li>
            <li><a href={b2bUrl("footer")} className={linkClass}>För verksamheter</a></li>
          </ul>
        </nav>
        <div>
          <p className={head}>Kontakt</p>
          <address className="mt-2 text-sm not-italic text-hoa-ink">
            <p><a href={mailtoUrl()} className={`${target} hover:text-hoa-gold`}>{site.contact.email}</a></p>
            <p><a href={telUrl()} className={`${target} hover:text-hoa-gold`}>073-349 08 36</a></p>
            <p className="mt-2">{formatAddress()}</p>
          </address>
        </div>
      </Container>
      <div className="border-t border-hoa-line">
        <Container className="space-y-3 py-6 text-xs leading-5 text-hoa-ink-muted">
          <p className="max-w-3xl">
            Innehållet är generell information och ersätter ingen medicinsk rådgivning, diagnos eller behandling.
            Vi erbjuder friskvård som ett komplement till hälso- och sjukvården. Vid akuta eller livshotande symtom, ring 112.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} {site.operator.legalName}</p>
            <ul className="flex flex-wrap gap-x-4">
              {legalNav.map((item) => (
                <li key={item.href}><Link href={item.href} className={`${target} hover:text-hoa-gold`}>{item.label}</Link></li>
              ))}
              <li><a href={sellerTermsUrl} className={`${target} hover:text-hoa-gold`}>{termsLabel}</a></li>
              <li><CookieSettingsButton className={`${target} cursor-pointer hover:text-hoa-gold`} /></li>
            </ul>
          </div>
        </Container>
      </div>
    </footer>
  );
}
