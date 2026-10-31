# House of Awesome — design tokens

Lucas Eliassons skiss och mejlet ”Webdesign förslag”, 30 okt 2026, styr känslan: varma krämytor, svart text, svarta avsnitt och guld som accent. HOA behåller sitt eget namn, ordmärke och huset i bild. Krämtonen är LIA:s tidigare dokumenterade `--cream`, `#FDF5E2`.

Tokens finns i `src/app/globals.css` och mappas till Tailwind via `@theme inline`. Färger följer **ytan**, även i komponenter som används på flera sidor. Inga sidvisa textfärgsbyten behövs.

## Färger

| Roll | Token | Mörk yta | Ljus yta |
| --- | --- | --- | --- |
| Bakgrund | `--hoa-bg` | `#000000` | `--hoa-light`: `#FDF5E2` |
| Text | `--hoa-ink` | `#FDF5E2` | `--hoa-light-ink`: `#000000` |
| Dämpad text | `--hoa-ink-muted` | `#CDBFA2` | `--hoa-light-muted`: `#514637` |
| Kort och formulärfält | `--hoa-card` | `#050505` | `--hoa-light-card`: `#FFFAF0` |
| Kontur och fältgräns | `--hoa-line` | `#8A795F` | `--hoa-light-line`: `#82725D` |
| Länk-/fokusaccent | `--hoa-accent` | `#EFC55D` | `--hoa-light-accent`: `#70501F` |
| Etikett/brons | `--hoa-bronze` | `#C99A58` | `#70501F` |
| Primär knapp, äldre guldlänkar | `--hoa-gold` | `#EFC55D` | `#000000` |
| Text på primär knapp | `--hoa-espresso` | `#251709` | `#FDF5E2` |
| Sekundärknapp, hover | `--hoa-hover` | `#35291D` | `#E5D6B8` |
| Äldre tonade kort | `--hoa-secondary` | `#321F0C` | `#CDBFA2` |
| Ordmärkets accent | `--hoa-wordmark-accent` | `#EFC55D` | `#000000` |

De fasta `--hoa-light*`-värdena har egna Tailwind-tokens. `--hoa-cream` behåller alltid sin färg. De äldre namnen `gold` och `espresso` är ytanpassade för att befintliga formulär och knappar ska få ett fungerande färgpar utan ändringar i bokningsfiler.

`.hoa-surface-light` sätter hela den ljusa paletten. `.hoa-surface-dark` återställer hela den mörka paletten, även inuti ett ljust band. `Section band` använder den ljusa ytan. Äldre fristående `section.bg-hoa-secondary/50` behandlas som samma band; kort, avatarer och hoverklasser berörs inte av sektionsregeln.

Brons är ljusare på svart än tidigare. Guld/brons används inte som ljus text på kräm; guld förekommer bara där AA klaras, det vill säga på svart (cirka 12:1) och som knappfyllning på svart. Brödtext och länkar ska klara 4,5:1, stor text och betydelsebärande UI-gränser 3:1. Dekorativa kort- och bildramar kan vara svagare. Fokus använder ytans accent; formulärens äldre hoverklasser får ytans kontrastsäkra hoverfärg. Platshållare använder dämpad text utan extra transparens.

## Typsnitt

| Roll | Typsnitt | Detaljer |
| --- | --- | --- |
| h1 och h2 | Plus Jakarta Sans | 700, versaler via CSS, `letter-spacing: -0.02em`, grundradavstånd 1,15; storlek `hoa-h1`, `hoa-h2` och `hoa-h2-prose` |
| h3 till h6 | Plus Jakarta Sans | 700, normal skiftläge, `letter-spacing: -0.015em` |
| Underrubrik (`.subheading`) | Plus Jakarta Sans | 600 kursiv, normal skiftläge även inuti h1 |
| Knappar och ordmärke | Plus Jakarta Sans | 500 i knappar, 700 i ordmärket |
| Brödtext | Inter | 400 till 600 |

**Rubriker bryts aldrig inne i ord.** h1 till h6, `summary`, `legend`, knappar, `.font-display` och `.subheading` har `hyphens: manual`, `overflow-wrap: normal`, `word-break: normal` och `text-wrap: balance`. Brödtext har `text-wrap: pretty` och bryter bara ett ord som inte ryms på en egen rad (`overflow-wrap: break-word` på body).

Versalrubrikernas skala: `--hoa-h1-size` är `clamp(1.875rem, 0.9rem + 4.4vw, 3.75rem)` (cirka 30 px vid 360 px, 60 px från cirka 1040 px), `--hoa-h2-size` är `clamp(1.5rem, 0.95rem + 2.6vw, 2.25rem)` och mellanrubriker i löptext (`hoa-h2-prose`) är `clamp(1.25rem, 0.95rem + 1.4vw, 1.875rem)`, så PERSONUPPGIFTSANSVARIG ryms vid 320 px. Hero, Section, PageHeader och tjänstesidans h1 sätter dessutom `--hoa-fit` från titelns längsta ord (uppmätta teckenbredder i `src/lib/heading.ts`) och gör omslaget till container. Då blir storleken `min(skalan, 100cqi / --hoa-fit)`, och ett ord som LONGEVITY-BEHANDLINGAR krymper så att det ryms på en rad. Ord med bindestreck eller snedstreck läggs i `whitespace-nowrap` via `HeadingText`; texten ändras inte och inga U+2011 används. Korttitlar (h3) och FAQ-frågor har normal skiftläge och använder `hoa-fit-text` med sin grundstorlek i `--hoa-size` och `fitStyle(text, false)`; kortet och frågan är containrar. Ett långt ord kan alltså göra en rubrik mindre än skalan, även vid förstorad text, men rubriken klipps aldrig och bryts aldrig. Kontrollerat vid 320 till 1440 px och med webbläsarens textstorlek på 200 %.

Typsnitten laddas med `next/font` och serveras från den egna domänen. Webbläsaren gör inga fontanrop till Google. Tjänsternas OG-bilder använder Plus Jakarta Sans från `@fontsource/plus-jakarta-sans` vid bygget. Övriga sidor delar fasaden (`src/app/opengraph-image.jpg`).

## Komponenter

- **Primär knapp:** svart med krämtext på ljus yta, guld med espresso-text på mörk. Rundad, minst 48 px hög, 14 px text. Hover behåller kontrasten.
- **Sekundär knapp:** kontur med `--hoa-line`, ytans bakgrund och text; hover med `--hoa-hover`.
- **Textlänkar och ghost:** permanent understrykning på båda ytorna, med avstånd och tjockare linje vid hover. Understrykning är standard för länkar, även i löptext, kort och sidfot. Ghost har ytans textfärg: svart på kräm, kräm på svart. Knapplänkar väljer uttryckligen `no-underline`; sidhuvudets ordmärke och meny har egen navigationsstil. Länkfärgen ensam skiljer inte alltid länken från omgivande text. Lägg aldrig `rounded` i klassen på en textlänk, eftersom den då räknas som knapp och tappar understrykningen.
- **Liten knapp:** `rounded-lia-md`, minst 44 px hög. Bokningslistans kortlänkar använder `rounded-lia-lg` (1,25rem).
- **Klickytor:** fristående länkar och knappar är minst 44 × 44 px (`inline-flex min-h-11 min-w-11 items-center`), även brödsmulor, sidfot, mobilmenyns underlänkar och FAQ-frågor (minst 48 px). Bara länkar i löptext är undantagna. En checkbox räknas med sin label, som är minst 44 px hög.
- **Kortregeln:** kort finns bara på kräm. `.hoa-card` (och `cardClass`) följer ytan via tokens: på kräm ett ljust kort (`--hoa-light-card`, ram i `--hoa-light-line` 45 %, radie 1rem, padding 20 px på mobil och 24 px från `md`); på svart inget kort alls, bara innehållet med en tunn linje i `--hoa-line` överst. Svarta sektioner har alltså aldrig kort i kort. En bild i ett kort ligger överst (`.hoa-card-media`), kant i kant på kräm och med rundade hörn på svart, och har aldrig egen ram. Ordningen är bild, rubrik, en rad text och länk.
- **Framhävt kort:** den enda mörka ön, med komplett mörk palett, guldram och guldskugga, padding 20 px på mobil. Ligger bara i ett ljust band, högst ett per grupp: Patrik-kortet på startsidan, det utvalda medlemskapet och Awesome Week.
- **Vanliga frågor:** `FaqList`, en avdelad lista utan kortboxar på kräm, samma på startsidan och `/faq`. Frågorna har normal skiftläge även när de är h2.
- **Hundnotisen:** en liten textrad med 🐾 under fasaden, utan box.
- **Etikett:** 12 till 14 px, 600, versaler och brett teckenavstånd; mörk accent på kräm, ljus brons/guld på svart.
- **Prosa, listor och formulär:** ärver ytans text-, accent-, kort- och linjetokens. Även presentkortets återanvända bokningsfält fungerar på kräm.
- **Samtyckesbanner:** ogenomskinlig mörk kortyta ger samma kontrast oavsett innehållet bakom.

## Sidhuvud och layout

Sidhuvudet är krämfärgat och sticky, 80 px högt på mindre skärmar och 96 px från `lg`. Desktopmeny och separat bokningsknapp visas från `xl`. Mobilmenyn täcker skärmen med samma ljusa palett. Undermenyer, aktiv länk, hover och fokus följer den ljusa ytan. Ugglan behåller sin guldfärg; hela ordmärket är svart. Huvudknappen är svart med krämtext. Sidfoten återställer alltid svart yta.

Sektioner i v2 använder `py-14 md:py-20`, även sidorna som byggs med `Container`. Innehåll `max-w-6xl`, sidhuvud `max-w-[1400px]`. Sidmarginalerna är 1rem, 1,5rem och 2rem. Fokus har 2 px kontur och 3 px avstånd. Sidhuvudets rad är en container med gränser i rem, som därför följer även förstorad text: när raden är smalare än 20rem visar menyknappen bara ikonen (namnet "Meny" finns kvar för skärmläsare), och under 17,5rem visas bara ugglan (länken heter fortfarande "House of Awesome, startsida"). Vid normal text gäller det under 352 respektive 312 px fönsterbredd. Rutnät börjar med `grid-cols-1` (`minmax(0, 1fr)`) och textkolumner i flexrader har `min-w-0`, så att innehåll aldrig gör en kolumn bredare än skärmen.

`/tjanster`, `/besok` och `/faq` har rubriken på svart och innehållet i ett krämband som är mains sista barn. Avslutningen blir då svart CTA före det ljusa nyhetsbrevet. Cookies-översikten är en lista på mobil och en tabell från `md`.

Webbläsarens temafärg är samma krämton som sidhuvudet, `#FDF5E2`. Viewport anger `colorScheme: dark`, som `:root`. Sidhuvudet och ljusa band sätter `color-scheme: light` via `.hoa-surface-light`. Textlänkar är understrukna; rundade knapp- och kortlänkar undantas.

Startsidan följer Lucas ordning: mörk hero med fasadbild, Patrik och huset som en sammanhängande krämyta, svart utbud, ljusa personer, svart eventavsnitt och ljusa vanliga frågor.

Avslutningen styrs sajtvidt av sista innehållssektionen, utan en lista över sidnamn. Efter ett ljust band blir SharedBottom:s CTA svart, följt av ljust nyhetsbrev och svart sidfot. Efter mörkt innehåll är CTA och nyhetsbrev en sammanhängande ljus avslutning före svart sidfot. Intilliggande befintliga band, exempelvis story och team på `/om`, utgör en sammanhängande ljus yta. Bokningsflödets befintliga undantag från SharedBottom behålls.

Avslutningsregeln räknar sista direkta barnet i `main` som inte är ett `script`. JSON-LD efter tjänsteinnehållet påverkar därmed inte CTA-ytan. Både `.hoa-surface-light` och det äldre tjänstebandet `section.bg-hoa-secondary/50` används och omfattas av regeln.

## Bilder

Alla bilder och bildkomponenternas källor, beskärningar och storlekar behålls. Bilder och porträtt har inga egna ramar, bara rundade hörn. LIA:s guldfärgade uggla och HOA:s bilder av Lucas Eliasson ligger i `public/images`. Porträtt, Celloxy, tryckkammaren och rödljuset används som tidigare.

Fasaden finns i `public/images/house-of-awesome-fasad-{800,1440,2400}.webp` och visas i full bredd via `src/components/FacadeImage.tsx` med samma srcset. Bilden i 1200 × 630 är OG-bild för sajten utom tjänsterna.
