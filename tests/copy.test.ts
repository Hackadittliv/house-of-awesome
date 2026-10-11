import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { findCopyViolations } from "../scripts/copy-rules.mjs";
import faq from "../content/faq.json";
import memberships from "../content/memberships.json";
import services from "../content/services.json";
import site from "../content/site.json";
import { WELLNESS_DISCLAIMER, getServices } from "@/lib/content";

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

  const texts = [
    ...strings(services),
    ...strings(faq),
    ...strings(memberships),
    ...strings(site),
    WELLNESS_DISCLAIMER,
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
