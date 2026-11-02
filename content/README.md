# Innehåll

Allt innehåll ligger som JSON här. Typerna finns i `src/lib/types.ts`.

| Fil | Innehåll | Vem ändrar |
| --- | --- | --- |
| `site.json` | Namn, bolag, kontakt, adress, öppettider, länkar till LIA | För hand |
| `services.snapshot.json` | LIA:s publika tjänster: slug, titel, längd, pris, plats | `npm run sync:services` |
| `services.json` | HOA:s texter per tjänst | För hand |
| `memberships.json` | De fyra HOA medlemskapen och deras Stripe pris i LIA | För hand |
| `faq.json` | Vanliga frågor | För hand |

## services.json

| Fält | Typ | Kommentar |
| --- | --- | --- |
| `slug` | string | Samma slug som i LIA:s bokning för bokningsbara tjänster |
| `kind` | `bookable` \| `inquiry` | `bookable` kräver att slugen finns i snapshoten, med undantaget `healing-emht` nedan |
| `category` | `syre` \| `ljus` \| `traning` \| `samtal` \| `halsa` \| `kropp` | Gruppering och relaterade tjänster |
| `name`, `shortName` | string | Rubrik och kort namn för knappar |
| `lead` | string | En mening, används i kort, metabeskrivning och OG bild |
| `body` | string[] | Stycken på tjänstens sida |
| `points` | string[] | Punktlista |
| `durationLabel` | string? | Bara för tjänster utan längd i LIA |
| `image`, `imageAlt` | string? | Bild från `public/images` |
| `healthDeclaration` | boolean? | Kräver hälsodeklaration |

Längd och pris för bokningsbara tjänster kommer från snapshoten, med undantaget nedan.

`healing-emht` är ett avgränsat undantag: tjänsten öppnar HOA:s befintliga bokningsflöde även innan nästa snapshot innehåller slugen. Direktbokningen gäller healing i 45 minuter på plats för 950 kr. Fram till nästa snapshot används de bekräftade uppgifterna i `src/lib/rebecca.ts`. När snapshoten innehåller slugen används dess värden automatiskt. Snapshoten uppdateras enbart från LIA.

Den primära länken går till `/boka/healing-emht`. Distans och 75 minuter länkar till `/boka/forfragan/rebecca`, som behåller Rebeccas mottagarrutt och tre upplägg. Ett 404/409-svar från LIA visar det befintliga generella förfrågningsformuläret i bokningsflödet, med husets mottagarrutt. Det leder alltså aldrig automatiskt till Rebeccas reservsida.
