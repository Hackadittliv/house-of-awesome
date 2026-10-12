import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "House of Awesome, longevity i Stora Höga";
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    eyebrow: "Stora Höga · Longevity",
    title: "Träning, återhämtning och longevity under ett tak",
    subtitle: "Tryckkammare, IHHT, EWOT, rödljus och gym dygnet runt",
  });
}
