"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import {
  ASSESSMENT_FLOWS,
  ASSESSMENT_TIMEOUT_MS,
  assessmentEmbedUrl,
  assessmentFallbackUrl,
  getAssessmentOrigin,
  parseAssessmentMessage,
  requiresAssessmentReload,
  type AssessmentFlow,
} from "@/lib/assessment";

type Session = { flow: AssessmentFlow; channel: string; parentOrigin: string; origin: string };
type AssessmentWindow = Window & { __hoaDocumentPath?: unknown; gtag?: unknown; fbq?: unknown };

const subscribeToDocument = () => () => undefined;
const serverDocumentIsClean = () => false;

function browserDocumentIsClean() {
  const currentWindow = window as AssessmentWindow;
  return !requiresAssessmentReload(currentWindow.__hoaDocumentPath, {
    gtag: currentWindow.gtag,
    fbq: currentWindow.fbq,
    scriptSources: Array.from(document.scripts, (script) => script.src),
  });
}

function Arrow() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 shrink-0">
      <path d="M4 12h16m-6-6 6 6-6 6" />
    </svg>
  );
}

function FlowChoices({ onChoose }: { onChoose: (flow: AssessmentFlow) => void }) {
  return (
    <div className="grid min-w-0 gap-4 md:grid-cols-2">
      {(Object.entries(ASSESSMENT_FLOWS) as [AssessmentFlow, typeof ASSESSMENT_FLOWS[AssessmentFlow]][]).map(([flow, copy]) => (
        <button
          key={flow}
          type="button"
          onClick={() => onChoose(flow)}
          className="group flex min-h-60 flex-col items-start rounded-2xl border border-hoa-light-line/45 bg-hoa-light-card p-6 text-left text-hoa-light-ink transition-colors hover:border-hoa-light-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-hoa-light-accent md:p-8"
        >
          <span className="max-w-sm font-display text-xl font-bold leading-snug md:text-2xl">{copy.title}</span>
          <span className="mt-4 max-w-sm text-base leading-relaxed text-hoa-light-muted">{copy.description}</span>
          <span className="mt-auto flex w-full items-center justify-between gap-3 pt-8 font-semibold text-hoa-light-accent">
            Välj inriktning <Arrow />
          </span>
        </button>
      ))}
    </div>
  );
}

function AssessmentFrame({ session, onRetry }: { session: Session; onRetry: () => void }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [height, setHeight] = useState(800);
  const copy = ASSESSMENT_FLOWS[session.flow];

  useEffect(() => {
    const timeout = window.setTimeout(() => setStatus("failed"), ASSESSMENT_TIMEOUT_MS);
    function receive(message: MessageEvent<unknown>) {
      const accepted = parseAssessmentMessage(message, {
        origin: session.origin,
        source: frame.current?.contentWindow ?? null,
        channel: session.channel,
        flow: session.flow,
      });
      if (!accepted) return;
      if (accepted.height !== undefined) setHeight(accepted.height);
      if (accepted.event === "ready" || accepted.event === "resize" || accepted.event === "complete") {
        window.clearTimeout(timeout);
        setStatus("ready");
      }
      if (accepted.event === "step") {
        container.current?.scrollIntoView({ behavior: "instant", block: "start" });
      }
    }
    window.addEventListener("message", receive);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("message", receive);
    };
  }, [session]);

  return (
    <div ref={container} className="scroll-mt-28" aria-busy={status === "loading"}>
      {status === "failed" ? (
        <div role="status" className="rounded-2xl border border-hoa-light-line/45 bg-hoa-light-card p-6 text-hoa-light-ink">
          <p className="font-semibold">Formuläret kunde inte visas här just nu.</p>
          <p className="mt-2 text-hoa-light-muted">Du kan fortsätta med samma behovsanalys direkt hos Life Is Awesome.</p>
          <a className="mt-5 inline-flex min-h-11 items-center gap-3 font-semibold underline underline-offset-4" href={assessmentFallbackUrl(session.flow)} referrerPolicy="no-referrer">
            Öppna formuläret hos Life Is Awesome <Arrow />
          </a>
          <div className="mt-5">
            <button type="button" className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4" onClick={onRetry}>Försök igen</button>
          </div>
        </div>
      ) : (
        <div className="relative min-w-0">
          {status === "loading" ? (
            <div role="status" className="absolute inset-0 z-10 rounded-2xl bg-hoa-light-card p-6 text-hoa-light-muted md:p-8">
              <p>Laddar ditt formulär…</p>
              <div aria-hidden="true" className="motion-safe:animate-pulse">
                <div className="mt-8 h-8 max-w-sm rounded-lg bg-hoa-light-line/15" />
                <div className="mt-6 h-20 rounded-xl bg-hoa-light-line/10" />
                <div className="mt-4 h-20 rounded-xl bg-hoa-light-line/10" />
                <div className="mt-4 h-20 rounded-xl bg-hoa-light-line/10" />
              </div>
            </div>
          ) : null}
          <iframe
            ref={frame}
            title={copy.iframeTitle}
            src={assessmentEmbedUrl(session.flow, session.parentOrigin, session.channel, session.origin)}
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            className={`block w-full border-0 ${status === "loading" ? "pointer-events-none opacity-0" : ""}`}
            style={{ height }}
            aria-hidden={status === "loading"}
            tabIndex={status === "loading" ? -1 : undefined}
            onError={() => setStatus("failed")}
          />
        </div>
      )}
    </div>
  );
}

export function AssessmentExperience() {
  const cleanDocument = useSyncExternalStore(subscribeToDocument, browserDocumentIsClean, serverDocumentIsClean);
  const [session, setSession] = useState<Session | null>(null);
  const [choosing, setChoosing] = useState(false);
  const choices = useRef<HTMLDivElement>(null);
  const formHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!browserDocumentIsClean()) window.location.replace(window.location.href);
  }, []);

  useEffect(() => {
    if (choosing) choices.current?.focus();
  }, [choosing]);

  useEffect(() => {
    if (!session || choosing) return;
    formHeading.current?.focus({ preventScroll: true });
    formHeading.current?.scrollIntoView({ behavior: "instant", block: "start" });
  }, [session, choosing]);

  function choose(flow: AssessmentFlow) {
    if (session?.flow !== flow) {
      setSession({ flow, channel: crypto.randomUUID(), parentOrigin: window.location.origin, origin: getAssessmentOrigin() });
    }
    setChoosing(false);
  }

  if (!cleanDocument) return <p role="status" className="text-hoa-ink-muted">Förbereder din behovsanalys…</p>;

  return (
    <div className="relative mx-auto min-w-0 max-w-4xl">
      {!session || choosing ? (
        <div ref={choices} tabIndex={-1}>
          {session ? (
            <div className="mb-6 space-y-3 text-hoa-ink-muted">
              <p>Dina svar nollställs om du väljer en annan inriktning.</p>
              <button type="button" className="inline-flex min-h-11 items-center font-semibold text-hoa-ink underline underline-offset-4" onClick={() => setChoosing(false)}>
                Fortsätt med mina svar
              </button>
            </div>
          ) : null}
          <FlowChoices onChoose={choose} />
        </div>
      ) : null}
      {session ? (
        <div className={choosing ? "pointer-events-none absolute inset-x-0 top-0 -z-10 opacity-0" : ""} aria-hidden={choosing} inert={choosing}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-hoa-line/40 pb-5">
            <h3 ref={formHeading} tabIndex={-1} className="scroll-mt-28 font-display text-lg font-semibold outline-none">{ASSESSMENT_FLOWS[session.flow].title}</h3>
            <button
              type="button"
              className="inline-flex min-h-11 items-center text-sm font-semibold text-hoa-ink-muted underline underline-offset-4 hover:text-hoa-ink"
              onClick={() => setChoosing(true)}
            >
              Byt inriktning
            </button>
          </div>
          <AssessmentFrame key={session.channel} session={session} onRetry={() => setSession({ ...session, channel: crypto.randomUUID() })} />
        </div>
      ) : null}
    </div>
  );
}
