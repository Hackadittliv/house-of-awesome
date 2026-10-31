-- Appliceras endast manuellt av Christian, efter godkännande, mot LIA:s Supabase.
-- HOA:s bygge/deploy kör aldrig den här filen. Lokalt test: check-golive-sql.mjs.
-- Schema: .herd-ref/lia-migrations, t.o.m. 20261018220000_studion_room_rental.sql.
-- Ingen utövar-FK finns i detta schema. Befintlig booking_resource_ranges
-- reserverar enbart Patriks tid för denna slug, inklusive efterbufferten.
-- Inga rum, HBOT eller Celloxy reserveras. Resursfunktionen ändras inte.
-- google_calendar_id utelämnas: befintlig default används vid INSERT och
-- eventuell befintlig koppling bevaras vid UPDATE. Inga Google-anrop görs.

BEGIN;

INSERT INTO public.booking_event_types (
  slug, title_sv, title_en, description_sv, description_en,
  duration_minutes, buffer_before_minutes, buffer_after_minutes,
  min_notice_hours, max_days_ahead, available_weekdays,
  available_start_time, available_end_time, slot_interval_minutes,
  location_type, price_label_sv, price_label_en,
  requires_payment, price_id, is_active, is_public, inquiry_only,
  phone_required, sort_order
) VALUES (
  'kostnadsfri-introduktion',
  'Kostnadsfri introduktion med Patrik',
  'Free introduction with Patrik',
  'Ett kostnadsfritt samtal på 10 minuter med Patrik om dina mål och vilket upplägg som passar dig.',
  'A free 10 minute call with Patrik about your goals and which approach suits you.',
  10, 0, 10,
  24, 21, ARRAY[1,2,3,4,5]::smallint[],
  '09:00'::time, '16:00'::time, 10,
  'meet', 'Gratis', 'Free',
  false, NULL, true, true, false,
  false, 2
)
ON CONFLICT (slug) DO UPDATE SET
  title_sv = EXCLUDED.title_sv,
  title_en = EXCLUDED.title_en,
  description_sv = EXCLUDED.description_sv,
  description_en = EXCLUDED.description_en,
  duration_minutes = EXCLUDED.duration_minutes,
  buffer_before_minutes = EXCLUDED.buffer_before_minutes,
  buffer_after_minutes = EXCLUDED.buffer_after_minutes,
  min_notice_hours = EXCLUDED.min_notice_hours,
  max_days_ahead = EXCLUDED.max_days_ahead,
  available_weekdays = EXCLUDED.available_weekdays,
  available_start_time = EXCLUDED.available_start_time,
  available_end_time = EXCLUDED.available_end_time,
  slot_interval_minutes = EXCLUDED.slot_interval_minutes,
  location_type = EXCLUDED.location_type,
  price_label_sv = EXCLUDED.price_label_sv,
  price_label_en = EXCLUDED.price_label_en,
  requires_payment = EXCLUDED.requires_payment,
  price_id = EXCLUDED.price_id,
  is_active = EXCLUDED.is_active,
  is_public = EXCLUDED.is_public,
  inquiry_only = EXCLUDED.inquiry_only,
  phone_required = EXCLUDED.phone_required,
  sort_order = EXCLUDED.sort_order;

COMMIT;
