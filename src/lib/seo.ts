import type { Metadata } from "next";

import { formatDuration, getServices, site } from "@/lib/content";
import { bookingUrl } from "@/lib/links";
import type { FaqItem, Service } from "@/lib/types";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || site.url).replace(/\/$/, "");

export function absoluteUrl(path = "/"): string {
  return `${siteUrl}${path === "/" ? "/" : path}`;
}

export const BUSINESS_ID = `${site.url}/#verksamhet`;
const ORGANIZATION_ID = `${site.operator.url}/#organisation`;

/** Fasaden, samma fil och alt som src/app/opengraph-image.jpg och opengraph-image.alt.txt. */
export const DEFAULT_OG_IMAGE = {
  url: "/opengraph-image.jpg",
  width: 1200,
  height: 630,
  alt: "Fasaden på House of Awesome i Stora Höga",
};

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  /** Segmentet har en egen opengraph-image (startsidan och tjänsterna). */
  ownOgImage?: boolean;
};

export function pageMetadata({ title, description, path, noindex, ownOgImage }: PageMetaInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: site.name,
      locale: site.locale,
      type: "website",
      // Sidans openGraph ersätter layoutens, så standardbilden följer med här.
      // Utan nyckeln images använder Next segmentets egen opengraph-image.
      ...(ownOgImage ? {} : { images: [DEFAULT_OG_IMAGE] }),
    },
    twitter: { card: "summary_large_image", title, description },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}

export function businessJsonLd() {
  const { address, contact, operator } = site;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HealthAndBeautyBusiness",
        "@id": BUSINESS_ID,
        name: site.name,
        alternateName: site.formerName,
        description: site.description,
        url: `${site.url}/`,
        image: `${site.url}/images/house-of-awesome-fasad-2400.webp`,
        logo: `${site.url}/images/lia-uggla.webp`,
        telephone: contact.phone,
        email: contact.email,
        priceRange: "kr",
        currenciesAccepted: "SEK",
        address: {
          "@type": "PostalAddress",
          streetAddress: address.street,
          postalCode: address.postalCode,
          addressLocality: address.city,
          addressRegion: address.region,
          addressCountry: address.country,
        },
        parentOrganization: { "@id": ORGANIZATION_ID },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Tjänster",
          itemListElement: getServices().map((service) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: service.name,
              url: `${site.url}/tjanster/${service.slug}`,
            },
          })),
        },
      },
      {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: "Life Is Awesome",
        legalName: operator.legalName,
        url: operator.url,
        identifier: { "@type": "PropertyValue", propertyID: "orgnr", value: operator.orgNr },
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#webbplats`,
        url: `${site.url}/`,
        name: site.name,
        inLanguage: "sv-SE",
        publisher: { "@id": ORGANIZATION_ID },
      },
    ],
  };
}

export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${site.url}${item.path}`,
    })),
  };
}

export function serviceJsonLd(service: Service) {
  const duration = formatDuration(service);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: [service.lead, duration, service.priceLabel].filter(Boolean).join(" "),
    url: `${site.url}/tjanster/${service.slug}`,
    provider: { "@id": BUSINESS_ID },
    areaServed: service.location === "digital" ? "Sverige" : site.address.city,
    ...(service.bookable
      ? {
          potentialAction: {
            "@type": "ReserveAction",
            target: bookingUrl(service.slug, "jsonld"),
          },
        }
      : {}),
  };
}
