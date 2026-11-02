# Plan: egen sajt för House of Awesome med LIA:s bokning

Status: förslag, inget är byggt. Ingen ändring har gjorts i LIA:s repo, i produktionsdatabasen, i Netlify eller i DNS.

Granskat underlag:

* Det här repot (`Hackadittliv/house-of-awesome`), gren `main`.
* LIA:s live gren `codex/professional-onebase-celloxy-v1` i `Hackadittliv/awesome-life-hub` (commit `0670cdd`). Det är den grenen Lovable publicerar, inte `main`.

I texten står `<hoa-domän>` för HOA:s domän. Domänen är nu bekräftad som `houseofawesome.se`.

## Beslut från ägaren (11 oktober 2026)

* **Bolag:** Life Is Awesome AB driver HOA. Samma personuppgiftsansvarig och samma Stripe konto. Inget avtal om gemensamt ansvar behövs.
* **Tjänster:** alla tjänster visas på båda sajterna. I fas 1 betyder det `sites = '{lia,hoa}'` på alla tjänster.
* **Domän:** `houseofawesome.se`, med DNS hos Loopia.
* **Bilder och logga:** LIA:s logga och bilder används tills HOA har egna.
* **Fas 0** byggs i en egen PR ([#4](https://github.com/Hackadittliv/house-of-awesome/pull/4)).

Öppna frågor 1 till 3 och 8 i avsnitt 10 är därmed besvarade. Övriga står kvar.

---

## 1. Kort sammanfattning

**Rekommendation: Alternativ A.** HOA får en egen Next.js sajt på sin domän, med ett eget bokningsgränssnitt i HOA:s design. Gränssnittet anropar LIA:s befintliga edge functions i Supabase direkt från webbläsaren. Det blir en backend, en kalender och en uppsättning resurser.

LIA behöver bara små tillägg:

* ett fält `site` som talar om vilken sajt en bokning kom från;
* en liten varumärkesmodul så att mejl, kalenderfiler och Stripe visar HOA när bokningen gjorts på HOA.

Arbetet sker i faser. Fas 0 kräver ingen ändring i LIA alls: HOA:s innehållssajt går live på domänen och skickar besökaren vidare till LIA:s bokning. Därefter byggs bokningen in steg för steg.

---

## 2. Nuläge i det här repot

**Teknik**

* Next.js 16.3.5 med App Router, React 19, Tailwind 4 och TypeScript.
* Netlify: `netlify.toml` bygger med `npm run build`, publicerar `.next` och kör Node 20. Next.js körs via Netlifys adapter.
* Det finns redan en Netlify sajt kopplad till repot. Domänen är inte kopplad ännu enligt det vi ser i repot.
* Designen följer LIA:s "Dark Gold" (`DESIGN.md`): bakgrund `#0B0B0B`, guld `#D4AF5F`, typsnitten Geist och Cormorant Garamond.

**Sidor som finns (fas 1 skelett, PR #1)**

| Sökväg | Innehåll |
|---|---|
| `/` | Startsida |
| `/upplevelsen` | Upplevelsen på plats |
| `/sessioner` | Sessioner (läser `content/sessions.json`, som är tom) |
| `/showroom`, `/showroom/[leverantor]`, `/showroom/[leverantor]/[produkt]` | Showroom med leverantörer och produkter |
| `/medlemskap` | Platshållare |
| `/besok` | Hitta hit |
| `/faq`, `/kontakt`, `/om` | Vanliga frågor, kontakt, om oss |

**Innehåll** ligger som JSON i `content/`:

* `site.json` innehåller namn, tidigare namn ("The House of Wellness"), adressen Brålandsvägen 29 i Stora Höga, öppettider (ej klara), knappar och planerade partners: OneBase, CellOxy/TUR, Morozko, Vasper, CAROL och ZaZen.
* `sessions.json` är tom.
* `products.json` har en platshållare.
* `suppliers.json` har OneBase och Morozko.
* `faq.json` har frågor och svar.

**Bokning i dag:** knapparna pekar till `lifeisawesome.se/boka` och B2B till `lifeisawesome.se/professional`. Inga priser är påhittade.

**Saknas:**

* mappen `public/`;
* sitemap, `robots.txt`, `llms.txt` och JSON-LD;
* cookie och samtyckesbanner;
* analys;
* bokning;
* inloggning.

---

## 3. HOA:s innehåll på LIA i dag

### 3.1 Sidor

| Sökväg på lifeisawesome.se | Vad | Kommentar |
|---|---|---|
| `/longevity-clinic` | Huvudsidan för House of Awesome | Kanonisk till lifeisawesome.se. JSON-LD `FAQPage` och `LocalBusiness` med namnet `House of Awesome - Life Is Awesome`. Bäddar in bokning av `forsta-halsosamtal` och ett leadformulär. |
| `/en/longevity-clinic` | Engelsk version | Samma innehåll |
| `/medlem` | HOA:s medlemskap | `noindex`, kräver inloggning för vissa delar |
| `/venue` | Lokalen | |
| `/boka`, `/boka/:slug`, `/boka/tack` | Bokning | Gemensam för LIA och HOA |
| `/halsodeklaration` | Hälsodeklaration (känsliga uppgifter) | Spåras aldrig |
| `/klippkort/tack`, `/mina-klippkort`, `/presentkort` | Klippkort och presentkort | |
| `/integritetspolicy`, `/cookies`, `/villkor`, `/angra-avtal` | Juridiska sidor | Life Is Awesome AB står som ansvarig |
| `/house-of-wellness`, `/longevity-center` | Gamla namn | 301 till `/borja` i dag |

### 3.2 Texter och tjänster

Texterna finns i `src/config/longevityClinicLanding.ts` (svenska och engelska) och `src/components/longevity-clinic-landing/HouseOfAwesome.tsx`. Källan är Produktkatalog v2.

* **Hero, berättelse och målgrupp.** Metatiteln är `House of Awesome - Longevity i Stora Höga | Life Is Awesome`.
* **Höjdpunkter:** tillgång dygnet runt, "alltid i framkant", 10 % rabatt via QR.
* **Gym:** Zazen Scalar, InBody och en medlemsportal.
* **The Awesome Protocol:** Kraft, Syre och Ljus på 60 minuter.
* **Tjänster:**

| Tjänst | Slug i bokningen | Typ |
|---|---|---|
| Rödljus | `redlight-20` | Bokningsbar |
| EWOT | `ewot-15` | Bokningsbar |
| HBOT, tryckkammare | `hbot-60`, `hbot-80` | Bokningsbar |
| Celloxy IHHT | `ihht-50` | Bokningsbar |
| Longevity coach | `coaching-45`, `coaching-60` | Bokningsbar |
| Samtal och stöd | `forsta-halsosamtal` | Bokningsbar |
| Awesome Protocol, InBody, vitamindropp, blodprov, funktionsmedicin, manuella behandlingar | inga | Förfrågan |
| Longevity butik | inga | Showroom |

* **Medlemskap** (finns redan i LIA:s Stripe och kod, alla med 12 månaders bindning):

| Plan | Pris per månad |
|---|---|
| `hoa_gym_monthly` | 599 kr |
| `hoa_longevity_monthly` | 899 kr |
| `hoa_longevity_plus_monthly` | 1 495 kr |
| `hoa_longevity_max_monthly` | 2 495 kr, 20 platser |

* **Moms:** gymdelen har 6 % moms och behandlingsdelen 25 %. Checkout lägger till en separat gymrad (`hoa_gym_component_monthly`) och samlar in personnummer för friskvårdskvitto.
* **Aktiva medlemmar** (Stripe pris som börjar på `hoa_`) får se bokningstider dygnet runt. Undantaget är tjänster som kräver personal: `forsta-halsosamtal`, `coaching-45` och `coaching-60`.
* **Ansvarsfriskrivningar:** `WELLNESS_DISCLAIMER` och säkra beskrivningar per tjänst i `src/lib/bookingContent.ts`.
* **FAQ:n är delvis inaktuell.** Den skriver "I The House of Wellness i Stora Höga".

### 3.3 SEO på LIA

* `sitemap.xml` har 245 adresser, bland annat `/longevity-clinic`, `/en/longevity-clinic`, `/venue` och `/boka`.
* `robots.txt` släpper in alla, även AI botar.
* `llms.txt` anger Life Is Awesome AB, org.nr 559389-8363, säte Krossekärr 517, 473 94 Henån och telefon +46 73 349 08 36. "Klinik" länkar till `/longevity-clinic`.
* Telefonen i klinikkonfigurationen är +46733490836 och mejladressen info@lifeisawesome.se.

### 3.4 Bilder

Bilderna ligger i LIA:s repo och laddas från LIA:s domän. De behöver kopieras in i HOA:s `public/` eller ersättas av nya bilder. Vilka bilder HOA får använda är en öppen fråga (se avsnitt 9).

---

## 4. LIA:s boknings API

### 4.1 Hur det hänger ihop

* **Supabase projekt:** `ndtvsngguoejqgijwzye`.
* **Edge functions (Deno).** De publika har `verify_jwt = false` men kräver projektets publika nyckel i headern, precis som `supabase-js` skickar den.
* **CORS** är `Access-Control-Allow-Origin: *` i dag. Det betyder att HOA:s domän redan kan anropa funktionerna från webbläsaren.
* **Tjänsterna** ligger i tabellen `booking_event_types`. Kolumner:
  * slug, titel och beskrivning på sv och en;
  * längd, pris (`price_id`, `price_label_*`), `requires_payment`;
  * tillåtna veckodagar och tider, buffertar, minsta framförhållning, max dagar framåt;
  * `location_type`, `inquiry_only`, `is_public`, `is_active`, `sort_order`, `google_calendar_id`.
* **`/boka` läser `booking_event_types` direkt** med den publika nyckeln (aktiva och publika, sorterade på `sort_order`).
* **Bokningar** ligger i `bookings`, med status, betalstatus, hålltid, Stripe session, `cancel_token`, lead, klippkort och UTM. **Det finns ingen kolumn för sajt eller varumärke.**

### 4.2 Publika anrop

| Funktion | Indata | Svar |
|---|---|---|
| `get-availability` | `{event_type_slug, from_date, to_date}`, högst 31 dagar | `{event_type:{slug, title_sv/en, description_sv/en, duration_minutes, price_label_sv/en, location_type, requires_payment, price_id, phone_required}, slots:[{start, end}]}`. Cachas 60 sekunder publikt, privat för medlemmar. |
| `create-booking` | `{event_type_slug, start_at, guest_name, guest_email, guest_phone?, guest_notes?, location_type: meet, phone eller in_person, utm_*?, voucher_code?}` | Betald: `{booking_id, cancel_token, requires_payment, price_id, starts_at, ends_at}` med 10 minuters hålltid. Gratis eller klippkort: `{booking_id, cancel_token, meeting_url, starts_at, ends_at, voucher_remaining_uses}`. |
| `cancel-booking` | `{cancel_token, reason?}` | `{ok, already, hours_until, late, ...}`. Betalda bokningar kan inte avbokas på nätet. |
| `booking-ics` | `{session_id}` eller `{booking_id, cancel_token}` | Kalenderfil |
| `create-checkout` | `{priceId, quantity: 1, customerEmail, returnUrl, metadata, requestId}` | `{clientSecret}` för Stripe Embedded Checkout. Används för bokning, klippkort, klubb, presentkort och `hoa_guest`. |
| `capture-booking-intent` | Påbörjad bokning | Används bara om besökaren har godkänt påminnelser |

RPC funktioner som används från webben: `lookup_voucher`, `get_my_vouchers` och `lookup_gift_card`.

### 4.3 Regler som påverkar HOA

* **Spärrar per IP och mejladress:**
  * `create-booking`: 5 per minut, 8 per 15 minuter per IP och 5 per dygn per mejladress.
  * `get-availability`: 60 per 15 minuter per IP.

  Därför ska HOA anropa från besökarens webbläsare. Om anropen gick via en Next server skulle alla besökare dela Netlifys IP och snabbt bli spärrade.
* **Global brytare.** `admin_config.booking_mode` måste vara `calendar`. Annars är bokningen stängd på alla sajter och besökaren skickas till ett intresseformulär. Datumet `bookings_open_from` gäller också alla sajter.
* **Reglerade tjänster.** Miljövariabeln `PUBLIC_REGULATED_SESSION_SLUGS` kan stänga `hbot-*`, `ihht-*` och `ewot-*`. Då svarar `create-booking` med 409 och texten "personlig förfrågan". HOA:s viktigaste tjänster kan alltså vara stängda för direktbokning, och HOA:s gränssnitt måste visa ett förfrågningsformulär i det fallet.
* **Resurser och krockar** (`_shared/booking.ts`):

| Tjänst | Resurs |
|---|---|
| `forsta-halsosamtal` | Kort samtal med Patrik |
| `coaching-45`, `coaching-60` | Coach, blockerar allt |
| `hbot-60`, `hbot-80` | Tryckkammaren |
| `ihht-50` | Celloxy |
| Allt annat, även rödljus och EWOT | "Övrigt", som tar Patriks tid under hela passet |

  * För passiva behandlingar blockeras Patrik bara de första 15 och sista 10 minuterna.
  * Databasen har en exklusionsregel som ger fel `23P01` vid krock.
  * Den gemensamma Google kalendern (`GOOGLE_CALENDAR_ID`) kontrolleras via freeBusy, med egna bokningar borträknade.
  * **Rödljus och EWOT är alltså inte egna resurser i koden.** Om de ska kunna gå parallellt med annat behövs en ändring (se öppna frågor).

### 4.4 Stripe

* Ett Stripe konto. Embedded Checkout (`ui_mode embedded_page`).
* **Godkända returadresser** är en lista. Standard i produktion är `lifeisawesome.se` och `www`, och fler kan läggas till med miljövariabeln `PAYMENTS_ALLOWED_RETURN_ORIGINS`. HOA:s domän kräver alltså ingen kodändring där.
* **Webhooken** `payments-webhook` sköter:
  * betalda bokningar (Google händelse och mejl);
  * klippkort, presentkort och prenumerationer;
  * återbetalningar och tvister.
* **Gästköp av medlemskap** (`hoa_guest`) bjuder in användaren med en länk som är hårdkodad till `https://lifeisawesome.se/medlem`.
* **Kontoutdragstexten** sätts på kontonivå och säger i dag Life Is Awesome.

### 4.5 Varumärket är hårdkodat till LIA

| Var | Vad som står i dag |
|---|---|
| Avsändare för mejl | `Life Is Awesome <info@lifeisawesome.se>` |
| Avbokningslänk | `https://lifeisawesome.se/boka?avboka=<token>` |
| Kalenderfil (ICS) | PRODID `-//Life Is Awesome//Booking//EN`, UID `@lifeisawesome.se`, ingen LOCATION för besök på plats |
| Google kalender | "Bokning via lifeisawesome.se" |
| Plats i mejl | "Life Is Awesome Longevity Center, Brålandsvägen 29, 444 60 Stora Höga" |
| Bekräftelse vid betalning | Signerad "Patrik & Alexandra" |
| Presentkort | `Presentkort - Life Is Awesome` |
| Avbokningsmejl | Texten byggs i SQL funktionen `claim_booking_cancellation`. Att ändra den kräver en migrering. |
| Notis till personal | `PATRIK_NOTIFY_EMAIL` |

### 4.6 Samtycke och analys på LIA

* **Samtycket** sparas i `localStorage` under `lia_consent_v2`, med kategorierna analys och marknadsföring. Allt är avstängt tills besökaren säger ja.
* **Analys:** Flock plus en egen funktion, `log-pageview`.
* **Meta pixlar:** en standardpixel och en kampanjpixel för `/prova-tryckkammare`.
* **Känsliga sidor spåras aldrig**, till exempel `/boka*`, `/halsodeklaration`, `/borja` och `/anmal-samtal`.
* **Samtycke gäller per domän**, så HOA behöver en egen banner.
* **`create-booking` sparar alla bokare i tabellen `leads`** (matchat på mejladress). HOA:s kunder hamnar alltså i LIA:s kundregister och kan få LIA:s nyhetsbrev. Det måste lösas för GDPR.

### 4.7 Säkerhetshuvuden på LIA

`X-Frame-Options: SAMEORIGIN` och `frame-ancestors 'self'`. **LIA:s bokning går alltså inte att bädda in med iframe på HOA:s domän.** Det är en bra regel som vi inte föreslår att ändra.

---

## 5. Tre alternativ

### Alternativ A: eget HOA gränssnitt mot LIA:s backend (rekommenderas)

HOA:s Next.js sajt får egna sidor för `/boka`, `/boka/[slug]` och `/boka/tack`, i HOA:s design. Sidorna anropar LIA:s edge functions direkt från webbläsaren. LIA lär sig vilken sajt bokningen kom från och anpassar mejl och kalender efter det.

| Fråga | Svar i A |
|---|---|
| Vilka tjänster | En kolumn `sites` på `booking_event_types` styr vilka tjänster som syns var. En tjänst kan synas på båda sajterna. |
| Mejl, ICS, kalender | `_shared/brand.ts` väljer avsändare, svarsadress, avbokningslänk, ICS texter med LOCATION, kalenderprefix "HOA ·" och signatur utifrån `bookings.site`. |
| Stripe | Samma konto. Lägg till HOA:s domän i `PAYMENTS_ALLOWED_RETURN_ORIGINS`. Sätt `description` och `statement_descriptor_suffix` per sajt. |
| Analys och samtycke | Egen banner och egen lagring på HOA. Egen eller delad pixel enligt ägarens val. Bokningssidorna spåras inte. |
| SEO | All HOA trafik och auktoritet hamnar på HOA:s domän. 301 från LIA:s gamla HOA sidor. |
| GDPR | Bokare märks med sajt. Separat marknadsföringssamtycke per varumärke. |
| Fördelar | Rent varumärke hela vägen. En backend, en kalender, inga dubbletter. Små och bakåtkompatibla ändringar i LIA. |
| Nackdelar | Bokningsgränssnittet finns i två kodbaser (Vite och Next). Ändringar i API:t måste göras med båda i åtanke. Kräver manuell migrering och manuell deploy av funktioner i LIA. |

### Alternativ B: länka till LIA:s bokning med HOA märkning

HOA:s sajt är en ren innehållssajt. Bokningsknappar leder till `lifeisawesome.se/boka/<slug>?site=hoa`. LIA kan visa HOA:s logga när `site=hoa` finns och skicka med sajten till `create-booking`. Inbäddning med iframe stoppas av `frame-ancestors`.

| Fördelar | Nackdelar |
|---|---|
| Minst kod i HOA. Ett enda bokningsgränssnitt att underhålla. | Besökaren byter domän mitt i köpet, vilket ger ett varumärkesbrott och sämre konvertering. Spårning över domäner blir krånglig och kräver två samtycken. LIA:s sida måste ändras för HOA:s skull. Medlemskap och inloggning ligger kvar på LIA. |

### Alternativ C: gemensamt bokningspaket

Bokningsgränssnittet bryts ut till ett delat npm paket som både LIA och HOA använder.

| Fördelar | Nackdelar |
|---|---|
| Ett gränssnitt, två skal. | Tungt. LIA bygger på Vite, react-router, shadcn och Lovable, medan HOA bygger på Next. Lovable hanterar inte delade paket smidigt. Kräver stor ombyggnad av LIA:s live gren, med störst risk av alla tre. |

---

## 6. Rekommendation och faser

**Välj A, och starta med en fas 0 som fungerar som B utan någon LIA ändring.** Då kommer HOA ut på sin domän direkt, och bokningen flyttas in när LIA är redo.

### Fas 0: innehållssajten live (ingen ändring i LIA)

* Fyll HOA:s innehåll från LIA (avsnitt 3), uppdaterat. Ta bort "The House of Wellness" som nuvarande namn.
* Bokningsknappar går till `lifeisawesome.se/boka/<slug>` och medlemskap till `lifeisawesome.se/medlem`.
* Lägg till SEO grunden: sitemap, robots, `llms.txt`, JSON-LD, OG bilder och kanoniska adresser (avsnitt 7.2).
* Lägg till en samtyckesbanner om någon analys används. Annars behövs ingen.
* Koppla domänen i Netlify (ägaren gör det, avsnitt 7.5).

### Fas 1: LIA blir varumärkesmedvetet (bakåtkompatibelt)

* Lägg till en migrering med enbart nya kolumner, alla med standardvärdet `lia`. Inget befintligt beteende ändras.
* Lägg till `_shared/brand.ts` och använd den i funktionerna.
* Uppdatera SQL funktionen för avbokningsmejl.
* Kör migreringen och deploya funktionerna manuellt, eftersom Lovable inte gör det.
* Kör `smoke-test-booking` med `+smoketest@` adresser.
* Lägg HOA:s domän i `PAYMENTS_ALLOWED_RETURN_ORIGINS`.
* Verifiera HOA:s domän i Resend.

### Fas 2: bokning på HOA:s domän (MVP för bokning)

* `/boka` listar tjänster där `sites` innehåller `hoa`.
* `/boka/[slug]` hämtar lediga tider, tar emot formuläret och skapar bokningen.
* Betalda bokningar öppnar Stripe Embedded Checkout och skickar besökaren till `/boka/tack`.
* `/boka?avboka=<token>` avbokar.
* Kalenderfilen kan laddas ner.
* 409 svar för reglerade tjänster visar ett förfrågningsformulär.
* Fas 2 är klar när LIA:s gamla HOA sidor kan få 301.

### Fas 3: medlemskap, klippkort och presentkort på HOA

* `/medlemskap` med checkout för `hoa_*` och gästköp.
* Inloggning med Supabase Auth på HOA:s domän (redirect adresser och mejlmallar per sajt).
* Kundportalen i Stripe.
* Friskvårdskvitton.
* Klippkort och presentkort.

### Fas 4: städning och skärpning

* Byt CORS från `*` till en lista med LIA och HOA.
* Dela upp spärrar och statistik per sajt.
* Gör rödljus och EWOT till egna resurser om ägaren vill.
* Ta bort HOA innehåll som blivit kvar på LIA.

---

## 7. Exakta ändringar per repo

### 7.1 LIA (`awesome-life-hub`, gren `codex/professional-onebase-celloxy-v1`)

Inget av detta görs nu. Det är en lista för när ägaren säger ja.

**Databas (en ny migrering, bara tillägg)**

```sql
alter table public.bookings
  add column site text not null default 'lia' check (site in ('lia','hoa'));
alter table public.booking_event_types
  add column sites text[] not null default '{lia}';
alter table public.booking_intents
  add column site text not null default 'lia';
alter table public.leads
  add column first_site text not null default 'lia',
  add column sites text[] not null default '{lia}';
```

Därtill:

* Sätt `sites = '{lia,hoa}'` eller `'{hoa}'` på HOA:s tjänster, enligt ägarens beslut.
* Uppdatera `claim_booking_cancellation` så att mejltexten läser `bookings.site`.

**Edge functions**

* Ny fil `_shared/brand.ts` med en funktion `brandFor(site)` som returnerar:
  * namn, avsändare och svarsadress;
  * bas för avbokningslänken;
  * ICS PRODID, UID domän och LOCATION;
  * kalenderprefix och signatur;
  * Stripe beskrivning och `statement_descriptor_suffix`;
  * länk för inbjudan till medlemssidan.
* `create-booking`:
  * ta emot valfritt `site` (`lia` som standard);
  * kontrollera att tjänsten har sajten i `sites`;
  * spara `site` på bokningen;
  * märk lead med sajt;
  * prenumerera inte på LIA:s nyhetsbrev från HOA.
* `get-availability`: valfritt `site` med samma kontroll.
* `create-checkout`:
  * hämta sajt från bokningen;
  * sätt beskrivning och descriptor;
  * lägg till `site` i godkända metadatanycklar för köp utan bokning (medlemskap, klippkort, presentkort).
* `payments-webhook`, `booking-send-reminder`, `booking-ics`, `cancel-booking` och `reconcile-booking-cancellations`: använd `brandFor(booking.site)`.
* `capture-booking-intent` och `notify-stale-booking-intents`: spara och använd sajt.
* `bookings-daily-digest`: visa sajt per bokning.

**Konfiguration**

* Miljövariabeln `PAYMENTS_ALLOWED_RETURN_ORIGINS` får `https://<hoa-domän>` och `https://www.<hoa-domän>`.
* Resend: verifiera `<hoa-domän>`.
* Supabase Auth (fas 3): lägg till HOA:s adresser bland tillåtna redirect adresser.

**Webben (efter fas 2)**

* `public/_redirects`, med 301 för:
  * `/longevity-clinic` till `https://<hoa-domän>/`;
  * `/en/longevity-clinic` till `https://<hoa-domän>/` (eller en engelsk sida om sådan byggs);
  * `/house-of-wellness` och `/longevity-center` till `https://<hoa-domän>/`;
  * `/venue` till `https://<hoa-domän>/besok`, om ägaren vill.
* Ta bort dessa adresser ur `sitemap.xml` och peka "Klinik" i `llms.txt` till HOA:s domän.
* Ta bort HOA:s `LocalBusiness` från LIA:s JSON-LD, eller ersätt den med en `sameAs` länk.
* `/medlem` i LIA: 301 till `https://<hoa-domän>/medlemskap` efter fas 3.

### 7.2 HOA (det här repot)

**Fas 0**

* `content/`: fyll `sessions.json` med tjänsterna från avsnitt 3.2, med texter från `SAFE_SESSION_DESCRIPTIONS` och `WELLNESS_DISCLAIMER`. Uppdatera `faq.json` och fyll `site.json` med öppettider och telefon.
* `public/`: logga, favicon, OG bild, bilder och `llms.txt`.
* `src/app/sitemap.ts` och `src/app/robots.ts`.
* `metadataBase` och kanoniska adresser per sida i `layout.tsx`, med `NEXT_PUBLIC_SITE_URL`.
* JSON-LD i layouten:
  * Använd `HealthAndBeautyBusiness` eller `ExerciseGym` med namn, adress, geo, telefon, öppettider, `parentOrganization` Life Is Awesome AB och `sameAs` till sociala konton och Google profilen.
  * Använd `MedicalClinic` bara om en vårdgivare registrerad hos IVO driver verksamheten.
* `FAQPage` på `/faq`.
* Samtyckesbanner med egen nyckel (till exempel `hoa_consent_v1`) och samma regler som LIA: allt avstängt tills besökaren säger ja, och känsliga sidor spåras aldrig.
* Säkerhetshuvuden via `netlify.toml`, med CSP som tillåter:
  * `connect-src` till `https://ndtvsngguoejqgijwzye.supabase.co` och `https://api.stripe.com`;
  * `frame-src` och `script-src` till `https://js.stripe.com`.

**Fas 2**

* Miljövariabler i Netlify:
  * `NEXT_PUBLIC_SUPABASE_URL`
  * `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  * `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  * `NEXT_PUBLIC_SITE_URL`

  Alla är publika värden. Ingen hemlig nyckel behövs i HOA.
* `src/lib/booking/api.ts`: tunna anrop till `get-availability`, `create-booking`, `cancel-booking`, `booking-ics` och `create-checkout`, alltid från webbläsaren och alltid med `site: 'hoa'`.
* Sidor (klientkomponenter där det behövs):
  * `src/app/boka/page.tsx`
  * `src/app/boka/[slug]/page.tsx`
  * `src/app/boka/tack/page.tsx`
  * avbokning via `?avboka=`
* Stripe Embedded Checkout via `@stripe/stripe-js` och `@stripe/react-stripe-js`.
* Hantering av:
  * stängd bokning (`manual_interest`);
  * 409 för reglerade tjänster;
  * krock (`23P01`), där tiderna hämtas om;
  * spärr (429), som visar ett vänligt meddelande.
* `robots`: `noindex` på `/boka/tack` och avbokning.

Innan koden skrivs ska guiderna i `node_modules/next/dist/docs/` läsas, eftersom Next 16 skiljer sig från tidigare versioner (till exempel heter middleware nu proxy).

**Fas 3**

* `/medlemskap` med planer, checkout och gästköp.
* `/logga-in` och `/mina-sidor` med Supabase Auth.
* Kundportal och friskvårdskvitto.

### 7.3 Ordning vid driftsättning (fas 1 och 2)

1. Ta en backup av databasen. Kör migreringen i en Supabase branch eller lokalt först.
2. Kör migreringen i produktion. Den är bakåtkompatibel, så LIA fungerar som förut.
3. Deploya funktionerna manuellt (`supabase functions deploy ...`).
4. Kör `smoke-test-booking` för både `lia` och `hoa`. Kontrollera mejl, kalenderfil, Google händelse och avbokning.
5. Sätt `sites` på HOA:s tjänster.
6. Publicera HOA:s bokningssidor.
7. Lägg in 301 på LIA och publicera via Lovable.

### 7.4 Testlista

* Gratis bokning, betald bokning och bokning med klippkort på båda sajterna.
* Krock mellan HOA och LIA på samma resurs.
* Avbokning: tidig, sen och betald.
* Påminnelse och dagssammanfattning.
* Stripe återbetalning.
* Medlem som ser tider dygnet runt.
* Reglerad tjänst stängd (409).
* `booking_mode` satt till intresse.

### 7.5 Domän och DNS (görs av ägaren, inte nu)

* Lägg till `<hoa-domän>` och `www.<hoa-domän>` som egen domän på HOA:s Netlify sajt, och välj vilken som är primär.
* Välj DNS:
  * **Netlify DNS:** byt namnservrar hos registraren.
  * **Extern DNS:** apex pekar med A eller ALIAS till Netlifys lastbalanserare (`75.2.60.5`), och `www` pekar med CNAME till `<sajt>.netlify.app`.
* TLS certifikatet ordnas automatiskt av Netlify.
* Behåll befintliga MX poster om domänen har mejl.
* Lägg till SPF, DKIM och DMARC för Resend.
* TXT poster för Google Search Console och vid behov Meta domänverifiering.
* Uppdatera webbadressen i Google företagsprofil och håll namn, adress och telefon lika överallt.

---

## 8. Risker

| Risk | Vad vi gör |
|---|---|
| Delad produktionsdatabas. Ett fel påverkar båda sajterna. | Bara tillägg med standardvärden. Testa i en Supabase branch först. Backup innan. |
| Lovable kör inte migreringar och deployar inte funktioner. | Manuell checklista (avsnitt 7.3). Kod och databas måste vara i samma läge innan Lovable publicerar. |
| Grenen glider. `main` i LIA ligger cirka 640 commits efter. | Alla ändringar görs mot `codex/professional-onebase-celloxy-v1`. |
| Delade spärrar per IP och mejladress | Anrop från webbläsaren. Följ upp om HOA ger många 429 svar. |
| CORS `*` | Fungerar men är brett. Begränsas i fas 4. |
| En global brytare (`booking_mode`) och reglerade tjänster | HOA:s gränssnitt visar intresseformulär. Ägaren vet att brytaren gäller båda sajterna. |
| Ett Stripe konto och en kontoutdragstext | `statement_descriptor_suffix` per sajt. Ett eget konto bara om HOA blir ett eget bolag. |
| En Site URL i Supabase Auth | Tillåtna redirect adresser per sajt och sajtstyrda mejlmallar i fas 3. |
| HOA kunder hamnar i LIA:s register och nyhetsbrev | Märk lead med sajt. Separat samtycke. Inget automatiskt nyhetsbrev. |
| SEO tapp vid flytt | 301 sida för sida, ny sitemap, Search Console på båda domänerna. Flytta inte förrän HOA:s sidor är lika bra. |
| Två bokningsgränssnitt glider isär | API:t är kontraktet. Dokumentera indata och svar. Ändra bara bakåtkompatibelt. |

---

## 9. GDPR

* **Personuppgiftsansvarig.** Enklast är att Life Is Awesome AB är ansvarig för båda sajterna, och att HOA presenteras som ett varumärke inom bolaget. Integritetspolicyn på HOA säger då det tydligt.
* **Om HOA blir ett eget bolag** krävs antingen ett avtal om gemensamt ansvar (artikel 26) eller ett biträdesavtal (artikel 28), beroende på vem som bestämmer över uppgifterna.
* **Hälsodeklarationen** innehåller känsliga uppgifter (artikel 9). Den måste ange rätt ansvarig och ha rätt rättslig grund. Den ska fortsatt aldrig spåras.
* **Samtycke till marknadsföring** ska vara separat per varumärke. En HOA bokning ska inte ge LIA nyhetsbrev.
* **Cookies och analys** kräver eget samtycke på HOA:s domän.
* **Biträden:** Supabase, Stripe, Resend, Google och Netlify ska finnas med i HOA:s integritetspolicy.

---

## 10. Öppna frågor till ägaren

1. **Bolag:** Ska HOA drivas av Life Is Awesome AB, eller av ett eget bolag? Det styr personuppgiftsansvar, Stripe konto, kvitton, moms och villkor.
2. **Domän:** Exakt vilket domännamn? Ska `www` eller domänen utan `www` vara primär? Var ligger DNS i dag? Finns mejl på domänen?
3. **Tjänster:** Vilka tjänster hör till HOA, vilka till LIA och vilka ska synas på båda? Särskilt coaching (`coaching-45`, `coaching-60`) och "Samtal och stöd" (`forsta-halsosamtal`).
4. **Priser:** Stämmer priserna i LIA:s Stripe och Produktkatalog v2 för HOA, inklusive medlemskapen 599, 899, 1 495 och 2 495 kr?
5. **Resurser:** Ska rödljus och EWOT vara egna resurser som kan köras parallellt, eller fortsätta ta Patriks tid?
6. **Reglerade tjänster:** Ska HBOT, IHHT och EWOT vara direktbokningsbara på HOA, eller bara gå via förfrågan?
7. **Vårdgivare:** Bedrivs någon verksamhet som hälso och sjukvård med IVO registrering, till exempel vitamindropp eller blodprov? Det styr JSON-LD och texter.
8. **Varumärke:** Finns logga, färger, typsnitt, bilder och OG bild för HOA? Får vi använda LIA:s bilder?
9. **Innehåll:** Vem äger och uppdaterar HOA:s texter? Räcker JSON filer i repot, eller behövs ett CMS?
10. **Kontakt:** Öppettider, telefonnummer och mejladress för HOA. Ska avsändaren vara till exempel `info@<hoa-domän>`?
11. **Analys:** Egen Meta pixel och egen analys för HOA, eller delad med LIA?
12. **Gamla namn:** Finns en gammal domän för The House of Wellness som ska skicka vidare till HOA?
13. **Medlemmar:** Ska befintliga medlemmar logga in på HOA:s domän från fas 3, eller stanna på `lifeisawesome.se/medlem`?
14. **Personal:** Vem ska få notiser om HOA bokningar? Samma som i dag (`PATRIK_NOTIFY_EMAIL`)?
