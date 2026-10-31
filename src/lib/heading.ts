import type { CSSProperties } from "react";

// Teckenbredd i em för Plus Jakarta Sans 700 i versaler, inklusive rubrikernas letter-spacing
// -0,02em. Uppmätt i Chrome med @fontsource/plus-jakarta-sans. Summan av bredderna är lika med
// eller något större än det satta ordet (kerning drar bara ihop), så uppskattningen är säker.
const CAPS: Record<string, number> = {
  A: 0.692, B: 0.671, C: 0.754, D: 0.72, E: 0.575, F: 0.566, G: 0.788, H: 0.713, I: 0.259,
  J: 0.373, K: 0.659, L: 0.523, M: 0.873, N: 0.721, O: 0.858, P: 0.628, Q: 0.858, R: 0.641,
  S: 0.627, T: 0.522, U: 0.698, V: 0.677, W: 1, X: 0.641, Y: 0.64, Z: 0.551,
  Å: 0.692, Ä: 0.692, Ö: 0.858, Æ: 0.971, Ø: 0.858, Ü: 0.698, É: 0.575,
  "0": 0.688, "1": 0.383, "2": 0.577, "3": 0.591, "4": 0.634, "5": 0.595, "6": 0.582, "7": 0.539,
  "8": 0.612, "9": 0.582, "-": 0.58, "/": 0.486, "&": 0.773, ".": 0.358, ",": 0.337, ":": 0.358,
  ";": 0.378, "?": 0.563, "!": 0.351, "'": 0.291, "’": 0.337, "(": 0.359, ")": 0.359,
  "+": 0.64, "%": 1.026, "·": 0.358, '"': 0.478,
};
// Gemener med h3:s letter-spacing -0,015em, för rubriker i normal skiftläge (korttitlar, FAQ).
const LOWER: Record<string, number> = {
  a: 0.565, b: 0.657, c: 0.593, d: 0.657, e: 0.597, f: 0.391, g: 0.637, h: 0.578, i: 0.237,
  j: 0.237, k: 0.562, l: 0.237, m: 0.909, n: 0.578, o: 0.637, p: 0.657, q: 0.657, r: 0.359,
  s: 0.499, t: 0.398, u: 0.578, v: 0.551, w: 0.868, x: 0.543, y: 0.571, z: 0.466,
  å: 0.565, ä: 0.565, ö: 0.637, æ: 0.952, ø: 0.637, ü: 0.578, é: 0.597,
};
// Okända tecken räknas som ett brett tecken.
const FALLBACK = 0.9;
// Marginal för avrundning och skillnader mellan fontversioner.
const MARGIN = 1.02;

/** Ord som inte får brytas: allt mellan mellanslag, även sammansättningar med - eller /. */
export function headingWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

/** Bredden i em för rubrikens längsta ord, i versaler (caps) eller som texten är skriven. */
export function longestWordEm(text: string, caps = true): number {
  let widest = 0;
  for (const word of headingWords(text)) {
    let em = 0;
    for (const char of caps ? word.toLocaleUpperCase("sv-SE") : word) em += LOWER[char] ?? CAPS[char] ?? FALLBACK;
    widest = Math.max(widest, em);
  }
  return widest;
}

/** Värdet för --hoa-fit: rubriken får aldrig vara större än att längsta ordet ryms. */
export function headingFit(text: string, caps = true): number {
  return Math.ceil(longestWordEm(text, caps) * MARGIN * 100) / 100;
}

/**
 * Inline-stil för rubriker med hoa-h1, hoa-h2, hoa-h2-prose eller hoa-fit-text. Närmaste
 * omslag ska vara en container. caps = false för rubriker i normal skiftläge.
 */
export function fitStyle(text: string, caps = true): CSSProperties {
  return { "--hoa-fit": headingFit(text, caps) } as CSSProperties;
}

/** Delar rubriken i ord som får brytas emellan och sammansättningar som hålls ihop. */
export function headingParts(text: string): { text: string; keep: boolean }[] {
  return text
    .split(/(\s+)/)
    .filter(Boolean)
    .map((part) => ({ text: part, keep: /\S[-/]\S/.test(part) }));
}
