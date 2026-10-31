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

Brons är ljusare på svart än tidigare. Guld/brons används inte som ljus text på kräm. Brödtext och länkar ska klara 4,5:1, stor text och betydelsebärande UI-gränser 3:1. Dekorativa kort- och bildramar kan vara svagare. Fokus använder ytans accent; formulärens äldre hoverklasser får ytans kontrastsäkra hoverfärg. Platshållare använder dämpad text utan extra transparens.

## Typsnitt

| Roll | Typsnitt | Detaljer |
| --- | --- | --- |
| h1 och h2 | Plus Jakarta Sans | 700, versaler via CSS, `letter-spacing: -0.02em`, grundradavstånd 1,15 |
| h3 till h6 | Plus Jakarta Sans | 700, normal skiftläge, `letter-spacing: -0.015em` |
| Underrubrik (`.subheading`) | Plus Jakarta Sans | 600 kursiv, normal skiftläge även inuti h1 |
| Knappar och ordmärke | Plus Jakarta Sans | 500 i knappar, 700 i ordmärket |
| Brödtext | Inter | 400 till 600 |

Rubriker får svensk avstavning (`lang="sv"`) och `overflow-wrap: anywhere` som reserv för långa ord på mobil. Befintliga storleksklasser styr den responsiva skalan. Textinnehållet ändras inte för versaliseringen.

Typsnitten laddas med `next/font` och serveras från den egna domänen. Webbläsaren gör inga fontanrop till Google. Tjänsternas OG-bilder använder Plus Jakarta Sans från `@fontsource/plus-jakarta-sans` vid bygget. Övriga sidor delar fasaden (`src/app/opengraph-image.jpg`).

## Komponenter

- **Primär knapp:** svart med krämtext på ljus yta, guld med espresso-text på mörk. Rundad, minst 48 px hög, 14 px text. Hover behåller kontrasten.
- **Sekundär knapp:** kontur med `--hoa-line`, ytans bakgrund och text; hover med `--hoa-hover`.
- **Textlänkar och ghost:** permanent understrykning på båda ytorna, med avstånd och tjockare linje vid hover. Understrykning är standard för länkar, även i löptext, kort och sidfot. Knapplänkar väljer uttryckligen `no-underline`; sidhuvudets ordmärke och meny har egen navigationsstil. Länkfärgen ensam skiljer inte alltid länken från omgivande text.
- **Liten knapp:** `rounded-lia-md`, minst 44 px hög.
- **Kort:** ytans `--hoa-card`, `rounded-2xl`, diskret ram och `p-6`.
- **Framhävt kort:** en mörk ö med komplett mörk palett, guldram och guldskugga. Patrik-kortet ligger svart på kräm med guldknapp, som i skissen.
- **Etikett:** 12 till 14 px, 600, versaler och brett teckenavstånd; mörk accent på kräm, ljus brons/guld på svart.
- **Prosa, listor och formulär:** ärver ytans text-, accent-, kort- och linjetokens. Även presentkortets återanvända bokningsfält fungerar på kräm.
- **Samtyckesbanner:** ogenomskinlig mörk kortyta ger samma kontrast oavsett innehållet bakom.

## Sidhuvud och layout

Sidhuvudet är krämfärgat och sticky, 80 px högt på mindre skärmar och 96 px från `lg`. Desktopmeny och separat bokningsknapp visas från `xl`. Mobilmenyn täcker skärmen med samma ljusa palett. Undermenyer, aktiv länk, hover och fokus följer den ljusa ytan. Ugglan behåller sin guldfärg; hela ordmärket är svart. Huvudknappen är svart med krämtext. Sidfoten återställer alltid svart yta.

Sektioner i v2 använder `py-14 md:py-20`, innehåll `max-w-6xl`, sidhuvud `max-w-[1400px]`. Sidmarginalerna är 1rem, 1,5rem och 2rem. Fokus har 2 px kontur och 3 px avstånd.

Webbläsarens temafärg är samma krämton som sidhuvudet, `#FDF5E2`. Viewport anger `colorScheme: dark`, som `:root`. Sidhuvudet och ljusa band sätter `color-scheme: light` via `.hoa-surface-light`. Textlänkar är understrukna; rundade knapp- och kortlänkar undantas.

Startsidan följer Lucas ordning: mörk hero med fasadbild, Patrik och huset som en sammanhängande krämyta, svart utbud, ljusa personer, svart eventavsnitt och ljusa vanliga frågor.

Avslutningen styrs sajtvidt av sista innehållssektionen, utan en lista över sidnamn. Efter ett ljust band blir SharedBottom:s CTA svart, följt av ljust nyhetsbrev och svart sidfot. Efter mörkt innehåll är CTA och nyhetsbrev en sammanhängande ljus avslutning före svart sidfot. Intilliggande befintliga band, exempelvis story och team på `/om`, utgör en sammanhängande ljus yta. Bokningsflödets befintliga undantag från SharedBottom behålls.

Avslutningsregeln räknar sista direkta barnet i `main` som inte är ett `script`. JSON-LD efter tjänsteinnehållet påverkar därmed inte CTA-ytan. Både `.hoa-surface-light` och det äldre tjänstebandet `section.bg-hoa-secondary/50` används och omfattas av regeln.

## Bilder

Alla bilder och bildkomponenternas källor, beskärningar och storlekar behålls. LIA:s guldfärgade uggla och HOA:s bilder av Lucas Eliasson ligger i `public/images`. Porträtt, Celloxy, tryckkammaren och rödljuset används som tidigare.

Fasaden finns i `public/images/house-of-awesome-fasad-{800,1440,2400}.webp` och visas i full bredd via `src/components/FacadeImage.tsx` med samma srcset. Bilden i 1200 × 630 är OG-bild för sajten utom tjänsterna.
