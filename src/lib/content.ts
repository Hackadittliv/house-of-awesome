import faqData from "../../content/faq.json";
import membershipsData from "../../content/memberships.json";
import servicesCopyData from "../../content/services.json";
import snapshotData from "../../content/services.snapshot.json";
import siteData from "../../content/site.json";

import { REBECCA_BOOKING } from "@/lib/rebecca-data";
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
  return label.replace(/(\d+)-kort/g, "klippkort med $1 gånger").replace(/\s+[-–—]\s+/g, ", ");
}

function serviceKey(service: { slug: string; clinic?: string | null }): string {
  return JSON.stringify([service.clinic ?? "lia", service.slug]);
}

function isRebecca(copy: ServiceCopy): boolean {
  return copy.slug === "healing-emht" && copy.clinic === "hoa" && copy.kind === "bookable";
}

function isBookable(copy: ServiceCopy, event: LiaEventType | undefined): boolean {
  // EMHT öppnar det befintliga bokningsflödet även före nästa LIA-snapshot.
  return copy.kind === "bookable" && (Boolean(event) || isRebecca(copy));
}

function toService(copy: ServiceCopy, event: LiaEventType | undefined): Service {
  const fallback = isRebecca(copy) ? REBECCA_BOOKING : undefined;
  return {
    ...copy,
    durationMinutes: event?.duration_minutes ?? fallback?.durationMinutes ?? null,
    priceLabel: formatPriceLabel(event ? event.price_label_sv : fallback?.priceLabel ?? null),
    location: event && event.location_type !== "in_person" ? "digital" : "in_person",
    bookable: isBookable(copy, event),
  };
}

export function getServices(): Service[] {
  const events = new Map(servicesSnapshot.services.map((event) => [serviceKey(event), event]));
  const order = new Map(servicesSnapshot.services.map((event) => [serviceKey(event), event.sort_order]));

  const bookable = serviceCopy
    .filter((copy) => isBookable(copy, events.get(serviceKey(copy))))
    .sort((a, b) => (order.get(serviceKey(a)) ?? Number.MAX_SAFE_INTEGER) - (order.get(serviceKey(b)) ?? Number.MAX_SAFE_INTEGER))
    .map((copy) => toService(copy, events.get(serviceKey(copy))));

  const inquiry = serviceCopy
    .filter((copy) => !isBookable(copy, events.get(serviceKey(copy))))
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
