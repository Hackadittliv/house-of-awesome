import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { findCopyViolations } from "../scripts/copy-rules.mjs";
import faq from "../content/faq.json";
import memberships from "../content/memberships.json";
import services from "../content/services.json";
import site from "../content/site.json";
import longevity from "../content/longevity.json";
import { HEALTH_DISCLAIMER, getServices } from "@/lib/content";

function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return tsxFiles(path);
    return path.endsWith(".tsx") ? [path] : [];
  });
}

describe("språkregler", () => {
  it("fångar det som inte är tillåtet", () => {
    expect(findCopyViolations("Lugnt – och skönt")).toHaveLength(1);
    expect(findCopyViolations("Lugnt - och skönt")).toHaveLength(1);
    expect(findCopyViolations("Här kan man träna")).toHaveLength(1);
    expect(findCopyViolations("Fråga hen om tid")).toHaveLength(1);
    expect(findCopyViolations("Minskar inflammation")).toHaveLength(1);
    expect(findCopyViolations("Krossekärr 517, 473 94 Henån och Manuella behandlingar")).toHaveLength(0);
  });

  it.each([
    ["Individuellt ordinerat av läkare.", "medicinskt-lofte"],
    ["Vitamindropp ordineras individuellt av läkare.", "medicinskt-lofte"],
    ["Innan behandling gör vår läkare en bedömning.", "medicinskt-lofte"],
    ["Kräver en läkarbedömning först.", "medicinskt-lofte"],
    ["Våra tjänster är friskvård och ett komplement.", "generell-friskrivning"],
    ["Huset är inte vård.", "generell-friskrivning"],
    ["Många upplever mer energi och ork.", "utfallslofte"],
    ["EWOT står för Exercise With Oxygen Therapy.", "engelsk-ewot"],
  ])("stoppar förbjuden fras: %s", (text, rule) => {
    expect(findCopyViolations(text).map((v) => v.rule)).toContain(rule);
  });

  it.each([
    "Innehåll och upplägg ordineras och dokumenteras av ansvarig vårdgivare.",
    "Behandlingen ges av legitimerad personal.",
    "Vägledningen ställer inte diagnos och ersätter inte vård eller behandling.",
    "EWOT (träning med extra syre)",
  ])("tillåter LIA:s formulering: %s", (text) => {
    expect(findCopyViolations(text)).toEqual([]);
  });

  const texts = [
    ...strings(services),
    ...strings(faq),
    ...strings(memberships),
    ...strings(site),
    ...strings(longevity),
    HEALTH_DISCLAIMER,
    ...getServices().map((service) => service.priceLabel ?? ""),
  ];

  it.each(texts.map((text) => [text.slice(0, 60), text]))("innehåll: %s", (_label, text) => {
    expect(findCopyViolations(text)).toEqual([]);
  });

  it.each(tsxFiles(join(process.cwd(), "src")))("komponent utan tankstreck och 'man'/'hen': %s", (file) => {
    const source = readFileSync(file, "utf8");
    const violations = findCopyViolations(source).filter((v) =>
      ["tankstreck", "man", "hen", "halsopastaende"].includes(v.rule),
    );
    expect(violations).toEqual([]);
  });
});
