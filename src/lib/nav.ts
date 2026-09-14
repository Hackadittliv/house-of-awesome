export type NavItem = {
  href: string;
  label: string;
};

export const primaryNav: NavItem[] = [
  { href: "/", label: "Hem" },
  { href: "/upplevelsen", label: "Upplevelsen" },
  { href: "/sessioner", label: "Sessioner" },
  { href: "/showroom", label: "Showroom" },
  { href: "/medlemskap", label: "Medlemskap" },
  { href: "/besok", label: "Besök" },
];

export const secondaryNav: NavItem[] = [
  { href: "/faq", label: "FAQ" },
  { href: "/kontakt", label: "Kontakt" },
  { href: "/om", label: "Om" },
];

export const allNav: NavItem[] = [...primaryNav, ...secondaryNav];
