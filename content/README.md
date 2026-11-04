# Innehåll

Allt innehåll ligger som JSON här. Typerna finns i `src/lib/types.ts`.

| Fil | Innehåll | Vem ändrar |
| --- | --- | --- |
| `site.json` | Namn, bolag, kontakt, adress, öppettider, länkar till LIA | För hand |
| `services.snapshot.json` | LIA:s publika tjänster: klinik, slug, titel, längd, pris, plats | `npm run sync:services` |
| `services.json` | HOA:s texter per tjänst | För hand |
| `memberships.json` | De fyra HOA medlemskapen och deras Stripe pris i LIA | För hand |
| `faq.json` | Vanliga frågor | För hand |

## services.json

| Fält | Typ | Kommentar |
| --- | --- | --- |
| `slug` | string | Samma slug som i LIA:s bokning för bokningsbara tjänster |
| `kind` | `bookable` \| `inquiry` | `bookable` kräver att slugen finns i snapshoten, med undantaget `healing-emht` nedan |
| `clinic` | string? | Klinik i LIA. Angivet värde skickas som `clinic_slug` till `get-availability` och `create-booking`. Utelämnat fält använder LIA:s standard `lia` |
| `payment` | `on_site`? | Visar att betalningen sker på plats. LIA:s svar styr själva betalningsflödet |
| `category` | `syre` \| `ljus` \| `traning` \| `samtal` \| `halsa` \| `kropp` | Gruppering och relaterade tjänster |
| `name`, `shortName` | string | Rubrik och kort namn för knappar |
| `lead` | string | En mening, används i kort, metabeskrivning och OG bild |
| `body` | string[] | Stycken på tjänstens sida |
| `points` | string[] | Punktlista |
| `durationLabel` | string? | Bara för tjänster utan längd i LIA |
| `image`, `imageAlt` | string? | Bild från `public/images` |
| `healthDeclaration` | boolean? | Kräver hälsodeklaration |

Längd och pris för bokningsbara tjänster kommer från snapshoten, med undantaget nedan.

`healing-emht` är aktiv i LIA:s klinik `hoa` och använder `"clinic": "hoa"` och `"payment": "on_site"`. Direktbokningen gäller healing i 45 minuter på plats för 950 kr, med betalning på plats. Snapshoten från 2026-10-11 saknar tjänsten, så innehållslagret behåller de bekräftade uppgifterna i `src/lib/rebecca.ts` och öppnar det befintliga bokningsflödet. När snapshoten innehåller kombinationen `hoa` och `healing-emht` används dess värden automatiskt.

Synkningen hämtar aktiva publika tjänster från `booking_event_types` via REST, med klinikens slug från relationen `booking_clinics`. Den sparar kliniken som `clinic` och behåller `sort_order` från LIA. Snapshoten matchas på `(clinic ?? "lia", slug)` för fakta, bokningsbarhet och sortering. Äldre poster utan klinik tillhör `lia`. En HOA-post matchas aldrig mot en LIA-post med samma slug. HOA:s tjänsteadresser använder bara slug, som därför är unik i innehållskatalogen. Ett misslyckat REST-anrop avbryter synkningen före skrivning.

Klinikmodellen beslutades 2026-11-02: terapeuter delar rum, bokning låser både rum och terapeut och terapeuter hanteras som data i LIA-admin. HOA skickar tjänst och klinik. Det befintliga `site: "hoa"` anger avsändarsajt och behålls för alla bokningar. Övriga tjänster och Studion behåller sina request bodies. Betalningssteget styrs som tidigare av LIA:s svar.

Den primära länken går till `/boka/healing-emht`. Distans och 75 minuter länkar till `/boka/forfragan/rebecca`, som behåller Rebeccas mottagarrutt och tre upplägg. Ett 404/409-svar från LIA visar det befintliga generella förfrågningsformuläret i bokningsflödet, med husets mottagarrutt. Det leder alltså aldrig automatiskt till Rebeccas reservsida.

Det inbäddade flödet kräver HOA:s publika bokningskonfiguration vid bygget. Reservlänkar, JSON-LD och `llms.txt` lägger till `clinic` på externa adresser när tjänsten har fältet, med befintliga UTM-parametrar kvar. Tjänster utan klinikfält behåller tidigare adresser. Den externa adressen för Rebecca är `https://lifeisawesome.se/boka/healing-emht?clinic=hoa`.

Den automatiska HTTP-redirecten för `/boka/:slug` i `next.config.ts` är oförändrad och saknar klinikparameter när LIA-konfiguration saknas vid bygget. Produktionen har LIA-konfiguration vid bygget och använder det inbäddade flödet. `next.config.ts` lämnas utanför PR #13 för att undvika överlapp med Anne i PR #11.
