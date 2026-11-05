# Bokning: Rebeccas healing i HOA-kliniken

Rebeccas healing bokas på `/boka/healing-emht` i HOA:s befintliga `BookingFlow`: 60 min samtal + 45 min healingbehandling för 1 050 kr och betalning på plats. LIA:s bokningslängd är 60 minuter. Tjänsten anger `clinic: "hoa"`, som följer med till både tillgänglighet och bokning som `clinic_slug: "hoa"`. Övriga tjänster och Studion behåller tidigare request bodies. `site: "hoa"` anger fortsatt avsändarsajt.

Rebeccas primära knapp och första behandlingsalternativ använder `bookingUrl`. Externa bokningslänkar, reservknappen, JSON-LD och `llms.txt` använder `https://lifeisawesome.se/boka/healing-emht?clinic=hoa` med befintliga UTM-parametrar. Tjänster utan klinikfält behåller sina tidigare adresser. Med bokningskonfiguration använder sajten interna länkar.

Tjänster med `payment: "on_site"` visar texten ”Du bokar via Life Is Awesome och betalar på plats.” LIA:s svar styr själva betalningsflödet. Rebeccas egen prislista gäller enligt beslutet 2026-11-04. Alternativen är 90 min healingbehandling med kompletterande metod efter önskemål för 1 550 kr och 45 min healingbehandling på distans för 650 kr, med telefonsamtal före och efter. Båda behåller tydligt märkta förfrågningslänkar till Rebecca.

## Klinikmodell och tjänstedata

Enligt klinikmodellen från 2026-11-02 delar terapeuter rum. En bokning låser både rum och terapeut, och terapeutdata hanteras i LIA-admin. https://github.com/Hackadittliv/awesome-life-hub/pull/39 är stängd. HOA skickar tjänst och klinik; resursval och låsning hanteras av LIA.

Synkningen i `scripts/sync-services.mjs` är återställd till `origin/main` och testerna för RPC-synkningen är borttagna. `npm run sync:services` är känt trasigt sedan LIA #41 eftersom anon saknar läsrättighet till tabellen. Det åtgärdas separat på LIA-sidan.

Innehållslagret matchar fakta, bokningsbarhet och sortering på `(clinic ?? "lia", slug)`. Saknat klinikfält fungerar som tidigare och tillhör `lia`. Koden använder aldrig snapshotfältet `inquiry_only`; klinik för API-anrop och länkar kommer från `services.json`.

En HOA-post matchas aldrig mot en LIA-post med samma slug. HOA:s innehållskatalog har unika sluggar och adresserna använder fortsatt bara slug, exempelvis `/boka/healing-emht`.

Den incheckade snapshoten är oförändrad och saknar fortfarande `hoa/healing-emht`. De bekräftade reservvärdena 60 minuter och 1 050 kr används tills snapshoten innehåller rätt klinik och tjänst. Reservvärdena ligger i den beroendefria modulen `src/lib/rebecca-data.ts`, som delas av innehållslagret och Rebecca-modulen. Importcykeln mellan Rebecca, länkar och innehåll är borttagen.

`BookingFlow` använder rena hjälpfunktioner för API-argumenten. Bokningsanropet använder fortsatt `eventType.slug` från LIA:s tillgänglighetssvar tillsammans med tjänstens klinik. Kalenderfil, avbokning och HOA:s styling är oförändrade.

## Avgränsning

`next.config.ts` är oförändrad mot `main` för att undvika överlapp med Anne i PR #11. Den befintliga automatiska HTTP-redirecten för `/boka/:slug` saknar klinikparameter endast när LIA-konfiguration saknas vid bygget. Det gäller även `/boka/healing-emht` i det läget. Produktionen har LIA-konfiguration vid bygget och använder det inbäddade flödet. Den direkta externa adressen med `clinic=hoa` ovan kan användas som reservadress.

## Kvarstående mindre punkter

- Textkonflikten med Anne i PR #11 runt rad 65 i `behandlingar-och-samtal/page.tsx` återstår. Den filen lämnas orörd i denna rättning.
- Platsvisningens null-hantering saknar i dag en väg från innehållsmodellen och lämnas kvar.
- HTTP-redirectens saknade klinikparameter berör bara byggen utan LIA-konfiguration. Rebeccas knappar går i det läget direkt till rätt extern kliniklänk. Produktionen har LIA-konfiguration.

## Verifiering

- 599 tester godkända i 14 filer.
- Lint, typkontroll och produktionsbygge godkända.
- Språkkontroll godkänd för 53 byggda sidor.
- Tester täcker hela API-request bodies, hjälpfunktionerna och att bokningssidan skickar tjänstens klinik till `BookingFlow`.
- `llms.txt` testas med explicit mockad bokningskonfiguration för både interna och externa länkar. Reservknapp, JSON-LD och betalningstext testas också.
- Innehållstester täcker äldre poster utan klinik, matchning per klinik och slug samt Rebeccas reservvärden.
- Rebeccas första alternativ och primära CTA testas i renderad HTML med både intern och extern bokningskonfiguration.
- Bygget kördes med syntetisk lokal LIA-konfiguration. Rebeccas nya priser och upplägg kontrollerades i byggd HTML, JSON-LD, `llms.txt` och formulärdata. Externa länkar med `clinic=hoa` och UTM-parametrar täcks av testerna. Synkningen kördes aldrig. Inga anrop till LIA eller verkliga bokningar gjordes.
- `git diff --check` godkänd. `next.config.ts` är identisk med `main`.

## Så testar du

Kör ett kommando i taget:

```bash
npm test
npm run lint
npm run typecheck
npm run build
npm run check:copy
```

Med publika LIA-värden i `NEXT_PUBLIC_LIA_SUPABASE_URL` och `NEXT_PUBLIC_LIA_SUPABASE_ANON_KEY` vid bygget ska `/boka/healing-emht` visa det inbäddade flödet. Kontrollera LIA:s bokningslängd 60 minuter, 1 050 kr, betalning på plats och `clinic_slug: "hoa"` i båda API-anropen. HBOT och övriga tjänster utan klinikfält ska sakna klinikparameter.

Utan LIA-konfiguration vid bygget ska genererade externa länkar innehålla rätt klinik. Den automatiska HTTP-redirecten har den dokumenterade begränsningen ovan.

Den separata rättningen av synkningen på LIA-sidan återstår. Integrationstest mot LIA återstår för bokningsbekräftelse utan Stripe, kalenderfil, avbokning och samtidig låsning av rum och terapeut.

## Kända begränsningar
- Redirecten för `/boka/:slug` i `next.config.ts` tappar `clinic=hoa` om sajten byggs utan LIA-konfiguration. Produktionen har konfigurationen och visar bokningen inbäddad, så den påverkas inte. `next.config.ts` lämnas orörd här eftersom Annes PR #11 ändrar filen; rättas i samband med #11.
- `npm run sync:services` är känt trasigt sedan LIA #41 (anon saknar läsrätt på tabellen) och lagas i en separat ändring på LIA-sidan. Synken är återställd till main:s version i denna PR.

## Mindre granskningsfynd (öppna)
- Död null-hantering av `location` i `types.ts`, `seo.ts` och `tjanster/[slug]/page.tsx` (överlappar #11).
- Fältet `booking` i `rebecca.ts` används inte längre.
- Skydd för saknad längd eller pris i `/boka` och `llms.txt` går inte att nå.
- Textkonflikt med #11 på en rad i `behandlingar-och-samtal/page.tsx`.
