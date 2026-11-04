import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "@/app/llms.txt/route";
import * as content from "@/lib/content";

const bookingConfig = vi.hoisted(() => ({ bookingEnabled: false }));
vi.mock("@/lib/booking/config", () => bookingConfig);

beforeEach(() => { bookingConfig.bookingEnabled = false; });
afterEach(() => vi.restoreAllMocks());

function bookingLink(text: string, slug: string): string {
  return text.split("\n").find((line) => line.includes(`/tjanster/${slug}`))!.split("Boka: ")[1];
}

describe("llms.txt", () => {
  it("beskriver Rebeccas direktbokning med längd, plats och pris", async () => {
    const text = await GET().text();
    const rebecca = text.split("\n").find((line) => line.includes("/tjanster/healing-emht"));
    expect(rebecca).toContain("Healing 45 min på plats");
    expect(rebecca).toContain("45 minuter. 950 kr. Boka:");
    expect(text).not.toMatch(/\.\s+\./u);
  });

  it("länkar internt när HOA:s bokning är konfigurerad", async () => {
    bookingConfig.bookingEnabled = true;
    const text = await GET().text();
    expect(bookingLink(text, "healing-emht")).toBe("/boka/healing-emht");
    expect(bookingLink(text, "hbot-60")).toBe("/boka/hbot-60");
  });

  it("lägger klinik på den externa EMHT-länken när bokningskonfiguration saknas", async () => {
    const text = await GET().text();
    const rebecca = new URL(bookingLink(text, "healing-emht"));
    expect(rebecca.origin).toBe("https://lifeisawesome.se");
    expect(rebecca.pathname).toBe("/boka/healing-emht");
    expect(rebecca.searchParams.get("clinic")).toBe("hoa");
    expect(rebecca.searchParams.get("utm_source")).toBe("houseofawesome");
    expect(rebecca.searchParams.get("utm_content")).toBe("llms");
    const hbot = new URL(bookingLink(text, "hbot-60"));
    expect(hbot.origin).toBe("https://lifeisawesome.se");
    expect(hbot.pathname).toBe("/boka/hbot-60");
    expect(hbot.searchParams.has("clinic")).toBe(false);
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
