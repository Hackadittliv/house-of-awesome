import faqData from "../../content/faq.json";
import productsData from "../../content/products.json";
import sessionsData from "../../content/sessions.json";
import siteData from "../../content/site.json";
import suppliersData from "../../content/suppliers.json";

import type { FaqItem, Product, Session, SiteConfig, Supplier } from "@/lib/types";

export const site = siteData as SiteConfig;

export function getSuppliers(): Supplier[] {
  return [...(suppliersData as Supplier[])].sort((a, b) => a.order - b.order);
}

export function getSupplier(slug: string): Supplier | undefined {
  return getSuppliers().find((supplier) => supplier.slug === slug);
}

export function getProducts(): Product[] {
  return [...(productsData as Product[])].sort((a, b) => a.order - b.order);
}

export function getProductsBySupplier(supplierId: string): Product[] {
  return getProducts().filter((product) => product.supplier_id === supplierId);
}

export function getProduct(
  supplierId: string,
  slug: string,
): Product | undefined {
  return getProducts().find(
    (product) => product.supplier_id === supplierId && product.slug === slug,
  );
}

export function getSessions(): Session[] {
  return sessionsData as Session[];
}

export function getActiveSessions(): Session[] {
  return getSessions().filter((session) => session.active);
}

export function getFaqItems(): FaqItem[] {
  return faqData as FaqItem[];
}

export function formatAddress(multiline = false): string {
  const { street, city, country } = site.address;
  return multiline
    ? `${street}\n${city}\n${country}`
    : `${street}, ${city}`;
}
