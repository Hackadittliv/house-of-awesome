# Kostnadsfri introduktion med Patrik

Christian applicerar `20261031_kostnadsfri_introduktion_patrik.sql` **manuellt mot
LIA:s Supabase vid go-live, efter godkännande**. Filen är inget automatiskt
migrationssteg: inget HOA-bygge eller deploy kör den. Testskriptet kör den bara
i lokal PGlite. Inget har applicerats mot LIA i detta byggsteg.

## Publiceringsvillkor

Branchen ska inte mergas eller publiceras och sidorna inte indexeras innan
Christian bekräftat Annes godkännande av bild, namn, meriter och texter samt
att integritetspolicy och avtal täcker provsvar, Whole Labs, portal och wearables.
Meny/sitemap är förberedda för godkänd publicering. Eventuell förhandsvisning
måste vara privat och oindexerad; detta arbete publicerar ingen sådan.

Öppna frågor från `.herd-ref/JURIDIK-NOTER.md` kvarstår: labb/ackreditering,
medicinsk partner, avvikande värden, samtycke, anonymisering och faktaunderlag.
Ingen granskad longevitytext eller integritetspolicy skrivs om här.

## SQL och resurser

En transaktion upsertar endast `kostnadsfri-introduktion` med `ON CONFLICT (slug)
DO UPDATE`. Befintligt id behålls; andra tjänster lämnas orörda.

| Inställning | Värde |
| --- | --- |
| Titel sv/en | Kostnadsfri introduktion med Patrik / Free introduction with Patrik |
| Längd / tidsintervall | 10 / 10 minuter |
| Veckodagar / tider | `{1,2,3,4,5}`, mån–fre, `09:00:00`–`16:00:00`, Stockholmstid i LIA |
| Buffert före / efter | 0 / 10 minuter |
| Framförhållning / horisont | 24 timmar / 21 dagar |
| Plats / pris | `meet`, `Gratis` / `Free`, `requires_payment=false`, `price_id=NULL` |
| Synlighet | `is_active=true`, `is_public=true`, `inquiry_only=false` |
| Telefon / sortering | `phone_required=false`, `sort_order=2` |

Ingen separat utövar-FK finns i referensschemat. Patrik namnges i titel och
beskrivning. Befintlig `booking_resource_ranges` reserverar endast
**personresursen `patrik`**, inklusive bufferten, för denna slug (`other`).
Inga rum, Studion, HBOT eller Celloxy reserveras. Resursfunktionen ändras inte.
`google_calendar_id` utelämnas: schemadefault används vid insert och befintlig
koppling bevaras vid update. Inga Google-/Stripe-anrop görs. Globala spärrar,
öppningsdatum, tidsundantag och schema ändras inte.

`forsta-halsosamtal` överlappar erbjudandet: tio minuter, gratis, Meet, Patrik.
Den befintliga tjänsten och dess länkar lämnas orörda.

## Före och efter aktivering

Snapshot-formatet saknar publiceringsstatus; ingen påhittad livepost läggs till.
HOA-texten har tills vidare `kind: "inquiry"` och `durationLabel: "10 minuter"`.
`/boka/kostnadsfri-introduktion` visar `BookingUnavailable` med kontaktlänk,
även med LIA-konfiguration. Inga bokningsanrop eller förfrågningsformulär visas.
Slugen undantas ensam från LIA-omdirigeringen och är dold i tjänstelistor,
tjänstesidornas statiska parametrar och erbjudandenas sitemap/JsonLd.

Vid separat, godkänd go-live:

1. Christian verifierar aktuellt LIA-schema, kalenderkoppling, att
   `admin_config.booking_mode` är `calendar` samt `bookings_open_from`.
2. Christian applicerar SQL-filen manuellt och läser tillbaka raden.
3. Uppdatera snapshoten via befintliga `npm run sync:services` i en miljö med
   godkänd LIA-åtkomst. Sätt introduktionens `kind` till `bookable` i samma ändring.
4. Uppdatera testerna för det publicerade innehållet och behåll reservlägestester.
   Verifiera bokning, tider, buffert och Meet före publicering. LIA-status 404/409
   och nätverksfel för introduktionen ger fortsatt `BookingUnavailable`.

Inga av dessa fjärråtgärder ingår i det lokala byggsteget.

## Lokalt SQL-test

Från reporoten, med referenserna i `.herd-ref/lia-migrations/`:

```sh
npm install --prefix work/pglite --cache work/npm-cache @electric-sql/pglite@0.5.13
/home/box/bin/heavy-job --wait hoa-anne-sql -- node scripts/check-golive-sql.mjs
```

Projektberoenden/låsfil ändras inte; `work/` är lokalt gitignorerat. Databasen
skapas i minnet och stängs i `finally`. Docker/Supabase startas aldrig.
Skriptet listar och kör **15 hela, oförändrade referensmigrationer** för
bokningsschemat och beroenden, inklusive riktig resurs-trigger, `btree_gist`
och `EXCLUDE`. Endast Supabases plattform får lokala ersättningar: roller,
minimala auth/storage-tabeller och `auth.uid/role/jwt`. Det gamla kortsamtalet
seedas som uttrycklig fixture från HOA-snapshoten eftersom referensen saknar seed.

**Nio kontroller** täcker migrationer, alla tjänstefält, kalenderdefault,
omkörning utan dublett, korrigering av avvikande data, oförändrade andra tjänster,
faktisk reservation enbart för Patrik, blockerad överlappning och nästa bokning
efter bufferten. Raden läses tillbaka och skrivs ut.

Detta verifierar berörda bokningsdelar, inte hela LIA:s migrationshistorik,
Auth/RLS som riktiga användare, cron, e-post, Google/Meet, Stripe eller Edge
Functions. `lia-get-availability.ts` visar fältläsningen, men importerade
`_shared/booking.ts` saknas. Slotgenerering, sommartid och globala spärrar
behöver verifieras i LIA vid go-live.
