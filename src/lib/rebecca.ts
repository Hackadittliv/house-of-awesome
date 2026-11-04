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
    { label: "Healing 45 min på plats", price: "950 kr", get href() { return bookingUrl("healing-emht", "rebecca_option"); } },
    { label: "Healingbehandling 45 min, på distans", price: "750 kr", href: inquiryPath },
    { label: "Healingbehandling 75 min med kompletterande metod efter önskemål", price: "1 500 kr", href: inquiryPath },
  ],
  booking: REBECCA_BOOKING,
  /** Används bara om bokningsbackend saknas vid bygget. */
  fallbackEmail: "annieorebecca@gmail.com",
  // Länken följer aktuell bokningskonfiguration.
  get requestPath() { return bookingUrl("healing-emht", "rebecca"); },
  cta: "Boka healing 45 min på plats",
  inquiryPath,
  inquiryCta: "Förfrågan om distans eller 75 min",
} as const;
