#!/usr/bin/env node
// Hämtar HOA:s bokningsbara tjänster per klinik via LIA:s get-availability.
// Anropet läser tillgänglighet och tjänstefakta. Det skapar ingen bokning.
// Beskrivningar och betalningstext ligger kvar i content/services.json.
//
// Användning:
//   LIA_SUPABASE_URL=https://ndtvsngguoejqgijwzye.supabase.co \
//   LIA_SUPABASE_ANON_KEY=<VITE_SUPABASE_PUBLISHABLE_KEY från LIA> \
//   npm run sync:services

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const url = process.env.LIA_SUPABASE_URL;
const key = process.env.LIA_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Sätt LIA_SUPABASE_URL och LIA_SUPABASE_ANON_KEY.");
  process.exit(1);
}

const target = fileURLToPath(new URL("../content/services.snapshot.json", import.meta.url));
const catalog = JSON.parse(await readFile(new URL("../content/services.json", import.meta.url), "utf8"));
const previous = JSON.parse(await readFile(target, "utf8"));
const date = new Date().toISOString().slice(0, 10);
const services = [];

for (const service of catalog.filter((entry) => entry.kind === "bookable")) {
  const clinic = service.clinic ?? "lia";
  const response = await fetch(`${url.replace(/\/$/, "")}/functions/v1/get-availability`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      event_type_slug: service.slug,
      from_date: date,
      to_date: date,
      ...(service.clinic ? { clinic_slug: service.clinic } : {}),
    }),
  });

  if (!response.ok) throw new Error(`LIA svarade ${response.status} för ${clinic}/${service.slug}. Snapshoten behålls.`);
  const { event_type: event } = await response.json();
  if (event?.slug !== service.slug) throw new Error(`LIA saknar tjänstefakta för ${clinic}/${service.slug}. Snapshoten behålls.`);
  const old = previous.services.find((entry) => (entry.clinic ?? "lia") === clinic && entry.slug === service.slug);
  services.push({
    clinic,
    slug: event.slug,
    title_sv: event.title_sv,
    duration_minutes: event.duration_minutes,
    price_label_sv: event.price_label_sv,
    location_type: event.location_type,
    requires_payment: event.requires_payment,
    sort_order: event.sort_order ?? old?.sort_order ?? Number.MAX_SAFE_INTEGER,
  });
}

const projectRef = new URL(url).hostname.split(".")[0];

const snapshot = {
  source: `LIA ${projectRef}, get-availability för HOA:s bokningsbara tjänster per klinik`,
  fetchedAt: new Date().toISOString(),
  services,
};

await writeFile(target, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Skrev ${services.length} tjänster till content/services.snapshot.json`);
