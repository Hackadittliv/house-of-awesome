import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import previewPassword, { previewAccess } from "../netlify/edge-functions/preview-password";

const basic = (user: string, password: string) => `Basic ${btoa(`${user}:${password}`)}`;

describe("lösenordsskydd för förhandsvisningar", () => {
  it("släpper alltid igenom produktion och okänd kontext", () => {
    expect(previewAccess("production", "hemligt", null)).toBe("pass");
    expect(previewAccess("production", undefined, null)).toBe("pass");
    expect(previewAccess(undefined, "hemligt", null)).toBe("pass");
    expect(previewAccess("dev", "hemligt", null)).toBe("pass");
  });

  it.each(["deploy-preview", "branch-deploy"])("kräver rätt lösenord i %s", (context) => {
    expect(previewAccess(context, "hemligt", null)).toBe("deny");
    expect(previewAccess(context, "hemligt", basic("valfritt", "fel"))).toBe("deny");
    expect(previewAccess(context, "hemligt", basic("valfritt", "hemligt"))).toBe("allow");
    expect(previewAccess(context, "hemligt", basic("", "hemligt"))).toBe("allow");
    expect(previewAccess(context, "hemligt", "Bearer hemligt")).toBe("deny");
    expect(previewAccess(context, "hemligt", "Basic !!!")).toBe("deny");
  });

  it("nekar förhandsvisningar när lösenordet saknas i miljön", () => {
    expect(previewAccess("deploy-preview", undefined, basic("a", ""))).toBe("deny");
    expect(previewAccess("deploy-preview", "", basic("a", ""))).toBe("deny");
  });

  it("klarar lösenord med kolon och å, ä, ö", () => {
    const encoded = `Basic ${btoa(String.fromCharCode(...new TextEncoder().encode("x:lö:sen")))}`;
    expect(previewAccess("deploy-preview", "lö:sen", encoded)).toBe("allow");
  });
});

describe("mobil inloggning till förhandsvisningen", () => {
  const origin = "https://behovsanalys-review--house-of-awesome.netlify.app";
  const context = { deploy: { context: "branch-deploy" } };
  const password = "ett testlosenord";
  const page = (cookie?: string, host = origin) => new Request(`${host}/behovsanalys`, {
    headers: { accept: "text/html", ...(cookie ? { cookie } : {}) },
  });
  const login = (value = password, returnTo = "/behovsanalys", requestOrigin = origin) => new Request(`${origin}/__preview-login`, {
    method: "POST",
    headers: { origin: requestOrigin, "content-type": "application/x-www-form-urlencoded", accept: "text/html" },
    body: new URLSearchParams({ password: value, returnTo }),
  });
  const cookieFrom = (response: Response | undefined) => {
    const header = response?.headers.get("set-cookie");
    expect(header).toBeTruthy();
    return header!.split(";")[0];
  };

  beforeEach(() => {
    vi.stubGlobal("Netlify", { env: { get: vi.fn(() => password) } });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("visar en svensk HTML-sida utan webbläsarens Basic-dialog", async () => {
    const response = await previewPassword(page(), context);
    expect(response?.status).toBe(401);
    expect(response?.headers.get("content-type")).toContain("text/html");
    expect(response?.headers.has("www-authenticate")).toBe(false);
    expect(response?.headers.get("cache-control")).toContain("no-store");
    const html = await response!.text();
    expect(html).toContain('lang="sv"');
    expect(html).toContain('name="viewport"');
    expect(html).toContain('action="/__preview-login"');
    expect(html).toContain('type="password"');
    expect(html).toContain('name="returnTo"');
    expect(html).not.toContain(password);
  });

  it("sätter en säker cookie och släpper igenom både sidan och dess resurser", async () => {
    const response = await previewPassword(login(), context);
    expect(response?.status).toBe(303);
    expect(response?.headers.get("location")).toBe("/behovsanalys");
    const header = response!.headers.get("set-cookie")!;
    expect(header).toMatch(/;\s*HttpOnly/i);
    expect(header).toMatch(/;\s*Secure/i);
    expect(header).toMatch(/;\s*SameSite=Lax/i);
    expect(header).toMatch(/;\s*Path=\//i);
    expect(header).toMatch(/;\s*Max-Age=604800/i);
    expect(header).not.toContain(password);
    const cookie = cookieFrom(response);
    expect(await previewPassword(page(cookie), context)).toBeUndefined();
    expect(await previewPassword(new Request(`${origin}/_next/static/chunks/example.js`, { headers: { cookie } }), context)).toBeUndefined();
    expect(await previewPassword(new Request(`${origin}/_next/static/css/example.css`, { headers: { cookie } }), context)).toBeUndefined();
  });

  it("nekar fel lösenord och fortsätter neka när miljölösenordet saknas", async () => {
    const invalid = await previewPassword(login("fel"), context);
    expect(invalid?.status).toBe(401);
    expect(invalid?.headers.has("set-cookie")).toBe(false);
    expect(await invalid!.text()).toMatch(/fel|stämmer|försök/i);
    vi.stubGlobal("Netlify", { env: { get: () => undefined } });
    const missing = await previewPassword(login(), context);
    expect(missing?.status).toBe(401);
    expect(missing?.headers.has("set-cookie")).toBe(false);
  });

  it("nekar POST från annan origin och utan origin", async () => {
    const crossOrigin = await previewPassword(login(password, "/behovsanalys", "https://example.com"), context);
    expect(crossOrigin?.status).toBe(403);
    expect(crossOrigin?.headers.has("set-cookie")).toBe(false);
    const missingOrigin = login();
    missingOrigin.headers.delete("origin");
    const response = await previewPassword(missingOrigin, context);
    expect(response?.status).toBe(403);
    expect(response?.headers.has("set-cookie")).toBe(false);
  });

  it.each(["https://example.com/", "//example.com/", "/\\example.com/", "javascript:alert(1)"])("ersätter osäker returadress %s", async (returnTo) => {
    const response = await previewPassword(login(password, returnTo), context);
    expect(response?.status).toBe(303);
    expect(response?.headers.get("location")).toBe("/behovsanalys");
  });

  it("bevarar en säker relativ returadress med query och hash", async () => {
    const response = await previewPassword(login(password, "/behovsanalys?inriktning=privat#start"), context);
    expect(response?.headers.get("location")).toBe("/behovsanalys?inriktning=privat#start");
  });

  it("nekar manipulerad, utgången eller annan värds cookie", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-08T12:00:00Z"));
    const cookie = cookieFrom(await previewPassword(login(), context));
    const separator = cookie.indexOf("=");
    const value = cookie.slice(separator + 1);
    const tampered = `${cookie.slice(0, separator + 1)}${value[0] === "a" ? "b" : "a"}${value.slice(1)}`;
    expect((await previewPassword(page(tampered), context))?.status).toBe(401);
    expect((await previewPassword(page(cookie, "https://other-preview.netlify.app"), context))?.status).toBe(401);
    vi.setSystemTime(new Date("2026-11-15T12:00:01Z"));
    expect((await previewPassword(page(cookie), context))?.status).toBe(401);
  });

  it("släpper igenom Basic och produktion före inloggningsrouten", async () => {
    expect(await previewPassword(new Request(`${origin}/behovsanalys`, { headers: { authorization: basic("x", password) } }), context)).toBeUndefined();
    expect(await previewPassword(login("fel"), { deploy: { context: "production" } })).toBeUndefined();
  });

  it.each(["branch-deploy", "deploy-preview"])("öppnar endast den uttryckligen aktiverade mobilgranskningen i %s", async (deployContext) => {
    vi.stubGlobal("Netlify", { env: { get: (name: string) => name === "HOA_PUBLIC_ASSESSMENT_REVIEW" ? "true" : password } });
    const reviewContext = { deploy: { context: deployContext } };
    expect(await previewPassword(page(), reviewContext)).toBeUndefined();
    expect(await previewPassword(new Request(`${origin}/_next/static/chunks/example.js`), reviewContext)).toBeUndefined();
    for (const otherOrigin of [
      "https://other-preview--house-of-awesome.netlify.app",
      "https://behovsanalys-review--house-of-awesome.netlify.app.example.com",
      "http://behovsanalys-review--house-of-awesome.netlify.app",
    ]) {
      expect((await previewPassword(page(undefined, otherOrigin), reviewContext))?.status).toBe(401);
    }
  });

  it.each(["false", undefined])("behåller inloggningen när publik granskningsflagga är %s", async (flag) => {
    vi.stubGlobal("Netlify", { env: { get: (name: string) => name === "HOA_PUBLIC_ASSESSMENT_REVIEW" ? flag : password } });
    expect((await previewPassword(page(), context))?.status).toBe(401);
    expect(await previewPassword(page(), { deploy: { context: "production" } })).toBeUndefined();
  });

  it("märker den publika granskningens strömmade svar som noindex", async () => {
    vi.stubGlobal("Netlify", { env: { get: (name: string) => name === "HOA_PUBLIC_ASSESSMENT_REVIEW" ? "true" : password } });
    const next = vi.fn(async () => new Response("preview", { headers: { "content-type": "text/html" } }));
    const response = await previewPassword(page(), { ...context, next });
    expect(next).toHaveBeenCalledOnce();
    expect(response?.headers.get("x-robots-tag")).toMatch(/noindex/);
    expect(response?.headers.get("x-robots-tag")).toMatch(/nofollow/);
    expect(response?.headers.get("x-robots-tag")).toMatch(/noarchive/);
    expect(response?.headers.get("content-type")).toBe("text/html");
    expect(await response!.text()).toBe("preview");
  });
});
