#!/usr/bin/env node
// Endast en ny PGlite-databas i minnet. Ingen anslutningssträng eller fjärrklient.
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { createRequire } from "node:module";

const root = new URL("../", import.meta.url);
const requireLocal = createRequire(new URL("work/pglite/package.json", root));
const { PGlite } = requireLocal("@electric-sql/pglite");
const { btree_gist } = requireLocal("@electric-sql/pglite/contrib/btree_gist");
const db = new PGlite({ extensions: { btree_gist } });
const reference = new URL(".herd-ref/lia-migrations/", root);
// Hela, oförändrade migrationsfiler för bokningsschemat och dess beroenden.
// Övriga LIA-produkter, cron, Edge Functions och nätverk ingår inte i testet.
const migrations = [
  "20251124145310", // roller, has_role, updated_at
  "20260208143248", // sales-rollen
  "20260208143352", // leads
  "20260427094908", // purchases
  "20260519062604", // booking_event_types och bookings
  "20260519071512", // betalningsfält och kalender
  "20260519095154", // is_public
  "20260519100318", // inquiry_only
  "20260519121603", // vouchers, beroende till atomär bokning
  "20260524195716", // availability overrides
  "20260525121537", // phone_required
  "20260525191639", // image_url
  "20260830190133", // riktig resurs-trigger och EXCLUDE-constraint
  "20261012080100", // nuvarande kalenderdefault
  "20261018220000", // Studion och aktuell resursfunktion
];
let checks = 0;
function passed(name) {
  checks += 1;
  console.log(`OK ${checks}: ${name}`);
}

try {
  // Supabases plattformsscheman finns inte i PGlite. Endast dessa lokala
  // ersättningar behövs; inga LIA-bokningstabeller eller resursregler fejkas.
  await db.exec(`
    CREATE ROLE anon;
    CREATE ROLE authenticated;
    CREATE ROLE service_role;
    CREATE SCHEMA auth;
    CREATE SCHEMA storage;
    CREATE SCHEMA extensions;
    CREATE TABLE auth.users (id uuid PRIMARY KEY, email text);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT NULL::uuid $$;
    CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT 'service_role'::text $$;
    CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT '{}'::jsonb $$;
    CREATE TABLE storage.buckets (id text PRIMARY KEY, name text, public boolean);
    CREATE TABLE storage.objects (id uuid PRIMARY KEY, bucket_id text);
    SET search_path = public, extensions;
  `);
  const filenames = await readdir(reference);
  for (const prefix of migrations) {
    const matches = filenames.filter((name) => name.startsWith(`${prefix}_`) && name.endsWith(".sql"));
    assert.equal(matches.length, 1, `Exakt en referensmigration krävs för ${prefix}`);
    try {
      await db.exec(await readFile(new URL(matches[0], reference), "utf8"));
    } catch (error) {
      throw new Error(`Referensmigration ${matches[0]}: ${error.message}`, { cause: error });
    }
    console.log(`Migration: ${matches[0]}`);
  }
  passed(`${migrations.length} oförändrade referensmigrationer körda`);

  // Denna live-tjänst finns i HOA:s snapshot men saknar seed i referensen.
  // Testfixture för att kunna bevisa att go-live-filen lämnar den orörd.
  const snapshot = JSON.parse(await readFile(new URL("content/services.snapshot.json", root), "utf8"));
  const short = snapshot.services.find((event) => event.slug === "forsta-halsosamtal");
  assert.ok(short);
  await db.query(`INSERT INTO public.booking_event_types
    (slug, title_sv, title_en, duration_minutes, price_label_sv, location_type, requires_payment, sort_order)
    VALUES ($1, $2, 'Existing short call test fixture', $3, $4, $5, $6, $7)`,
  [short.slug, short.title_sv, short.duration_minutes, short.price_label_sv, short.location_type, short.requires_payment, short.sort_order]);

  const slug = "kostnadsfri-introduktion";
  const others = async () => (await db.query("SELECT * FROM public.booking_event_types WHERE slug <> $1 ORDER BY slug", [slug])).rows;
  const before = await others();
  const sql = await readFile(new URL("supabase/golive/20261031_kostnadsfri_introduktion_patrik.sql", root), "utf8");
  const readIntro = async () => (await db.query("SELECT * FROM public.booking_event_types WHERE slug = $1", [slug])).rows;
  await db.exec(sql);
  const first = await readIntro();
  assert.equal(first.length, 1);
  const expected = {
    slug, title_sv: "Kostnadsfri introduktion med Patrik", title_en: "Free introduction with Patrik",
    duration_minutes: 10, buffer_before_minutes: 0, buffer_after_minutes: 10,
    min_notice_hours: 24, max_days_ahead: 21, available_weekdays: [1, 2, 3, 4, 5],
    available_start_time: "09:00:00", available_end_time: "16:00:00", slot_interval_minutes: 10,
    location_type: "meet", price_label_sv: "Gratis", price_label_en: "Free",
    requires_payment: false, price_id: null, is_active: true, is_public: true,
    inquiry_only: false, phone_required: false, sort_order: 2,
  };
  function verifyFields(row) {
    for (const [key, value] of Object.entries(expected)) assert.deepEqual(row[key], value, key);
    assert.ok(row.description_sv.includes("Patrik"));
    assert.ok(row.description_en.includes("Patrik"));
  }
  verifyFields(first[0]);
  passed("ny rad och samtliga bokningsfält");

  const defaultCalendar = (await db.query("SELECT google_calendar_id FROM public.booking_event_types WHERE slug = 'forsta-halsosamtal'")).rows[0].google_calendar_id;
  assert.equal(first[0].google_calendar_id, defaultCalendar);
  assert.ok(defaultCalendar);
  passed("kalender från befintlig schemadefault, utan Google-anrop");

  await db.exec(sql);
  const second = await readIntro();
  assert.equal(second.length, 1);
  assert.equal(second[0].id, first[0].id);
  verifyFields(second[0]);
  passed("andra körningen ger samma id och en enda rad");

  // Prova även UPDATE-grenen med avvikande data, inklusive en egen kalender.
  await db.query(`UPDATE public.booking_event_types SET duration_minutes = 30,
    buffer_after_minutes = 0, requires_payment = true, price_id = 'test-only',
    available_weekdays = '{0,6}', is_public = false, inquiry_only = true,
    google_calendar_id = 'local-calendar-fixture' WHERE slug = $1`, [slug]);
  await db.exec(sql);
  const corrected = (await readIntro())[0];
  verifyFields(corrected);
  assert.equal(corrected.google_calendar_id, "local-calendar-fixture");
  assert.equal(corrected.id, first[0].id);
  passed("upsert återställer inställningarna och bevarar befintlig kalenderkoppling");

  assert.deepEqual(await others(), before);
  assert.equal((await db.query("SELECT count(*)::int AS count FROM public.booking_availability_overrides")).rows[0].count, 0);
  passed("alla andra tjänster, inklusive forsta-halsosamtal, är oförändrade; inga tidsundantag tillagda");

  const insertBooking = (start, end) => db.query(`INSERT INTO public.bookings
    (event_type_id, starts_at, ends_at, guest_name, guest_email, location_type)
    VALUES ($1, $2, $3, 'Lokalt test', 'local@example.invalid', 'meet') RETURNING id, payment_status`,
  [first[0].id, start, end]);
  const booking = (await insertBooking("2026-11-02T08:00:00Z", "2026-11-02T08:10:00Z")).rows[0];
  assert.equal(booking.payment_status, "not_required");
  const resources = (await db.query(`SELECT resource_name,
    extract(epoch FROM (upper(reserved_range) - lower(reserved_range)))::int AS seconds
    FROM private.booking_resource_reservations WHERE booking_id = $1`, [booking.id])).rows;
  assert.deepEqual(resources, [{ resource_name: "patrik", seconds: 1200 }]);
  passed("riktig bokning reserverar endast Patrik i 20 minuter, inga rum eller maskiner, ingen betalning");

  await assert.rejects(() => insertBooking("2026-11-02T08:10:00Z", "2026-11-02T08:20:00Z"), { code: "23P01" });
  passed("efterbufferten stoppar överlapp genom riktig EXCLUDE-constraint");
  await insertBooking("2026-11-02T08:20:00Z", "2026-11-02T08:30:00Z");
  passed("nästa samtal kan börja efter bufferten");

  console.log(JSON.stringify({ ...expected, id: corrected.id, google_calendar_id: corrected.google_calendar_id }, null, 2));
  console.log(`${checks} SQL-kontroller godkända. Databasen stängs; inget har körts mot LIA.`);
} finally {
  await db.close();
}
