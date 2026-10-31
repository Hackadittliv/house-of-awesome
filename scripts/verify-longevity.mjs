// Kör mot next start från ett rent bygge med samma miljö som servern.
// node scripts/verify-longevity.mjs blocked|preview http://127.0.0.1:3300
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const [mode, origin = "http://127.0.0.1:3300"] = process.argv.slice(2);
assert(["blocked", "preview"].includes(mode), "Ange blocked eller preview");
const blocked = mode === "blocked";
const pages = Object.values(JSON.parse(await readFile("content/longevity.json", "utf8")));
const portrait = await readFile("src/assets/anne-wevers.webp");
const portraitUrl = "/portratt/anne-wevers";
const oldPortraitUrl = "/images/team/anne-wevers.webp";
const variants = [
  { name: "HTML", headers: { "User-Agent": "Mozilla/5.0" } },
  { name: "HTML för metadata-bot", headers: { "User-Agent": "facebookexternalhit/1.1" } },
  { name: "RSC", headers: { RSC: "1", Accept: "text/x-component" } },
  { name: "RSC prefetch", headers: { RSC: "1", "Next-Router-Prefetch": "1", Accept: "text/x-component" } },
];

async function request(path, headers = {}) {
  return fetch(new URL(path, origin), { headers, redirect: "manual", signal: AbortSignal.timeout(15000) });
}

for (const page of pages) {
  for (const variant of variants) {
    let response = await request(page.path, variant.headers);
    // Next normaliserar RSC:s cache-nyckel innan själva Flight-svaret.
    if (response.status === 307 && variant.headers.RSC) {
      const location = new URL(response.headers.get("location"), origin);
      assert.equal(location.origin, origin);
      assert.equal(location.pathname, page.path);
      assert(location.searchParams.has("_rsc"));
      response = await request(`${location.pathname}${location.search}`, variant.headers);
    }
    const label = `${variant.name} ${page.path}`;
    assert.equal(response.status, blocked ? 404 : 200, label);
    if (variant.headers.RSC) assert.match(response.headers.get("content-type") ?? "", /text\/x-component/, label);
    const body = (await response.text()).replaceAll('\\"', '"').replaceAll("&amp;", "&");
    if (blocked) {
      for (const value of ["Anne", "Wevers", ...pages.flatMap((item) => [item.title, item.h1, item.metaDescription])]) {
        assert(!body.includes(value), `${label}: läcker ${value}`);
      }
      // Läs metadata i både HTML och Flight-objekt; routens transport-id är inte en canonical.
      const metadata = body.match(/<(?:meta|link)\b[^>]*>|\{[^{}\n]*"(?:rel|property|name)"\s*:[^{}\n]*\}/g) ?? [];
      for (const tag of metadata) {
        if (/canonical|og:|twitter:/.test(tag)) {
          for (const item of pages) assert(!tag.includes(item.path), `${label}: läcker sidmetadata ${tag}`);
        }
      }
      assert(!body.includes(portraitUrl), `${label}: läcker porträttreferens`);
    } else {
      for (const value of [page.title, page.metaDescription, "canonical", "og:title", "og:description", "og:url", "og:image", "twitter:title", "twitter:description", "noindex", "nofollow", "noimageindex"]) {
        assert(body.includes(value), `${label}: saknar ${value}`);
      }
      assert(body.includes(`https://houseofawesome.se${page.path}`), `${label}: saknar canonical`);
      if (page.path === "/anne-wevers") assert(body.includes(portraitUrl), `${label}: saknar porträtt`);
    }
    console.log(`${label}: ${response.status}, metadata OK`);
  }
}

for (const path of [oldPortraitUrl, "/src/assets/anne-wevers.webp"]) {
  const response = await request(path);
  assert.equal(response.status, 404, path);
  assert(!(response.headers.get("content-type") ?? "").startsWith("image/"), path);
}
const image = await request(portraitUrl);
assert.equal(image.status, blocked ? 404 : 200, portraitUrl);
assert.match(image.headers.get("cache-control") ?? "", /private.*no-store/);
const imageBody = Buffer.from(await image.arrayBuffer());
if (blocked) assert.equal(imageBody.length, 0);
else {
  assert.equal(image.headers.get("content-type"), "image/webp");
  assert(imageBody.equals(portrait), "Preview ska leverera originalets bildbytes");
}
// Även manuella försök via optimeraren måste nekas, annars kan en cache kringgå spärren.
for (const path of [portraitUrl, oldPortraitUrl]) {
  const optimized = await request(`/_next/image?url=${encodeURIComponent(path)}&w=256&q=75`);
  assert(optimized.status >= 400, `Optimeraren exponerar ${path}`);
  assert(!(optimized.headers.get("content-type") ?? "").startsWith("image/"));
}
const publicImage = await request("/_next/image?url=%2Fimages%2Fteam%2Fpatrik-nilsson.webp&w=256&q=75");
assert.equal(publicImage.status, 200, "Befintliga publika porträtt ska fortsatt kunna optimeras");
assert.match(publicImage.headers.get("content-type") ?? "", /^image\//);

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  }));
  return files.flat();
}

// Inspektera faktiska offentliga byggfiler, även om deras URL saknas i 404-svaret.
const staticFiles = await filesIn(".next/static");
for (const file of staticFiles) {
  const bytes = await readFile(file);
  assert(!bytes.includes(portrait), `Porträttets bytes finns i ${file}`);
  assert(!file.includes("anne-wevers"), `Porträttfil finns i ${file}`);
  if (/\.(?:webp|png|jpe?g|avif|gif)$/.test(file)) {
    const response = await request(file.replace(/^\.next\//, "/_next/"));
    const served = Buffer.from(await response.arrayBuffer());
    assert(!served.equals(portrait), `Offentlig byggadress serverar porträttet: ${file}`);
  }
  if (/\.(?:js|json)$/.test(file)) {
    const text = bytes.toString("utf8");
    assert(!text.includes(portraitUrl), `Porträttreferens i klientpaketet ${file}`);
    assert(!text.includes("Anne Wevers"), `Annes namn i klientpaketet ${file}`);
  }
}
const tracePath = ".next/server/app/portratt/anne-wevers/route.js.nft.json";
const trace = JSON.parse(await readFile(tracePath, "utf8"));
assert(trace.files.some((file) => file.endsWith("src/assets/anne-wevers.webp")), "Privat porträtt saknas i serverns filspårning");
console.log(`${mode}: porträttskydd och ${staticFiles.length} offentliga byggfiler OK`);
