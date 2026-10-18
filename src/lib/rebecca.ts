// Rebecca Gustafsson, energimedicinsk healingterapi (EMHT).
// Förfrågningar skickas med route "rebecca". Servern (request-consultation i LIA) slår upp
// mottagaren i sin vitlista: rebecca -> annieorebecca@gmail.com.

export const REBECCA = {
  name: "Rebecca Gustafsson",
  service: "Energimedicinsk healingterapi (EMHT)",
  intro:
    "Under behandlingen kopplar du av och riktar uppmärksamheten inåt, medan du tar emot en mjuk och kraftfull energi som arbetar med kroppens egen självläkande förmåga. Den hjälper dig att komma i kontakt med ditt inre och hitta harmoni och balans.",
  options: [
    { label: "Healingbehandling 45 min, på plats", price: "950 kr" },
    { label: "Healingbehandling 45 min, på distans", price: "750 kr" },
    { label: "Healingbehandling 75 min med kompletterande metod efter önskemål", price: "1 500 kr" },
  ],
  /** Används bara om bokningsbackend saknas vid bygget. */
  fallbackEmail: "annieorebecca@gmail.com",
  requestPath: "/boka/forfragan/rebecca",
} as const;
