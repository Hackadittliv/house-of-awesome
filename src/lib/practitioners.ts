// Terapeuter som bokas via Bokadirekt (The house of wellness, Stora Höga).
// Källa: https://www.bokadirekt.se/places/the-house-of-wellness-stora-hoga-35832 (hämtad 2026-10-18).
// Namn, titlar, tjänster och priser är tagna därifrån. Uppdatera här om de ändras på Bokadirekt.

export const BOKADIREKT_PLACE_URL = "https://www.bokadirekt.se/places/the-house-of-wellness-stora-hoga-35832";
const SERVICE_BASE = "https://www.bokadirekt.se/boka-tjanst/the-house-of-wellness-stora-hoga-35832";

export type PractitionerService = { name: string; price: string; href: string };

export type Practitioner = {
  id: string;
  name: string;
  role: string;
  company?: string;
  intro: string;
  services: PractitionerService[];
  website?: { label: string; href: string };
};

const IBALANS_BOKADIREKT_URL = "https://www.bokadirekt.se/places/ibalans-2000-49659";

const svc = (name: string, price: string, path: string): PractitionerService => ({ name, price, href: `${SERVICE_BASE}/${path}` });

export const practitioners: Practitioner[] = [
  {
    id: "sandra-kawert",
    name: "Sandra Kåwert",
    role: "Massageterapeut",
    intro: "Massage som anpassas efter dina behov för dagen, från lugn avslappning till djupgående triggerpunktsbehandling.",
    services: [
      svc("Massage efter dina behov, 25 min", "550 kr", "massage-efter-dina-behov-25min-1893994"),
      svc("Massage efter dina behov, 45 min", "700 kr", "massage-efter-dina-behov-45min-3410175"),
      svc("Massage efter dina behov, 55 min", "830 kr", "massage-efter-dina-behov-55min-1893991"),
      svc("Avslappningsmassage, 55 min", "780 kr", "avslappningsmassage-55-min-1135878"),
      svc("Avslappningsmassage, 75 min", "1 000 kr", "avslappningsmassage-75-minuter-1550853"),
      svc("Lymfmassage, 90 min", "1 150 kr", "lymfmassage-90-min-2130352"),
      svc("Indisk huvud- och ansiktsmassage, 55 min", "800 kr", "indisk-huvud-och-ansiktsmassage-55min-1794736"),
      svc("Halv djupgående, halv huvud- och ansiktsmassage, 55 min", "800 kr", "1-2-djupgaende-och-1-2-huvud-och-ansiktsmassage-1874506"),
    ],
  },
  {
    id: "lisa-dalwer",
    name: "Lisa Dalwér",
    role: "Massageterapeut",
    intro: "Svensk klassisk massage efter dina önskemål, och käkledsbehandling för spänningar i käke, nacke och huvud.",
    services: [
      svc("Svensk klassisk massage, 30 min", "550 kr", "svensk-klassisk-massage-30-min-3179070"),
      svc("Svensk klassisk massage, 45 min", "720 kr", "svensk-klassisk-massage-45-min-3161864"),
      svc("Svensk klassisk massage, 60 min", "850 kr", "svensk-klassisk-massage-60-min-3161858"),
      svc("Svensk klassisk massage, 90 min", "1 250 kr", "svensk-klassisk-massage-90-min-3303379"),
      svc("Käkledsbehandling, 50 min", "800 kr", "kakledsbehandling-50-min-3328158"),
    ],
  },
  {
    id: "tobias-andersson",
    name: "Tobias \u201dTobbe\u201d Andersson",
    role: "Terapeut",
    company: "Ibalans 2000",
    // Källor: https://ibalansayurveda.se/ och https://www.bokadirekt.se/places/ibalans-2000-49659 (hämtade 2026-10-18).
    intro: "Ayurvedisk hälsorådgivare med över 20 års erfarenhet av holistiska metoder. Tobbe kombinerar Ayurveda med frekvensterapi (bioresonans) som stöd för kroppens egen balans.",
    services: [
      { name: "Hälsoanalys, 80 min (rekommenderas som första besök)", price: "850 kr", href: IBALANS_BOKADIREKT_URL },
      { name: "Behandling, Ayurveda och frekvensterapi, 50 min", price: "600 kr", href: IBALANS_BOKADIREKT_URL },
    ],
    website: { label: "ibalansayurveda.se", href: "https://ibalansayurveda.se/" },
  },
];
