// Rebecca Gustafsson, energimedicinsk healingterapi (EMHT).
// Direktbokning använder LIA:s healing-emht. Reservsidan /boka/forfragan/rebecca
// behåller route "rebecca", vars mottagare slås upp i LIA:s vitlista.

import { bookingUrl } from "@/lib/links";
import { REBECCA_BOOKING } from "@/lib/rebecca-data";

const inquiryPath = "/boka/forfragan/rebecca";

export const REBECCA = {
  name: "Rebecca Gustafsson",
  service: "Energimedicinsk healingterapi (EMHT)",
  intro:
    "Under behandlingen kopplar du av och riktar uppmärksamheten inåt, medan du tar emot en mjuk och kraftfull energi som arbetar med kroppens egen självläkande förmåga. Den hjälper dig att komma i kontakt med ditt inre och hitta harmoni och balans.",
  options: [
    { label: "60 min samtal + 45 min healingbehandling på plats", price: "1 050 kr", get href() { return bookingUrl("healing-emht", "rebecca_option"); } },
    { label: "45 min healingbehandling på distans med telefonsamtal före och efter", price: "650 kr", href: inquiryPath },
    { label: "90 min healingbehandling med kompletterande metod efter önskemål", price: "1 550 kr", href: inquiryPath },
  ],
  booking: REBECCA_BOOKING,
  /** Används bara om bokningsbackend saknas vid bygget. */
  fallbackEmail: "annieorebecca@gmail.com",
  // Länken följer aktuell bokningskonfiguration.
  get requestPath() { return bookingUrl("healing-emht", "rebecca"); },
  cta: "Boka samtal och healing på plats",
  inquiryPath,
  inquiryCta: "Förfrågan om distans eller 90 min",
} as const;
