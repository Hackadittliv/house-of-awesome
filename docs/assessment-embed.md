# Behovsanalys från LIA på HOA

## Avsikt

Christian valde den 8 november 2026 att behovsanalyserna ska visas inbäddade på HOA och underhållas i LIA. Besökaren ska kunna fylla i dem utan att lämna HOA. Frågorna och svaren ska ha en gemensam huvudkälla.

HOA:s `/behovsanalys` har två val:

* Min hälsa och återhämtning: LIA:s befintliga Longevity Guide.
* Utrustning för hem eller verksamhet: LIA:s befintliga Professionalanalys, som även stöder utrustning för hemmabruk.

Företagets hälsostrategi för medarbetare och förfrågningar om event eller lokaler behåller sina befintliga kontaktvägar.

## Gemensam källa

LIA tillhandahåller `/embed/behovsanalys/privat` och `/embed/behovsanalys/utrustning`. De återanvänder originalformulären utan sidhuvud, sidfot eller marknadsföring. HOA innehåller varken en kopia av frågorna eller en separat databas. Förfrågningarna märks med HOA i LIA:s befintliga underlag.

HOA skickar bara `parentOrigin`, en tillfällig `channel` och det fasta källnamnet `houseofawesome` i iframeadressen. Inga svar eller kontaktuppgifter skickas till HOA via URL eller meddelanden. LIA:s formulär sköter sina befintliga inskickningar.

## Gränsen mellan webbplatserna

Produktion använder alltid `https://lifeisawesome.se`. `NEXT_PUBLIC_LIA_ASSESSMENT_ORIGIN` tillåter endast en lokal HTTPorigin i development. Samma resolver används av iframe och CSP.

Meddelanden har formen `{type: "lia:assessment", version: 1, event, flow, channel, height?}`. Tillåtna event är `ready`, `resize`, `step` och `complete`; `flow` är `personal` eller `equipment`. Värden behöver matcha exakt origin, aktuellt iframefönster och den aktuella kanalen. Höjd behöver vara ett ändligt tal mellan 160 och 6000 px. Värden läser aldrig formulärsvaren.

Laddningen bekräftas genom protokollet, inte genom `iframe.onload`. Ett SPAfelsvar kan annars ge HTTP 200 utan formulär. Efter 15 sekunder utan svar visas en reservlänk och möjlighet att försöka igen med ny kanal. Byte av inriktning varnar innan ett annat formulär ersätter det gamla.

## Spårarfria dokument

Hela `/behovsanalys` är undantaget från GA och Meta. Ingångarna använder vanlig dokumentnavigation i stället för Nexts klientnavigation. Skriptet i sidans head registrerar dokumentets första sökväg. Komponenten monterar inget formulär och laddar om sidan om dokumentet ursprungligen startade utanför behovsanalysen eller om spårare redan har laddats. LIA:s embedvyer behöver också vara undantagna före uppstart och i den löpande spårningen.

## Lokal kontroll

Starta LIA skrivskyddat på port 5173:

```sh
VITE_PREVIEW_READ_ONLY=true npm run dev -- --host localhost --port 5173 --strictPort
```

Starta HOA med:

```sh
NEXT_PUBLIC_LIA_ASSESSMENT_ORIGIN=http://localhost:5173 npm run dev -- --port 3000
```

Öppna `http://localhost:3000/behovsanalys`. Båda projekten ska köras i development för lokal origin. Befintliga skydd mot riktiga inskickningar i förhandsversioner ska behållas. Automatiserade tester använder simulerade formulärsvar och får inte skapa riktiga leads eller skicka mejl.

## Publiceringsordning

Publicera först LIA:s två embedvyer på den gemensamma domänen. Kontrollera att deras svarshuvuden tillåter HOA som ramförälder och att protokollet bekräftar laddningen. Publicera därefter HOA. Varken LIA:s vanliga formulärsidor eller deras fullständiga navigering ska bäddas in som ersättning för embedvyerna.

Inför publicering återstår visuell kontroll i riktig webbläsare på mobil och desktop, kontroll efter tidigare accepterat cookiesamtycke och kontroll att sparat underlag kan följas upp i LIA. Ingen riktig kundinformation behövs för dessa kontroller.
