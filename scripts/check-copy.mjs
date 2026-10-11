#!/usr/bin/env node
// Kontrollerar den synliga texten i de förrenderade sidorna efter `npm run build`.

import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { findCopyViolations } from "./copy-rules.mjs";

const root = fileURLToPath(new URL("../.next/server/app", import.meta.url));

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return htmlFiles(path);
      return entry.name.endsWith(".html") ? [path] : [];
    }),
  );
  return files.flat();
}

function visibleText(html) {
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html;
  const text = body
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
  const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? "";
  const meta = [...head.matchAll(/<(?:title|meta[^>]+content=")([^"<]*)/gi)].map((m) => m[1]);
  return `${text} ${meta.join(" ")}`;
}

let files;
try {
  files = await htmlFiles(root);
} catch {
  console.error("Hittar inte .next/server/app. Kör `npm run build` först.");
  process.exit(1);
}

let failures = 0;
for (const file of files) {
  const violations = findCopyViolations(visibleText(await readFile(file, "utf8")));
  for (const violation of violations) {
    failures += 1;
    console.error(`${relative(root, file)}: ${violation.message}: "${violation.excerpt}"`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} språkfel i ${files.length} sidor.`);
  process.exit(1);
}
console.log(`Språkkontroll ok för ${files.length} sidor.`);
