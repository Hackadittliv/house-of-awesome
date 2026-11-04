// Rebecca Gustafsson, energimedicinsk healingterapi (EMHT).
// Förfrågningar skickas med route "rebecca". Servern (request-consultation i LIA) slår upp
// mottagaren i sin vitlista: rebecca -> annieorebecca@gmail.com.

export const REBECCA = {
  name: "Rebecca Gustafsson",
  service: "Energimedicinsk healingterapi (EMHT)",
  intro:
    "Under behandlingen kopplar du av och riktar uppmärksamheten inåt, medan du tar emot en mjuk och kraftfull energi som arbetar med kroppens egen självläkande förmåga. Den hjälper dig att komma i kontakt med ditt inre och hitta harmoni och balans.",
  options: [
    { label: "60 min: samtal + 45 min healingbehandling", price: "1 050 kr" },
    { label: "90 min: healingbehandling med kompletterande metod efter önskemål", price: "1 550 kr" },
    { label: "45 min: healingbehandling på distans, med telefonsamtal före och efter", price: "650 kr" },
  ],
  /** Används bara om bokningsbackend saknas vid bygget. */
  fallbackEmail: "annieorebecca@gmail.com",
  requestPath: "/boka/forfragan/rebecca",
} as const;
