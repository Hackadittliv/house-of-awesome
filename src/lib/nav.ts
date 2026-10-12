export type NavItem = {
  href: string;
  label: string;
};

export const primaryNav: NavItem[] = [
  { href: "/tjanster", label: "Tjänster" },
  { href: "/medlemskap", label: "Medlemskap" },
  { href: "/om", label: "Om huset" },
  { href: "/besok", label: "Besök och kontakt" },
  { href: "/faq", label: "Frågor och svar" },
];

export const legalNav: NavItem[] = [
  { href: "/integritetspolicy", label: "Integritetspolicy" },
  { href: "/cookies", label: "Cookies" },
];
