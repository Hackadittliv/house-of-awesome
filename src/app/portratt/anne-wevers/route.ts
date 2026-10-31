import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { isLongevityBlocked } from "@/lib/longevity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Varken webbläsare, CDN eller Nexts bildoptimering får spara en offentlig kopia.
const headers = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, noimageindex",
};

export async function GET() {
  if (isLongevityBlocked()) return new Response(null, { status: 404, headers });

  const image = await readFile(join(process.cwd(), "src/assets/anne-wevers.webp"));
  return new Response(new Uint8Array(image), {
    headers: { ...headers, "Content-Type": "image/webp" },
  });
}
