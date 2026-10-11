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
