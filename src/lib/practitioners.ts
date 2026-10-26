// Terapeuter som bokas via Bokadirekt.

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

export const practitioners: Practitioner[] = [
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
