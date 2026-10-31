import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { ConsentedTrackers } from "@/components/consent/ConsentedTrackers";
import { ConsentProvider } from "@/components/consent/ConsentProvider";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SharedBottom } from "@/components/v2/SharedBottom";
import { scrubSensitiveParamsScript } from "@/lib/booking/sensitive-url";
import { site } from "@/lib/content";
import { SHORT_CALL_SLUG, bookingUrl } from "@/lib/links";
import { businessJsonLd, siteUrl } from "@/lib/seo";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} | Longevity i Stora Höga`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    siteName: site.name,
    locale: site.locale,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#FDF5E2",
  // Sajten är mörk i grunden (:root har color-scheme: dark). Sidhuvudet och
  // ljusa band sätter color-scheme: light via .hoa-surface-light.
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sv" className={`${inter.variable} ${jakarta.variable} h-full antialiased`}>
      <head>
        <script id="hoa-scrub-sensitive-params" dangerouslySetInnerHTML={{ __html: scrubSensitiveParamsScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-hoa-bg text-hoa-ink">
        <ConsentProvider>
          <a
            href="#innehall"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:bg-hoa-gold focus:px-3 focus:py-2 focus:text-hoa-bg"
          >
            Hoppa till innehåll
          </a>
          <SiteHeader bookingHref={bookingUrl(null, "header")} />
          <main id="innehall" className="flex-1 bg-hoa-bg">
            {children}
          </main>
          <SharedBottom bookHref={bookingUrl(null, "cta_band")} adviceHref={bookingUrl(SHORT_CALL_SLUG, "cta_band")} />
          <SiteFooter />
          <ConsentBanner />
          <ConsentedTrackers />
        </ConsentProvider>
        <JsonLd data={businessJsonLd()} />
      </body>
    </html>
  );
}
