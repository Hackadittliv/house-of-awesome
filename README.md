# House of Awesome

Longevityklinik och professionell showroom i Stora Höga (Brålandsvägen 29). Syskon till [Life Is Awesome](https://lifeisawesome.se). Namnbyte från The House of Wellness.

Fas 1 är ett skelett: Next.js-sidor, navigation, design tokens och en tom/minimal innehållsmodell. Ingen bokningsmotor, inget CMS-admin, ingen engelsk i18n.

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- Netlify (`netlify.toml`, Node >= 20)
- Innehåll v1: JSON i `content/` (fältnamn redo för senare LIA-extrakt / CMS)
- Svenskt UI

## Setup

```bash
npm install
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000).

```bash
npm run typecheck   # tsc --noEmit
npm run build
npm run lint
```

Lokal Netlify-dev (valfritt): `npx netlify dev`.

## Environment

Inga miljövariabler krävs i fas 1. Hemligheter ska inte hardkodas — när de behövs sätts de i Netlify UI/CLI.

## Netlify

`netlify.toml` sätter:

- `NODE_VERSION = "20"`
- build: `npm run build`
- publish: `.next` (Next-runtime på Netlify)

Koppla GitHub-repot till en Netlify-sajt (Git-deploy). Preview-deploys kommer per branch/PR. Lägg `.netlify` i gitignore (redan gjort).

## Sitemap (SV)

| Route | Sida |
| --- | --- |
| `/` | Hem |
| `/upplevelsen` | Upplevelsen |
| `/sessioner` | Sessioner (CTA till LIA-bokning) |
| `/showroom` | Showroom-index |
| `/showroom/[leverantor]` | Leverantör (stub) |
| `/showroom/[leverantor]/[produkt]` | Produkt (stub) |
| `/medlemskap` | Medlemskap (placeholder) |
| `/besok` | Besök — Brålandsvägen 29, Stora Höga |
| `/faq` | FAQ |
| `/kontakt` | Kontakt |
| `/om` | Om (valfri, inkluderad) |

Nav täcker huvudspåren. Footer täcker alla routes plus LIA-länkar.

## CTA:er

- Bokning: [https://lifeisawesome.se/boka](https://lifeisawesome.se/boka) (relativt: LIA `/boka`)
- B2B / Professional: [https://lifeisawesome.se/professional](https://lifeisawesome.se/professional)

Inga påhittade sessionpriser i SEK. Inget återanvänt HOW-innehåll om osteopati/massage.

## Innehåll

Se `content/README.md` och TypeScript-typer i `src/lib/types.ts`.

Planerade showroom-namn (inga påhittade produkter utöver stubs): OneBase, CellOxy/TUR, Morozko, Vasper, CAROL, ZaZen.

Fas 1 har två leverantörsstubs för routing (`onebase`, `morozko`) och en produktplaceholder under OneBase.

## Design

Tokens och layout: [DESIGN.md](./DESIGN.md). LIA Dark Gold — nästan svart + `#D4AF5F`.

## Utanför fas 1

Full showroom-katalog, riktiga priser, 301-karta från HOW, CMS-admin, medlemslogik, engelsk i18n, Lovable, Supabase.
