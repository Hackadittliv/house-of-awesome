#!/usr/bin/env node
// Hämtar publika tjänster för lia och hoa via list_public_booking_event_types.
// Skriver content/services.snapshot.json efter att båda klinikernas anrop lyckats.
// Beskrivningarna från databasen tas inte med: HOA:s egna texter ligger i content/services.json.
//
// Användning:
//   LIA_SUPABASE_URL=https://ndtvsngguoejqgijwzye.supabase.co \
//   LIA_SUPABASE_ANON_KEY=<VITE_SUPABASE_PUBLISHABLE_KEY från LIA> \
//   npm run sync:services

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const url = (process.env.LIA_SUPABASE_URL ?? "").replace(/\/$/, "");
const key = process.env.LIA_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Sätt LIA_SUPABASE_URL och LIA_SUPABASE_ANON_KEY.");
  process.exit(1);
}

const services = [];
for (const clinic of ["lia", "hoa"]) {
  const response = await fetch(`${url}/rest/v1/rpc/list_public_booking_event_types`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` },
    body: JSON.stringify({ p_clinic_slug: clinic }),
  });

  if (!response.ok) {
    console.error(`Supabase svarade ${response.status} för ${clinic}: ${await response.text()}`);
    process.exit(1);
  }

  const events = await response.json();
  services.push(...events.map((event, index) => ({
    clinic,
    slug: event.slug,
    title_sv: event.title_sv,
    duration_minutes: event.duration_minutes,
    price_label_sv: event.price_label_sv,
    inquiry_only: event.inquiry_only,
    image_url: event.image_url,
    // RPC:n sorterar på sort_order, slug utan att returnera sort_order.
    sort_order: index,
  })));
}
const projectRef = new URL(url).hostname.split(".")[0];

const snapshot = {
  source: `Supabase ${projectRef}, list_public_booking_event_types för lia och hoa`,
  fetchedAt: new Date().toISOString(),
  services,
};

const target = fileURLToPath(new URL("../content/services.snapshot.json", import.meta.url));
await writeFile(target, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Skrev ${services.length} tjänster till content/services.snapshot.json`);
