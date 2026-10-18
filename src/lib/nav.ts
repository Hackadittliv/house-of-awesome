export type NavItem = {
  href: string;
  label: string;
};

export type MenuEntry = NavItem & {
  /** Sektioner på sidan som visas när posten fälls ut (+). */
  sections?: NavItem[];
};

export type MenuGroup = {
  label: string;
  items: MenuEntry[];
};

export const offerGroup: MenuGroup = {
  label: "Vårt utbud",
  items: [
    {
      href: "/longevity-behandlingar",
      label: "Longevity-behandlingar",
      sections: [
        { href: "/longevity-behandlingar#celloxy-ihht", label: "Celloxy IHHT" },
        { href: "/longevity-behandlingar#tryckkammare", label: "Tryckkammare (HBOT)" },
        { href: "/longevity-behandlingar#rodljus-pemf", label: "Rödljus + PEMF" },
        { href: "/longevity-behandlingar#ewot", label: "EWOT" },
      ],
    },
    {
      href: "/funktionsmedicin",
      label: "Funktionsmedicin & tester",
      sections: [
        { href: "/funktionsmedicin#blodprover", label: "Blodprover" },
        { href: "/funktionsmedicin#dna-metylering", label: "DNA-metylering" },
        { href: "/funktionsmedicin#borrelia", label: "Borrelia" },
        { href: "/funktionsmedicin#tungmetaller-och-mogel", label: "Tungmetaller och mögel" },
      ],
    },
    {
      href: "/behandlingar-och-samtal",
      label: "Behandlingar & samtal",
      sections: [
        { href: "/behandlingar-och-samtal#massage", label: "Massage" },
        { href: "/behandlingar-och-samtal#healing", label: "Healing" },
        { href: "/behandlingar-och-samtal#coachning", label: "Coachning & vägledning" },
        { href: "/behandlingar-och-samtal#samtal", label: "Trauma & samtal" },
        { href: "/behandlingar-och-samtal#terapeuter", label: "Terapeuter & coacher" },
      ],
    },
    {
      href: "/medlemskap",
      label: "Gym & träning",
      sections: [
        { href: "/medlemskap#gymmet", label: "Gymmet" },
        { href: "/medlemskap#baslager", label: "Basläger" },
        { href: "/awesome-protocol", label: "The Awesome Protocol" },
        { href: "/klinik-24-7", label: "24/7-klinik" },
      ],
    },
    { href: "/event-och-lokaler", label: "Event, föreläsningar & lokaler" },
  ],
};

/** Menyn från Christians skärmbild. */
export const mainMenu: (MenuEntry | MenuGroup)[] = [
  { href: "/medlemskap#medlemskap", label: "Medlemskap" },
  offerGroup,
  {
    href: "/longevity-resor",
    label: "Longevity-resor",
    sections: [
      { href: "/longevity-resor#program", label: "Programmen" },
      { href: "/longevity-resor#resan", label: "Före, på plats och efter" },
      { href: "/longevity-resor#en-dag", label: "En dag under Awesome Week" },
      { href: "/longevity-resor#tillval", label: "Tillval och boende" },
    ],
  },
  { href: "/zazen-scalar", label: "Zazen Scalar" },
  {
    href: "/butik",
    label: "Butik & presentkort",
    sections: [
      { href: "/butik#sortiment", label: "Sortimentet" },
      { href: "/butik#presentkort", label: "Presentkort" },
    ],
  },
];

export function isGroup(entry: MenuEntry | MenuGroup): entry is MenuGroup {
  return "items" in entry;
}

/** Används av sidfoten och äldre sidor. */
export const primaryNav: NavItem[] = [
  { href: "/longevity-behandlingar", label: "Longevity-behandlingar" },
  { href: "/behandlingar-och-samtal", label: "Behandlingar & samtal" },
  { href: "/funktionsmedicin", label: "Funktionsmedicin" },
  { href: "/medlemskap", label: "Gym & medlemskap" },
  { href: "/longevity-resor", label: "Longevity-resor" },
  { href: "/event-och-lokaler", label: "Event & lokaler" },
];

export const aboutNav: NavItem[] = [
  { href: "/om", label: "Om oss" },
  { href: "/kontakt", label: "Boka & kontakt" },
  { href: "/zazen-scalar", label: "Zazen Scalar" },
  { href: "/klinik-24-7", label: "24/7-klinik" },
  { href: "/faq", label: "Frågor och svar" },
];

export const legalNav: NavItem[] = [
  { href: "/integritetspolicy", label: "Integritetspolicy" },
  { href: "/cookies", label: "Cookies" },
];
