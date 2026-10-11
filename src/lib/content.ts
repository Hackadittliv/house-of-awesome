import faqData from "../../content/faq.json";
import membershipsData from "../../content/memberships.json";
import servicesCopyData from "../../content/services.json";
import snapshotData from "../../content/services.snapshot.json";
import siteData from "../../content/site.json";

import type {
  FaqItem,
  LiaEventType,
  Membership,
  Service,
  ServiceCopy,
  ServicesSnapshot,
  SiteConfig,
} from "@/lib/types";

export const site = siteData as SiteConfig;
export const servicesSnapshot = snapshotData as ServicesSnapshot;

const serviceCopy = servicesCopyData as ServiceCopy[];

export const categoryLabels: Record<ServiceCopy["category"], string> = {
  syre: "Syre",
  ljus: "Ljus",
  traning: "Träning",
  samtal: "Samtal och coachning",
  halsa: "Hälsa och provtagning",
  kropp: "Kropp",
};

// LIA skriver t.ex. "Från 900 kr (10-kort), styckpris 1 000 kr". Vi visar samma fakta utan bindestreck.
export function formatPriceLabel(label: string | null): string | null {
  if (!label) return null;
  const match = label.match(/^Från (.+?) \((\d+)-kort\), styckpris (.+)$/i);
  if (match) {
    const [, fromPrice, count, single] = match;
    return `${single} per gång, eller ${fromPrice} per gång med klippkort för ${count} gånger`;
  }
  return label.replace(/(\d+)-kort/g, "klippkort med $1 gånger");
}

function toService(copy: ServiceCopy, event: LiaEventType | undefined): Service {
  return {
    ...copy,
    durationMinutes: event?.duration_minutes ?? null,
    priceLabel: formatPriceLabel(event?.price_label_sv ?? null),
    location: event && event.location_type !== "in_person" ? "digital" : "in_person",
    bookable: copy.kind === "bookable" && Boolean(event),
  };
}

export function getServices(): Service[] {
  const events = new Map(servicesSnapshot.services.map((event) => [event.slug, event]));
  const order = new Map(servicesSnapshot.services.map((event) => [event.slug, event.sort_order]));

  const bookable = serviceCopy
    .filter((copy) => copy.kind === "bookable" && events.has(copy.slug))
    .sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0))
    .map((copy) => toService(copy, events.get(copy.slug)));

  const inquiry = serviceCopy
    .filter((copy) => copy.kind === "inquiry" || !events.has(copy.slug))
    .map((copy) => toService({ ...copy, kind: "inquiry" }, undefined));

  return [...bookable, ...inquiry];
}

export function getBookableServices(): Service[] {
  return getServices().filter((service) => service.bookable);
}

export function getInquiryServices(): Service[] {
  return getServices().filter((service) => !service.bookable);
}

export function getService(slug: string): Service | undefined {
  return getServices().find((service) => service.slug === slug);
}

export function getMemberships(): Membership[] {
  return membershipsData as Membership[];
}

export function getFaqItems(): FaqItem[] {
  return faqData as FaqItem[];
}

export function formatAddress(): string {
  const { street, postalCode, city } = site.address;
  return `${street}, ${postalCode} ${city}`;
}

export function formatSek(amount: number): string {
  return `${amount.toLocaleString("sv-SE").replace(/\u00a0/g, " ")} kr`;
}

export function formatDuration(service: Service): string | null {
  if (service.durationMinutes) return `${service.durationMinutes} minuter`;
  return service.durationLabel ?? null;
}

// Samma formulering som LIA:s ansvarsfriskrivning (awesome-life-hub, src/config/longevityClinicLanding.ts).
export const HEALTH_DISCLAIMER =
  "Innehållet är generell information och utgör inte medicinsk rådgivning, diagnos eller behandling. Individuella upplevelser och resultat varierar. Lämplighet, risker och kontraindikationer ska bedömas av legitimerad hälso- och sjukvårdspersonal när det krävs. Vid akuta eller livshotande symtom, ring 112.";
