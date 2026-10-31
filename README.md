# House of Awesome

Sajten för [houseofawesome.se](https://houseofawesome.se): longevity, träning och återhämtning på Brålandsvägen 29 i Stora Höga. Drivs av Life Is Awesome AB, syskon till [lifeisawesome.se](https://lifeisawesome.se).

Det här är **Fas 0** enligt [docs/PLAN-hoa-sajt.md](./docs/PLAN-hoa-sajt.md) (planen ligger i en separat PR): en ren innehållssajt. All bokning och alla köp sker hos Life Is Awesome. Varje bokningsknapp länkar till rätt tjänst på `lifeisawesome.se/boka/<slug>` med `utm_source=houseofawesome`.

## Stack

* Next.js 16 (App Router, alla sidor förrenderas statiskt), React 19, TypeScript, Tailwind 4
* Netlify (`netlify.toml`, Node 20)
* Innehåll som JSON i `content/`
* Vitest för tester

## Kom igång

```bash
npm install
npm run dev          # http://localhost:3000
npm run lint
npm run typecheck
npm test             # Vitest
npm run build
npm run check:copy   # språkkontroll av de byggda sidorna, kör efter build
```

## Sidor

| Sökväg | Innehåll |
| --- | --- |
| `/` | Startsida |
| `/tjanster` | Alla tjänster, bokningsbara och efter förfrågan |
| `/tjanster/[slug]` | En sida per tjänst, med längd, pris och bokningsknapp |
| `/medlemskap` | De fyra HOA medlemskapen, länkar till `lifeisawesome.se/medlem?plan=...` |
| `/om` | Om huset, platsen i Stora Höga och showroom för företag |
| `/besok` | Adress, kontakt, öppettider och bokning |
| `/faq` | Vanliga frågor (med FAQPage JSON-LD) |
| `/integritetspolicy`, `/cookies` | Life Is Awesome AB som personuppgiftsansvarig |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt` | Genereras från innehållet |

Gamla skelettsidor (`/sessioner`, `/upplevelsen`, `/kontakt`, `/showroom/...`) skickas vidare med 301. `/boka` och `/boka/<slug>` skickas till LIA:s bokning.

## Tjänsterna och var de kommer ifrån

* `content/services.snapshot.json` är en ögonblicksbild av LIA:s publika `booking_event_types` (slug, titel, längd, pris, plats). Den uppdateras med `npm run sync:services`, se kommentaren i `scripts/sync-services.mjs`. Bygget hämtar ingenting över nätet.
* `content/services.json` innehåller HOA:s egna texter per tjänst, skrivna utan hälsopåståenden. LIA:s beskrivningar i databasen används inte eftersom flera av dem innehåller sådana påståenden.
* Ett test säkerställer att varje publik tjänst i LIA har en HOA text. Lägger LIA till en ny tjänst och snapshoten uppdateras, faller testet tills texten finns.
* Tjänster utan egen kalender i LIA (Awesome Protocol, InBody, vitamindropp, blodprov, funktionsmedicin) leder till det kostnadsfria korta samtalet och till mejl.

## Samtycke och analys

Inget skript från tredje part laddas innan besökaren har valt. Bannern sparar valet i `localStorage` (`hoa_consent_v1`). Analys och marknadsföring aktiveras genom miljövariabler i Netlify, och laddas då först efter samtycke:

| Variabel | Effekt |
| --- | --- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 (format `G-XXXX`), kategori analys |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta pixel (bara siffror), kategori marknadsföring |
| `NEXT_PUBLIC_SITE_URL` | Bas för kanoniska adresser, satt till `https://houseofawesome.se` i `netlify.toml` |

Utan de två första används inga verktyg alls, och cookiesidan och integritetspolicyn säger det.

## Språkregler

Svenska, enkelt språk, inga tankstreck i löptext, inte orden "man" eller "hen" och inga hälsopåståenden. Reglerna finns i `scripts/copy-rules.mjs` och körs både i testerna och av `npm run check:copy`.

## Design

Tokens och layout i [DESIGN.md](./DESIGN.md): samma värden som lifeisawesome.se, alltså svart, kräm `#FDF5E2` och guld `#EFC55D`, Plus Jakarta Sans i rubriker och knappar och Inter i brödtext. Typsnitten serveras från den egna domänen.

## Bilder

Tills HOA har egna bilder används LIA:s logga och bilder (`public/images`, `src/app/icon.png`, `src/assets` för tjänsternas OG bilder). Fasaden är husets egen bild och används på startsidan och som OG bild för övriga sidor. Se PR:en för var egna HOA bilder skulle göra mest nytta.
