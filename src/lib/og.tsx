import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

async function dataUrl(file: string, mime: string) {
  const buffer = await readFile(join(process.cwd(), "src/assets", file));
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

export async function renderOgImage({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  const [background, logo] = await Promise.all([
    dataUrl("og-bakgrund.jpg", "image/jpeg"),
    dataUrl("og-uggla.png", "image/png"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#0b0b0b",
          color: "#f4efe4",
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
            borderBottom: "8px solid #d4af5f",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logo} alt="" width={88} height={88} />
            <div style={{ display: "flex", fontSize: 36, letterSpacing: 1 }}>
              House of&nbsp;<span style={{ color: "#d4af5f" }}>Awesome</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 980 }}>
            <div style={{ fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: "#d4af5f" }}>
              {eyebrow}
            </div>
            <div style={{ fontSize: 72, lineHeight: 1.08, marginTop: 16 }}>{title}</div>
            <div style={{ fontSize: 30, marginTop: 20, color: "#d8d0c0" }}>{subtitle}</div>
          </div>
        </div>
      </div>
    ),
    ogSize,
  );
}
