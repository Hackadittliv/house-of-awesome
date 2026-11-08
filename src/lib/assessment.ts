export const ASSESSMENT_ORIGIN = "https://lifeisawesome.se";
export const ASSESSMENT_REVIEW_ORIGIN = "https://hoa-review--lia-professional-pr1-preview-20260829.netlify.app";
export const ASSESSMENT_MESSAGE_TYPE = "lia:assessment";
export const ASSESSMENT_MESSAGE_VERSION = 1;
export const ASSESSMENT_TIMEOUT_MS = 15_000;

export const ASSESSMENT_FLOWS = {
  personal: {
    title: "Min hälsa och återhämtning",
    description: "Berätta om din vardag, dina mål och vad du vill ha stöd med.",
    iframeTitle: "Behovsanalys för hälsa och återhämtning hos Life Is Awesome",
    embedPath: "/embed/behovsanalys/privat",
    fallbackPath: "/longevity-guide",
  },
  equipment: {
    title: "Utrustning för hem eller verksamhet",
    description: "Utforska utrustning och lösningar utifrån dina planer och förutsättningar.",
    iframeTitle: "Behovsanalys för utrustning hos Life Is Awesome",
    embedPath: "/embed/behovsanalys/utrustning",
    fallbackPath: "/professional#professional-contact",
  },
} as const;

export type AssessmentFlow = keyof typeof ASSESSMENT_FLOWS;

/** Normal builds stay pinned. Review builds trust only the designated read-only LIA host. */
export function getAssessmentOrigin(
  configuredOrigin = process.env.NEXT_PUBLIC_LIA_ASSESSMENT_ORIGIN,
  mode = process.env.NODE_ENV,
  reviewBuild = process.env.NEXT_PUBLIC_ASSESSMENT_REVIEW === "true",
): string {
  if (reviewBuild && configuredOrigin === ASSESSMENT_REVIEW_ORIGIN) return ASSESSMENT_REVIEW_ORIGIN;
  if (mode !== "development" || !configuredOrigin) return ASSESSMENT_ORIGIN;
  try {
    const url = new URL(configuredOrigin);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    if (
      local && url.protocol === "http:" && !url.username && !url.password &&
      url.pathname === "/" && !url.search && !url.hash
    ) return url.origin;
  } catch {
    // Invalid configuration must never broaden the trusted message origin.
  }
  return ASSESSMENT_ORIGIN;
}

export function assessmentEmbedUrl(
  flow: AssessmentFlow,
  parentOrigin: string,
  channel: string,
  origin = getAssessmentOrigin(),
): string {
  const url = new URL(ASSESSMENT_FLOWS[flow].embedPath, origin);
  url.searchParams.set("parentOrigin", new URL(parentOrigin).origin);
  url.searchParams.set("channel", channel);
  url.searchParams.set("source", "houseofawesome");
  return url.href;
}

export function assessmentFallbackUrl(flow: AssessmentFlow): string {
  return new URL(ASSESSMENT_FLOWS[flow].fallbackPath, getAssessmentOrigin()).href;
}

export type AssessmentMessage = {
  type: typeof ASSESSMENT_MESSAGE_TYPE;
  version: typeof ASSESSMENT_MESSAGE_VERSION;
  event: "ready" | "resize" | "step" | "complete";
  flow: AssessmentFlow;
  channel: string;
  height?: number;
};

type MessageEnvelope = Pick<MessageEvent<unknown>, "origin" | "source" | "data">;
type ExpectedFrame = {
  origin: string;
  source: MessageEventSource | null;
  channel: string;
  flow: AssessmentFlow;
};

/** Only operational metadata leaves this boundary. Form answers are never read or stored. */
export function parseAssessmentMessage(
  message: MessageEnvelope,
  expected: ExpectedFrame,
): AssessmentMessage | null {
  if (!expected.source || message.origin !== expected.origin || message.source !== expected.source) return null;
  const data = message.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const value = data as Record<string, unknown>;
  if (
    value.type !== ASSESSMENT_MESSAGE_TYPE || value.version !== ASSESSMENT_MESSAGE_VERSION ||
    value.flow !== expected.flow || value.channel !== expected.channel ||
    !["ready", "resize", "step", "complete"].includes(value.event as string)
  ) return null;
  if (value.height !== undefined && (
    typeof value.height !== "number" || !Number.isFinite(value.height) || value.height < 160 || value.height > 6000
  )) return null;
  return {
    type: ASSESSMENT_MESSAGE_TYPE,
    version: ASSESSMENT_MESSAGE_VERSION,
    event: value.event as AssessmentMessage["event"],
    flow: expected.flow,
    channel: expected.channel,
    ...(value.height === undefined ? {} : { height: value.height as number }),
  };
}

export type AssessmentTrackerState = { gtag?: unknown; fbq?: unknown; scriptSources: string[] };

export function hasAssessmentTrackers({ gtag, fbq, scriptSources }: AssessmentTrackerState): boolean {
  if (typeof gtag === "function" || typeof fbq === "function") return true;
  return scriptSources.some((source) => {
    try {
      const { hostname } = new URL(source);
      return hostname === "googletagmanager.com" || hostname.endsWith(".googletagmanager.com") || hostname === "connect.facebook.net";
    } catch {
      return false;
    }
  });
}

/** A fresh document also prevents a tracker queued by a previous SPA route from loading later. */
export function requiresAssessmentReload(initialDocumentPath: unknown, trackers: AssessmentTrackerState): boolean {
  const cleanPath = typeof initialDocumentPath === "string" && /^\/behovsanalys(?:\/|$)/.test(initialDocumentPath);
  return (initialDocumentPath !== undefined && !cleanPath) || hasAssessmentTrackers(trackers);
}
