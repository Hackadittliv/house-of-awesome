// Förfrågningar till Sandra använder husets standardmottagare (utan route).
export const SANDRA = {
  name: "Sandra Bengts",
  role: "Friskvårdsmassör",
  service: "Svensk klassisk massage",
  serviceSlug: "massage-sandra",
  location: "På plats hos House of Awesome.",
  intro:
    "Hej! Jag heter Sandra och är diplomerad friskvårdsmassör från Axelsons Institute i Göteborg. Jag brinner för hälsa och välmående och vill genom klassisk massage hjälpa dig att släppa på spänningar, finna återhämtning och fylla på med ny energi. Som person är jag varm, lyhörd och omtänksam. För mig är det viktigt att du känner dig trygg och väl omhändertagen och får en behandling anpassad efter just dina behov. Jag ser fram emot att få välkomna dig till en stund av avkoppling och välbefinnande.",
  description:
    'Svensk klassisk massage innebär knådning och strykningar av mjukdelsvävnader (hud, bindväv och muskler). Denna typ av massage kan vara antingen förebyggande eller användas för att behandla uppkomna skador och begränsningar av rörligheten. Ökar blodcirkulationen och frigör kroppens "må bra"-hormon oxytocin. Jag anpassar behandlingen efter dina önskemål och behov.',
  options: [
    { label: "Svensk klassisk massage 30 min", price: "550 kr" },
    { label: "Svensk klassisk massage 50 min", price: "800 kr" },
  ],
  requestPath: "/boka/forfragan/sandra",
} as const;
