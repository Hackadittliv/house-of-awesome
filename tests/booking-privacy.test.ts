import { describe, expect, it } from "vitest";

import { confirmationView, type StoredConfirmation } from "@/lib/booking/confirmation";
import {
  CANCEL_TOKEN_KEY,
  CHECKOUT_SESSION_KEY,
  isTrackingFreePath,
  scrubSensitiveParamsScript,
} from "@/lib/booking/sensitive-url";

const TOKEN = "3f2b8c1e-9a4d-4e2f-8b7a-1c2d3e4f5a6b";
const SESSION = "cs_test_a1B2c3D4e5F6g7H8";

function runScrub(href: string) {
  const storage = new Map<string, string>();
  const calls: string[] = [];
  const location = {
    href,
    replace: (url: string) => calls.push(`replace:${url}`),
  };
  const history = {
    state: null,
    replaceState: (_state: unknown, _title: string, url: string) => {
      calls.push(`replaceState:${url}`);
      location.href = new URL(url, href).href;
    },
  };
  const window = {
    location,
    history,
    sessionStorage: { setItem: (key: string, value: string) => storage.set(key, value) },
  };
  new Function("window", "URL", scrubSensitiveParamsScript)(window, URL);
  return { storage, calls, href: location.href };
}

describe("skriptet som rensar adressfältet", () => {
  it("flyttar avbokningskoden till sessionStorage och tar bort den ur adressen", () => {
    const result = runScrub(`https://houseofawesome.se/avboka?avboka=${TOKEN}`);
    expect(result.storage.get(CANCEL_TOKEN_KEY)).toBe(TOKEN);
    expect(result.href).toBe("https://houseofawesome.se/avboka");
    expect(result.calls).toEqual(["replaceState:/avboka"]);
  });

  it("flyttar Stripesessionen och behåller andra parametrar", () => {
    const result = runScrub(`https://houseofawesome.se/boka/tack?session_id=${SESSION}&utm_source=mail#top`);
    expect(result.storage.get(CHECKOUT_SESSION_KEY)).toBe(SESSION);
    expect(result.href).toBe("https://houseofawesome.se/boka/tack?utm_source=mail#top");
    expect(result.href).not.toContain(SESSION);
  });

  it("skickar mejllänkar på /boka vidare till /avboka utan koden i adressen", () => {
    const result = runScrub(`https://houseofawesome.se/boka?avboka=${TOKEN}`);
    expect(result.storage.get(CANCEL_TOKEN_KEY)).toBe(TOKEN);
    expect(result.calls).toEqual(["replaceState:/boka", "replace:/avboka"]);
    expect(result.calls.join(" ")).not.toContain(TOKEN);
  });

  it("rör inte adresser utan känsliga parametrar", () => {
    const result = runScrub("https://houseofawesome.se/tjanster?utm_source=ig");
    expect(result.calls).toEqual([]);
    expect(result.storage.size).toBe(0);
  });

  it("tar bort koden även när sessionStorage inte går att använda", () => {
    const calls: string[] = [];
    const window = {
      location: { href: `https://houseofawesome.se/avboka?avboka=${TOKEN}`, replace: () => undefined },
      history: { state: null, replaceState: (_s: unknown, _t: string, url: string) => calls.push(url) },
      sessionStorage: {
        setItem: () => {
          throw new Error("blocked");
        },
      },
    };
    new Function("window", "URL", scrubSensitiveParamsScript)(window, URL);
    expect(calls).toEqual(["/avboka"]);
  });
});

describe("sidor utan spårare", () => {
  it.each(["/avboka", "/boka/tack", "/boka/tack/"])("%s laddar inga spårare", (path) => {
    expect(isTrackingFreePath(path)).toBe(true);
  });

  it.each(["/", "/boka", "/boka/hbot-60", "/tjanster", "/avbokat", null])("%s får spårare efter samtycke", (path) => {
    expect(isTrackingFreePath(path)).toBe(false);
  });
});

describe("tacksidan", () => {
  const paid: StoredConfirmation = {
    bookingId: "b1",
    cancelToken: TOKEN,
    startsAt: "2026-11-02T08:00:00Z",
    title: "Rödljusterapi",
    location: "På plats",
    slug: "rodljus-20",
    requiresPayment: true,
  };

  it("visar aldrig bekräftad innan LIA svarat att betalningen är klar", () => {
    expect(confirmationView({ sessionId: SESSION, details: paid, paymentStatus: null })).toBe("checking");
    expect(confirmationView({ sessionId: SESSION, details: paid, paymentStatus: "pending" })).toBe("checking");
    expect(confirmationView({ sessionId: SESSION, details: paid, paymentStatus: "confirmed" })).toBe("confirmed");
  });

  it("visar avbruten eller obetald betalning som inte bokad", () => {
    expect(confirmationView({ sessionId: SESSION, details: paid, paymentStatus: "not_paid" })).toBe("not_paid");
    expect(confirmationView({ sessionId: SESSION, details: paid, paymentStatus: "unknown" })).toBe("not_paid");
    expect(confirmationView({ sessionId: null, details: paid, paymentStatus: null })).toBe("not_paid");
  });

  it("betald men sent registrerad bokning går till manuell bekräftelse", () => {
    expect(confirmationView({ sessionId: SESSION, details: paid, paymentStatus: "review" })).toBe("review");
  });

  it("gratisbokningar bekräftas direkt och utan detaljer visas en neutral text", () => {
    expect(confirmationView({ sessionId: null, details: { ...paid, requiresPayment: false }, paymentStatus: null })).toBe(
      "free_confirmed",
    );
    expect(confirmationView({ sessionId: null, details: null, paymentStatus: null })).toBe("missing");
  });
});
