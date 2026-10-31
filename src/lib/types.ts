export type SiteConfig = {
  name: string;
  shortName: string;
  url: string;
  tagline: string;
  description: string;
  locale: string;
  formerName: string;
  operator: {
    legalName: string;
    orgNr: string;
    registeredAddress: string;
    url: string;
    privacyPolicyUrl: string;
    termsUrl: string;
  };
  contact: {
    email: string;
    phone: string;
    phoneDisplay: string;
  };
  address: {
    street: string;
    postalCode: string;
    city: string;
    region: string;
    country: string;
    countryName: string;
  };
  hours: {
    members: string;
    staffed: string;
  };
  booking: {
    base: string;
    membership: string;
    b2b: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
  };
  showroomPartners: string[];
};

export type LiaLocationType = "meet" | "phone" | "in_person";

export type LiaEventType = {
  slug: string;
  title_sv: string;
  duration_minutes: number;
  price_label_sv: string | null;
  location_type: LiaLocationType;
  requires_payment: boolean;
  sort_order: number;
};

export type ServicesSnapshot = {
  source: string;
  fetchedAt: string;
  services: LiaEventType[];
};

export type ServiceCategory = "syre" | "ljus" | "traning" | "samtal" | "halsa" | "kropp";

export type ServiceCopy = {
  slug: string;
  kind: "bookable" | "inquiry";
  category: ServiceCategory;
  name: string;
  shortName: string;
  lead: string;
  body: string[];
  points: string[];
  durationLabel?: string;
  image?: string;
  imageAlt?: string;
  healthDeclaration?: boolean;
};

export type Service = ServiceCopy & {
  durationMinutes: number | null;
  priceLabel: string | null;
  location: "in_person" | "digital";
  bookable: boolean;
};

export type Membership = {
  priceId: string;
  name: string;
  pricePerMonth: number;
  tagline: string;
  items: string[];
  featured: boolean;
  spots: number | null;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type LongevitySection = {
  id: string;
  heading: string;
  body?: string[];
  points?: string[];
  bodyAfter?: string[];
  steps?: { title: string; text: string }[];
  items?: { title: string; text: string }[];
};

export type LongevityPageContent = {
  path: string;
  title: string;
  metaDescription: string;
  eyebrow: string;
  h1: string;
  lead: string;
  sections: LongevitySection[];
  cta: { heading: string; text: string; buttonLabel: string };
  disclaimer: string;
  links: { label: string; href: string }[];
};
