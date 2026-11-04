import { afterEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/llms.txt/route";
import * as content from "@/lib/content";

afterEach(() => vi.restoreAllMocks());

describe("llms.txt", () => {
  it("beskriver Rebeccas direktbokning med längd, plats och pris", async () => {
    const text = await GET().text();
    const rebecca = text.split("\n").find((line) => line.includes("/tjanster/healing-emht"));
    expect(rebecca).toContain("Healing 45 min på plats");
    expect(rebecca).toContain("45 minuter. 950 kr. Boka:");
    expect(new URL(rebecca!.split("Boka: ")[1]).searchParams.get("clinic")).toBe("hoa");
    const hbot = text.split("\n").find((line) => line.includes("/tjanster/hbot-60"));
    expect(new URL(hbot!.split("Boka: ")[1]).searchParams.has("clinic")).toBe(false);
    expect(text).not.toMatch(/\.\s+\./u);
  });

  it.each([
    { durationMinutes: null, priceLabel: null, expected: ". Boka:" },
    { durationMinutes: 45, priceLabel: null, expected: ". 45 minuter. Boka:" },
    { durationMinutes: null, priceLabel: "950 kr", expected: ". 950 kr. Boka:" },
  ])("skriver korrekt skiljetecken med längd $durationMinutes och pris $priceLabel", async ({ durationMinutes, priceLabel, expected }) => {
    const service = content.getService("healing-emht")!;
    vi.spyOn(content, "getBookableServices").mockReturnValue([{ ...service, durationMinutes, priceLabel }]);

    const text = await GET().text();
    expect(text).toContain(`${service.lead}${expected.slice(1)}`);
    expect(text).not.toMatch(/\.\s+\./u);
  });
});
