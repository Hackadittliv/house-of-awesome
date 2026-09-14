export type ProductCategory =
  | "hbot"
  | "ihht"
  | "light"
  | "heat"
  | "cold"
  | "training"
  | "other";

export type Supplier = {
  slug: string;
  name: string;
  logo: string | null;
  blurb: string;
  website: string | null;
  order: number;
};

export type Product = {
  slug: string;
  supplier_id: string;
  category: ProductCategory;
  name: string;
  short: string;
  body: string;
  specs: Record<string, string>;
  images: string[];
  showroom: boolean;
  bookable_session: boolean;
  order: number;
};

export type Session = {
  slug: string;
  product_id?: string | null;
  name: string;
  duration_min: number | null;
  price_single: number | null;
  price_10pack: number | null;
  book_url: string;
  active: boolean;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type SiteCta = {
  label: string;
  href: string;
};

export type SiteConfig = {
  name: string;
  shortName: string;
  tagline: string;
  locale: string;
  formerName: string;
  sibling: {
    name: string;
    shortName: string;
    href: string;
  };
  address: {
    street: string;
    city: string;
    country: string;
  };
  hoursNote: string;
  ctas: {
    booking: SiteCta;
    b2b: SiteCta;
  };
  plannedPartners: string[];
};

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "hbot",
  "ihht",
  "light",
  "heat",
  "cold",
  "training",
  "other",
];

export const categoryLabels: Record<ProductCategory, string> = {
  hbot: "HBOT",
  ihht: "IHHT",
  light: "Ljus",
  heat: "Värme",
  cold: "Kyla",
  training: "Träning",
  other: "Övrigt",
};
