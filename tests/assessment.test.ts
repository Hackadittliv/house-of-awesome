// @vitest-environment happy-dom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AssessmentExperience } from "@/components/assessment/AssessmentExperience";
import {
  ASSESSMENT_ORIGIN,
  ASSESSMENT_REVIEW_ORIGIN,
  ASSESSMENT_TIMEOUT_MS,
  assessmentEmbedUrl,
  assessmentFallbackUrl,
  getAssessmentOrigin,
  hasAssessmentTrackers,
  parseAssessmentMessage,
  requiresAssessmentReload,
} from "@/lib/assessment";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const operational = { type: "lia:assessment", version: 1, event: "ready", flow: "personal", channel: "current-frame", height: 720 };
const source = {} as Window;
const expected = { origin: ASSESSMENT_ORIGIN, source, channel: "current-frame", flow: "personal" as const };
const envelope = (data: unknown) => ({ data, origin: ASSESSMENT_ORIGIN, source });

describe("behovsanalysens adresser", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("låser produktionsbyggen till LIA även om miljön anger en annan värd", () => {
    expect(getAssessmentOrigin("http://localhost:5173", "production")).toBe(ASSESSMENT_ORIGIN);
    expect(getAssessmentOrigin("https://elsewhere.example", "production")).toBe(ASSESSMENT_ORIGIN);
  });

  it("kräver granskningsflaggan även för den exakta granskningsvärden", () => {
    vi.stubEnv("NEXT_PUBLIC_ASSESSMENT_REVIEW", undefined);
    expect(getAssessmentOrigin(ASSESSMENT_REVIEW_ORIGIN, "production")).toBe(ASSESSMENT_ORIGIN);
    expect(getAssessmentOrigin(ASSESSMENT_REVIEW_ORIGIN, "production", false)).toBe(ASSESSMENT_ORIGIN);
    expect(getAssessmentOrigin(ASSESSMENT_REVIEW_ORIGIN, "development", false)).toBe(ASSESSMENT_ORIGIN);
    expect(getAssessmentOrigin(ASSESSMENT_REVIEW_ORIGIN, "production", true)).toBe(ASSESSMENT_REVIEW_ORIGIN);
  });

  it.each([
    `${ASSESSMENT_REVIEW_ORIGIN}.attacker.example`,
    `${ASSESSMENT_REVIEW_ORIGIN}/`,
    `${ASSESSMENT_REVIEW_ORIGIN}/form`,
    `${ASSESSMENT_REVIEW_ORIGIN}?token=private`,
    `${ASSESSMENT_REVIEW_ORIGIN}#form`,
    ASSESSMENT_REVIEW_ORIGIN.replace("https:", "http:"),
    ASSESSMENT_REVIEW_ORIGIN.replace("https://", "https://user:password@"),
    "https://another-preview.netlify.app",
  ])("avvisar andra granskningsadresser även med flaggan: %s", (origin) => {
    expect(getAssessmentOrigin(origin, "production", true)).toBe(ASSESSMENT_ORIGIN);
  });

  it("håller reservlänkar i den skrivskyddade granskningen", () => {
    vi.stubEnv("NEXT_PUBLIC_ASSESSMENT_REVIEW", "true");
    vi.stubEnv("NEXT_PUBLIC_LIA_ASSESSMENT_ORIGIN", ASSESSMENT_REVIEW_ORIGIN);
    expect(assessmentFallbackUrl("personal")).toBe(`${ASSESSMENT_REVIEW_ORIGIN}/longevity-guide`);
    expect(assessmentFallbackUrl("equipment")).toBe(`${ASSESSMENT_REVIEW_ORIGIN}/professional#professional-contact`);
    vi.stubEnv("NEXT_PUBLIC_ASSESSMENT_REVIEW", "false");
    expect(assessmentFallbackUrl("personal")).toBe(`${ASSESSMENT_ORIGIN}/longevity-guide`);
  });

  it.each(["http://localhost:5173", "http://127.0.0.1:5173", "http://[::1]:5173"])("tillåter lokal utveckling på %s", (origin) => {
    expect(getAssessmentOrigin(origin, "development")).toBe(origin);
  });

  it.each([
    "https://elsewhere.example", "http://localhost.evil.example", "http://localhost:5173/form",
    "http://localhost:5173?token=private", "http://localhost:5173#form", "http://user:password@localhost:5173", "not a url",
  ])("avvisar en otillåten utvecklingsadress: %s", (origin) => {
    expect(getAssessmentOrigin(origin, "development")).toBe(ASSESSMENT_ORIGIN);
  });

  it("skickar endast förälderns origin, kanal och källnamn till rätt formulär", () => {
    const url = new URL(assessmentEmbedUrl("personal", "https://preview.example:444/path?email=private", "random-channel"));
    expect(url.origin).toBe(ASSESSMENT_ORIGIN);
    expect(url.pathname).toBe("/embed/behovsanalys/privat");
    expect(Object.fromEntries(url.searchParams)).toEqual({ parentOrigin: "https://preview.example:444", channel: "random-channel", source: "houseofawesome" });
    expect(new URL(assessmentEmbedUrl("equipment", "http://localhost:3000", "other", "http://localhost:5173")).href)
      .toBe("http://localhost:5173/embed/behovsanalys/utrustning?parentOrigin=http%3A%2F%2Flocalhost%3A3000&channel=other&source=houseofawesome");
    expect(assessmentFallbackUrl("personal")).toBe("https://lifeisawesome.se/longevity-guide");
    expect(assessmentFallbackUrl("equipment")).toBe("https://lifeisawesome.se/professional#professional-contact");
  });
});

describe("formulärets meddelandegräns", () => {
  it("godtar endast rätt fönster, origin, kanal och flöde", () => {
    expect(parseAssessmentMessage(envelope(operational), expected)).toEqual(operational);
    expect(parseAssessmentMessage({ ...envelope(operational), origin: "https://lifeisawesome.se.evil.example" }, expected)).toBeNull();
    expect(parseAssessmentMessage({ ...envelope(operational), source: {} as Window }, expected)).toBeNull();
    expect(parseAssessmentMessage(envelope(operational), { ...expected, source: null })).toBeNull();
    expect(parseAssessmentMessage(envelope({ ...operational, channel: "previous-frame" }), expected)).toBeNull();
    expect(parseAssessmentMessage(envelope({ ...operational, flow: "equipment" }), expected)).toBeNull();
  });

  it.each([
    null, [], "ready", { ...operational, type: "other" }, { ...operational, version: 2 },
    { ...operational, event: "answers" }, { ...operational, height: NaN }, { ...operational, height: Infinity },
    { ...operational, height: "720" }, { ...operational, height: 159 }, { ...operational, height: 6001 },
  ])("avvisar fel format eller orimlig höjd: %j", (data) => {
    expect(parseAssessmentMessage(envelope(data), expected)).toBeNull();
  });

  it("returnerar endast driftmetadata och ignorerar övrigt innehåll", () => {
    expect(parseAssessmentMessage(envelope({ ...operational, answers: { private: true } }), expected)).toEqual(operational);
    for (const event of ["ready", "resize", "step", "complete"]) {
      const message = { ...operational, event, height: undefined };
      expect(parseAssessmentMessage(envelope(message), expected)).toEqual(message);
    }
    expect(parseAssessmentMessage(envelope({ ...operational, height: 160 }), expected)?.height).toBe(160);
    expect(parseAssessmentMessage(envelope({ ...operational, height: 6000 }), expected)?.height).toBe(6000);
  });
});

describe("ett rent dokument före behovsanalysen", () => {
  const clean = { scriptSources: [] };
  it("kräver omladdning när dokumentet började på en sida som kan ha köade spårare", () => {
    expect(requiresAssessmentReload("/", clean)).toBe(true);
    expect(requiresAssessmentReload("/behovsanalysen", clean)).toBe(true);
    expect(requiresAssessmentReload("/behovsanalys", clean)).toBe(false);
    expect(requiresAssessmentReload("/behovsanalys/privat", clean)).toBe(false);
    expect(requiresAssessmentReload(undefined, clean)).toBe(false);
  });

  it("upptäcker laddade och påbörjade GA- och Meta-skript", () => {
    expect(hasAssessmentTrackers({ ...clean, gtag: () => undefined })).toBe(true);
    expect(hasAssessmentTrackers({ ...clean, fbq: () => undefined })).toBe(true);
    expect(hasAssessmentTrackers({ scriptSources: ["https://www.googletagmanager.com/gtag/js?id=example"] })).toBe(true);
    expect(requiresAssessmentReload("/behovsanalys", { scriptSources: ["https://connect.facebook.net/en_US/fbevents.js"] })).toBe(true);
    expect(hasAssessmentTrackers({ scriptSources: ["https://example.com/gtag.js", "https://googletagmanager.com.evil.example/tag", ""] })).toBe(false);
  });
});

describe("inbäddad behovsanalys", () => {
  let root: Root | undefined;
  let container: HTMLDivElement;

  beforeEach(() => {
    vi.useFakeTimers();
    (window as unknown as { happyDOM: { settings: { disableIframePageLoading: boolean } } }).happyDOM.settings.disableIframePageLoading = true;
    // Model the frame protocol locally without allowing happy-dom to fetch the real form.
    const reportError = console.error;
    vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      if (args[0] instanceof DOMException && args[0].message.endsWith("Iframe page loading is disabled.")) return;
      reportError(...args);
    });
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    act(() => root?.unmount());
    root = undefined;
    document.body.replaceChildren();
    delete (window as Window & { __hoaDocumentPath?: unknown }).__hoaDocumentPath;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  async function mount() {
    root = createRoot(container);
    await act(async () => root!.render(createElement(AssessmentExperience)));
  }

  async function click(text: string) {
    const button = [...container.querySelectorAll("button")].find((element) => element.textContent?.includes(text));
    expect(button).toBeTruthy();
    await act(async () => button!.click());
  }

  function currentFrame() {
    const iframe = container.querySelector("iframe")!;
    expect(iframe).not.toBeNull();
    if (!iframe.contentWindow) Object.defineProperty(iframe, "contentWindow", { value: {} as Window });
    return iframe;
  }

  async function message(iframe: HTMLIFrameElement, data: Record<string, unknown> = {}, eventOrigin = ASSESSMENT_ORIGIN, eventSource = iframe.contentWindow) {
    const url = new URL(iframe.src);
    await act(async () => {
      window.dispatchEvent(new MessageEvent("message", {
        origin: eventOrigin,
        source: eventSource,
        data: { type: "lia:assessment", version: 1, event: "ready", channel: url.searchParams.get("channel"), flow: "personal", ...data },
      }));
    });
  }

  it("laddar om ett tidigare spårbart dokument innan några val eller formulär visas", async () => {
    (window as Window & { __hoaDocumentPath?: unknown }).__hoaDocumentPath = "/tjanster";
    const replace = vi.spyOn(window.location, "replace").mockImplementation(() => undefined);
    await mount();
    expect(replace).toHaveBeenCalledWith(window.location.href);
    expect(container.querySelector("button")).toBeNull();
    expect(container.querySelector("iframe")).toBeNull();
    expect(container.textContent).toContain("Förbereder din behovsanalys");
  });

  it("väntar med extern kontakt tills besökaren valt en inriktning", async () => {
    await mount();
    expect(container.querySelector("iframe")).toBeNull();
    expect(container.textContent).toContain("Min hälsa och återhämtning");
    expect(container.textContent).toContain("Utrustning för hem eller verksamhet");
    await click("Min hälsa och återhämtning");
    const iframe = currentFrame();
    expect(document.activeElement).toBe(container.querySelector("h3"));
    expect(iframe.title).toContain("hälsa och återhämtning");
    expect(iframe.getAttribute("sandbox")).toBe("allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox");
    expect(iframe.getAttribute("referrerpolicy")).toBe("no-referrer");
    expect(new URL(iframe.src).searchParams.get("parentOrigin")).toBe(window.location.origin);
    expect(new URL(iframe.src).searchParams.get("channel")).toMatch(/^[\da-f-]{36}$/);
  });

  it("kräver protokollsvaret även efter iframe-load och ignorerar främmande meddelanden", async () => {
    await mount();
    await click("Min hälsa och återhämtning");
    const iframe = currentFrame();
    await act(async () => iframe.dispatchEvent(new Event("load")));
    expect(container.textContent).toContain("Laddar ditt formulär");
    await message(iframe, {}, "https://evil.example");
    await message(iframe, {}, ASSESSMENT_ORIGIN, {} as Window);
    await message(iframe, { flow: "equipment" });
    await message(iframe, { channel: "old-session" });
    expect(container.textContent).toContain("Laddar ditt formulär");
    await message(iframe, { event: "resize", height: 1140 });
    expect(container.textContent).not.toContain("Laddar ditt formulär");
    expect(iframe.style.height).toBe("1140px");
    expect(container.querySelector("iframe")).toBe(iframe);
    const scroll = vi.spyOn(HTMLElement.prototype, "scrollIntoView").mockImplementation(() => undefined);
    await message(iframe, { event: "step" });
    expect(scroll).toHaveBeenCalledWith({ behavior: "instant", block: "start" });
    await act(async () => vi.advanceTimersByTime(ASSESSMENT_TIMEOUT_MS));
    expect(container.textContent).not.toContain("kunde inte visas");
    await message(iframe, { event: "complete" });
    expect(container.querySelector("iframe")).toBe(iframe);
  });

  it("ger en fungerande reservlänk om inget protokollsvar kommer", async () => {
    await mount();
    await click("Utrustning för hem eller verksamhet");
    const iframe = currentFrame();
    await act(async () => iframe.dispatchEvent(new Event("load")));
    await act(async () => vi.advanceTimersByTime(ASSESSMENT_TIMEOUT_MS));
    expect(container.textContent).toContain("Formuläret kunde inte visas");
    expect(container.querySelector("a")?.href).toBe("https://lifeisawesome.se/professional#professional-contact");
    await click("Försök igen");
    const replacement = currentFrame();
    expect(replacement).not.toBe(iframe);
    expect(new URL(replacement.src).searchParams.get("channel")).not.toBe(new URL(iframe.src).searchParams.get("channel"));
    expect(container.textContent).toContain("Laddar ditt formulär");
    await message(iframe, { flow: "equipment" });
    expect(container.textContent).toContain("Laddar ditt formulär");
    await message(replacement, { flow: "equipment", event: "complete" });
    expect(container.querySelector("iframe")).toBe(replacement);
    await act(async () => vi.advanceTimersByTime(ASSESSMENT_TIMEOUT_MS));
    expect(container.textContent).not.toContain("kunde inte visas");
  });

  it("bevarar samma formulär vid avbrutet byte och ersätter först vid val av annat flöde", async () => {
    await mount();
    await click("Min hälsa och återhämtning");
    const iframe = currentFrame();
    await message(iframe);
    await click("Byt inriktning");
    expect(container.textContent).toContain("Dina svar nollställs");
    expect(container.querySelector("iframe")).toBe(iframe);
    await click("Fortsätt med mina svar");
    expect(container.querySelector("iframe")).toBe(iframe);
    expect(document.activeElement).toBe(container.querySelector("h3"));
    await click("Byt inriktning");
    await click("Min hälsa och återhämtning");
    expect(container.querySelector("iframe")).toBe(iframe);
    await click("Byt inriktning");
    await click("Utrustning för hem eller verksamhet");
    const replacement = currentFrame();
    expect(replacement).not.toBe(iframe);
    expect(document.activeElement).toBe(container.querySelector("h3"));
    expect(new URL(replacement.src).pathname).toBe("/embed/behovsanalys/utrustning");
    expect(new URL(replacement.src).searchParams.get("channel")).not.toBe(new URL(iframe.src).searchParams.get("channel"));
  });
});
