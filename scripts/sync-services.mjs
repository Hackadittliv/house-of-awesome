#!/usr/bin/env node
// Hämtar LIA:s publika tjänster (booking_event_types) och skriver content/services.snapshot.json.
// Läser bara publika rader med LIA:s publika nyckel, samma anrop som lifeisawesome.se/boka gör.
// Beskrivningarna från databasen tas inte med: HOA:s egna texter ligger i content/services.json.
//
// Användning:
//   LIA_SUPABASE_URL=https://ndtvsngguoejqgijwzye.supabase.co \
//   LIA_SUPABASE_ANON_KEY=<VITE_SUPABASE_PUBLISHABLE_KEY från LIA> \
//   npm run sync:services

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const url = process.env.LIA_SUPABASE_URL;
const key = process.env.LIA_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Sätt LIA_SUPABASE_URL och LIA_SUPABASE_ANON_KEY.");
  process.exit(1);
}

const fields = [
  "slug",
  "title_sv",
  "duration_minutes",
  "price_label_sv",
  "location_type",
  "requires_payment",
  "sort_order",
];

const query = new URLSearchParams({
  select: fields.join(","),
  is_active: "eq.true",
  is_public: "eq.true",
  order: "sort_order",
});

const response = await fetch(`${url}/rest/v1/booking_event_types?${query}`, {
  headers: { apikey: key, Authorization: `Bearer ${key}` },
});

if (!response.ok) {
  console.error(`Supabase svarade ${response.status}: ${await response.text()}`);
  process.exit(1);
}

const services = await response.json();
const projectRef = new URL(url).hostname.split(".")[0];

const snapshot = {
  source: `Supabase ${projectRef}, booking_event_types där is_active och is_public är sanna`,
  fetchedAt: new Date().toISOString(),
  services,
};

const target = fileURLToPath(new URL("../content/services.snapshot.json", import.meta.url));
await writeFile(target, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Skrev ${services.length} tjänster till content/services.snapshot.json`);
