# Innehåll

Allt innehåll ligger som JSON här. Typerna finns i `src/lib/types.ts`.

| Fil | Innehåll | Vem ändrar |
| --- | --- | --- |
| `site.json` | Namn, bolag, kontakt, adress, öppettider, länkar till LIA | För hand |
| `services.snapshot.json` | LIA:s publika tjänster: slug, titel, längd, pris, plats | `npm run sync:services` |
| `services.json` | HOA:s texter per tjänst | För hand |
| `memberships.json` | De fyra HOA medlemskapen och deras Stripe pris i LIA | För hand |
| `faq.json` | Vanliga frågor | För hand |
| `longevity.json` | Anne Wevers, blodanalys och hälsostrategi för företag, typ `LongevityPageContent` | För hand |

## Publicering av longevitysidorna

`LONGEVITY_PUBLISHED` i `src/lib/longevity.ts` ska vara `false` tills Christian godkänner publicering. Flaggan styr `/anne-wevers`, `/longevity-blodanalys` och `/halsostrategi-for-foretag`:

- Med `false` saknas länkarna i huvudmeny, sidfot och sitemap. Tillåten förhandsvisning har robotsmetadata `noindex,nofollow,noimageindex`.
- Sidorna tillåts endast om `LONGEVITY_PUBLISHED` är `true`, `CONTEXT` är `deploy-preview` eller `branch-deploy`, `NODE_ENV` är `development`, eller den uttryckliga lokala flaggan `LONGEVITY_PREVIEW=1` är satt.
- Alla andra miljöer spärras, inklusive produktionsbygge utan `CONTEXT`, tom eller okänd kontext och `NODE_ENV=test`. Både sidorna och `generateMetadata()` anropar `notFound()`: HTTP 404 utan sidornas innehåll eller metadata.

`LONGEVITY_PREVIEW=1` får bara sättas för lokal granskning, vid både bygge och `next start`, aldrig i Netlify production. Flaggan är ett uttryckligt undantag och öppnar även ett produktionsbygge. Använd samma `CONTEXT` vid bygge och serverstart; förgenererade sidor ändras inte av att enbart startmiljön ändras. Gör ett rent bygge när kontexten ändras.

Grenen får inte mergas eller deployas till produktion förrän go-live-checklistan nedan är klar, inklusive Annes skriftliga samtycke, juristläsning och Christians OK. 404-spärren är ett extra skydd, inte en ersättning för checklistan.

Longevitytexterna läses från `src/lib/longevity-content.ts`, och menyn skapas på servern. Texterna och de dolda menyposterna ska inte följa med i publika klientpaket.

### Förhandsvisning med lösenord

Christian har beställt lösenordsskydd för förhandsvisningen. Basic Auth via `netlify/edge-functions/preview-password.ts` skyddar både `deploy-preview` och `branch-deploy`. Lösenordet sätts i miljövariabeln `PREVIEW_PASSWORD` för respektive Netlify-kontext. Saknas variabeln nekas alla. Lösenordets värde får aldrig skrivas i repot eller dokumentationen; `.env.example` innehåller bara en tom variabel.

Lokalt körs inte Netlifys edge-funktion. I produktion passerar funktionen trafiken, medan sidornas publiceringsspärr ger 404 så länge flaggan är `false`.

### Beslut om bokningsknappar den 31 oktober 2026

Beslut av Christian 31 okt 2026, genomfört i commit 10c3cce.

Alla CTA:er på longevitysidorna ska gå till befintliga `/boka/forsta-halsosamtal`. Knapptexten **Boka kort samtal med Patrik** följer beslutet. Befintlig bokningshantering och vidarekoppling till Life Is Awesome används.

Efter beslutet togs `kostnadsfri-introduktion` bort: tjänsten, tillhörande SQL, tidigare README-material och PGlite-skript. Det ska inte återinföras.

### Checklista inför publicering

Före publicering ska följande vara klart:

- Annes skriftliga samtycke till bild, namn, meriter och texter.
- Bildrättighet och fotograf för Annes porträtt dokumenterade.
- Vårdjuristläsning genomförd och synpunkter åtgärdade.
- Integritetspolicy och PUB-avtal klara.
- Christians godkännande av publicering.
- Vid godkänd publicering ändras `LONGEVITY_PUBLISHED` till `true` och det låsande testet i `tests/longevity.test.ts` ändras samtidigt. Testet heter "använder samma publiceringsflagga i faktisk meny, sidfot och sitemap" och kräver avsiktligt `false` fram till godkännandet.
- `LONGEVITY_UPDATED` i `src/lib/sitemap.ts` sätts till publiceringsdagen.

Ändringarna slår igenom efter nytt bygge i rätt Netlify-kontext och publicering av webbplatsen.

### Avindexering och faktisk borttagning

Att sätta flaggan till `false` innebär avindexering, dolda menylänkar, frånvaro i sitemap och 404 för de tre sidorna i produktion efter nytt bygge utan preview-undantag. Det raderar inte innehåll eller bildfiler.

Porträttet ligger privat i `src/assets/anne-wevers.webp`. `/portratt/anne-wevers` kontrollerar samma spärr vid varje anrop innan filen läses och svarar med `private, no-store`. Bilden importeras inte statiskt: det skulle skapa en offentlig hashad kopia under `/_next/static`. Avatar använder bildrouten direkt, och Nexts bildoptimerare tillåter inte den adressen. Den gamla adressen `/images/team/anne-wevers.webp` ger 404 även i preview.

Om Anne drar tillbaka sitt samtycke ska sidorna, tillhörande innehåll, porträttet `src/assets/anne-wevers.webp` och bildrouten raderas, och referenser tas bort. Därefter krävs nytt bygge och publicering av webbplatsen. Enbart `false` är inte faktisk borttagning. Eventuella bildkopior i äldre publiceringar och cacher behöver också tas bort.

## services.json

| Fält | Typ | Kommentar |
| --- | --- | --- |
| `slug` | string | Samma slug som i LIA:s bokning för bokningsbara tjänster |
| `kind` | `bookable` \| `inquiry` | `bookable` kräver att slugen finns i snapshoten |
| `category` | `syre` \| `ljus` \| `traning` \| `samtal` \| `halsa` \| `kropp` | Gruppering och relaterade tjänster |
| `name`, `shortName` | string | Rubrik och kort namn för knappar |
| `lead` | string | En mening, används i kort, metabeskrivning och OG bild |
| `body` | string[] | Stycken på tjänstens sida |
| `points` | string[] | Punktlista |
| `durationLabel` | string? | Bara för tjänster utan längd i LIA |
| `image`, `imageAlt` | string? | Bild från `public/images` |
| `healthDeclaration` | boolean? | Kräver hälsodeklaration |

Längd och pris för bokningsbara tjänster kommer alltid från snapshoten, så de stämmer med bokningen.
