import { describe, expect, it } from "vitest";

import { createConsent, isRevocation, isStorageRevocation, parseConsent } from "@/lib/consent";

describe("samtycke", () => {
  it("tolkar ett sparat val", () => {
    const saved = JSON.stringify({ analytics: true, marketing: false, updatedAt: "2026-10-11" });
    expect(parseConsent(saved)).toEqual({ analytics: true, marketing: false, updatedAt: "2026-10-11" });
  });

  it("behandlar saknat eller trasigt val som inget val", () => {
    expect(parseConsent(null)).toBeNull();
    expect(parseConsent("inte json")).toBeNull();
    expect(parseConsent(JSON.stringify({ analytics: "ja" }))).toBeNull();
  });

  it("känner igen när ett samtycke dras tillbaka", () => {
    const yes = createConsent(true, true);
    expect(isRevocation(yes, createConsent(false, true))).toBe(true);
    expect(isRevocation(yes, createConsent(true, false))).toBe(true);
    expect(isRevocation(createConsent(false, false), yes)).toBe(false);
    expect(isRevocation(null, createConsent(false, false))).toBe(false);
  });

  it("återkallar i alla flikar när valet ändras eller tas bort i en annan flik", () => {
    const yes = JSON.stringify(createConsent(true, false));
    const no = JSON.stringify(createConsent(false, false));
    expect(isStorageRevocation(yes, no)).toBe(true);
    expect(isStorageRevocation(yes, null)).toBe(true);
    expect(isStorageRevocation(no, yes)).toBe(false);
    expect(isStorageRevocation(null, yes)).toBe(false);
    expect(isStorageRevocation(no, null)).toBe(false);
  });
});
