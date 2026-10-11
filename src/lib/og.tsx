import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const fontDir = join(process.cwd(), "node_modules/@fontsource/plus-jakarta-sans/files");

async function dataUrl(file: string, mime: string) {
  const buffer = await readFile(join(process.cwd(), "src/assets", file));
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

export async function renderOgImage({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  const [background, logo, regular, bold] = await Promise.all([
    dataUrl("og-bakgrund.jpg", "image/jpeg"),
    dataUrl("og-uggla.png", "image/png"),
    readFile(join(fontDir, "plus-jakarta-sans-latin-400-normal.woff")),
    readFile(join(fontDir, "plus-jakarta-sans-latin-700-normal.woff")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#000000",
          color: "#fdf5e2",
          fontFamily: "Plus Jakarta Sans",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={background} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0 }} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "64px 72px",
            borderBottom: "8px solid #efc55d",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt="" width={88} height={88} />
            <div style={{ display: "flex", fontSize: 38, fontWeight: 700, letterSpacing: -0.5 }}>
              House of&nbsp;<span style={{ color: "#efc55d" }}>Awesome</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 5.5, textTransform: "uppercase", color: "#efc55d" }}>
              {eyebrow}
            </div>
            <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1, marginTop: 16 }}>
              {title}
            </div>
            <div style={{ fontSize: 30, marginTop: 20, color: "#cdbfa2" }}>{subtitle}</div>
          </div>
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Plus Jakarta Sans", data: regular, weight: 400, style: "normal" },
        { name: "Plus Jakarta Sans", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
