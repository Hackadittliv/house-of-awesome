# House of Awesome — design tokens

Samma känsla som lifeisawesome.se. Färger, typsnitt, knappar, kort och avstånd är hämtade från LIA:s live gren (`Hackadittliv/awesome-life-hub`, `codex/professional-onebase-celloxy-v1`, `src/index.css`, `tailwind.config.ts`, `src/components/Hero.tsx` och `src/components/method/StartResa.tsx`). HOA behåller sitt eget namn och ordmärke.

Tokens lever i CSS-variabler (`src/app/globals.css`) och mappas till Tailwind via `@theme inline`.

## Färger

| Token | CSS | Värde | LIA | Används till |
| --- | --- | --- | --- | --- |
| Bakgrund | `--hoa-bg` | `#000000` | `--background` / `--ink` | Sidor, sidhuvud, sidfot |
| Kort | `--hoa-card` | `#050505` | `--card` | Samtyckesbannern |
| Espresso | `--hoa-espresso` | `#251709` | `--espresso` / `--primary-foreground` | Text på guldknappar |
| Sekundär | `--hoa-secondary` | `#321F0C` | `--secondary` | Kort (20 %), band (50 %) |
| Brons | `--hoa-bronze` | `#AC6D2A` | `--bronze` / `--accent` | Etiketter över rubriker, hover på konturknapp |
| Guld | `--hoa-gold` | `#EFC55D` | `--gold` / `--primary` | Knappar, priser, länkar |
| Kräm | `--hoa-ink` | `#FDF5E2` | `--cream` / `--foreground` | Text |
| Ben | `--hoa-bone` | `#FDFDFC` | `--bone` | Reserv |
| Dämpad text | `--hoa-ink-muted` | `#CDBFA2` | `--muted-foreground` | Ingresser, metatext |
| Linje | `--hoa-line` | `#35291D` | `--border` | Ramar |

Kroppen har LIA:s svaga guldglöd (`--hoa-gradient-hero`) bakom en svart `main`, precis som LIA där sektionerna är svarta.

## Typsnitt

| Roll | Typsnitt | Detaljer |
| --- | --- | --- |
| Rubriker h1 till h6 | Plus Jakarta Sans | 700, `letter-spacing: -0.015em`, som LIA |
| Underrubrik (`.subheading`) | Plus Jakarta Sans | 600 kursiv, som LIA |
| Knappar och ordmärke | Plus Jakarta Sans | 500 i knappar, 700 i ordmärket |
| Brödtext | Inter | 400 till 600 |

Typsnitten laddas med `next/font` och serveras från den egna domänen. Webbläsaren gör inga anrop till Google, varken före eller efter samtycke. OG bilderna ritas med Plus Jakarta Sans från `@fontsource/plus-jakarta-sans` vid bygget.

Notera: lifeisawesome.se använder i dag Plus Jakarta Sans även i brödtext. Inter är valt här enligt beställningen. Vill vi ha exakt samma brödtext räcker det att peka `--font-sans` på `--font-jakarta` i `globals.css`.

## Komponenter

* **Primär knapp:** guldpiller, `rounded-full`, höjd 48 px, `px-8`, 14 px, vikt 500, espresso text, hover guld 90 %. Samma som LIA:s hero.
* **Sekundär knapp:** konturpiller, 1 px `--hoa-line`, svart bakgrund, krämtext, hover brons.
* **Liten knapp** (sidhuvud, kort): radie 14 px (`rounded-lia-md`), höjd 44 px.
* **Kort:** `rounded-2xl`, 1 px guld 20 %, sekundär 20 %, `p-5`. Som LIA:s StartResa.
* **Framhävt kort:** 2 px guld och LIA:s guldskugga.
* **Infokort:** brons 40 % ram på brons 10 %, `p-6 md:p-8`. Som LIA:s PriceContext.
* **Etikett över rubrik:** 12 till 14 px, 600, versaler, `tracking-[0.25em]`, brons. Guld på band för kontrastens skull.
* **Sektionsrubrik:** centrerad, `text-3xl md:text-5xl`, ingress `text-lg md:text-xl`.

## Layout

* Sektioner `py-16 md:py-24`, band `py-12 md:py-16`.
* Innehållsbredd `max-w-6xl`, sidhuvudet `max-w-[1400px]` som LIA:s container.
* Sidmarginal `1rem`, `1.5rem`, `2rem`.
* Sidhuvudet är svart och sticky, 96 till 128 px högt, med 1 px linje under.
* Fokus: 2 px guld, 3 px avstånd.

## Bilder

Fas 0 lånar LIA:s guldfärgade uggla och LIA:s bilder (landskapet vid Stora Höga, tryckkammaren, Patrik och Alexandra) i `public/images`. Bilder visas via `next/image` med `rounded-2xl` och 1 px guld 20 %. De byts mot egna HOA bilder när de finns.
