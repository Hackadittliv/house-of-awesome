"use client";

import { useEffect, useMemo, useState } from "react";

import { ClientOnly } from "@/components/booking/ClientOnly";
import { Notice, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/booking/fields";
import { BookingApiError, createStudionBooking, getStudionSlots, sendStudionLoginLink, type Slot } from "@/lib/booking/api";
import { addDays, formatDateTime, formatDayLabel, stockholmDate } from "@/lib/booking/format";
import { maxConsecutiveHours, mondayOf, slotsByDayHour, studionCopy as t, weekDays, weekRows } from "@/lib/booking/studion";

const TOKEN_KEY = "hoa-studion-session";
type Session = { accessToken: string; email: string; expiresAt: number };

function decodeEmail(jwt: string): string {
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.email === "string" ? payload.email : "";
  } catch {
    return "";
  }
}

/** Läser token från inloggningslänken (#access_token=...) eller sessionStorage. */
function readSession(): Session | null {
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const token = hash.get("access_token");
  if (token) {
    const session = {
      accessToken: token,
      email: decodeEmail(token),
      expiresAt: Date.now() + Number(hash.get("expires_in") ?? 3600) * 1000,
    };
    sessionStorage.setItem(TOKEN_KEY, JSON.stringify(session));
    window.history.replaceState(window.history.state, "", window.location.pathname);
    return session;
  }
  try {
    const stored = JSON.parse(sessionStorage.getItem(TOKEN_KEY) ?? "null") as Session | null;
    return stored && stored.expiresAt > Date.now() ? stored : null;
  } catch {
    return null;
  }
}

export function StudionBooking() {
  return (
    <ClientOnly>
      <StudionInner />
    </ClientOnly>
  );
}

function StudionInner() {
  const [session, setSession] = useState<Session | null>(() => readSession());
  const [expired, setExpired] = useState(false);
  const logout = (wasExpired: boolean) => {
    sessionStorage.removeItem(TOKEN_KEY);
    setExpired(wasExpired);
    setSession(null);
  };
  // Token utan refresh: logga ut när den går ut, i stället för att visa "ej godkänd".
  useEffect(() => {
    if (!session) return;
    const id = window.setTimeout(() => logout(true), Math.max(session.expiresAt - Date.now(), 0));
    return () => window.clearTimeout(id);
  }, [session]);
  if (!session) return <Login expired={expired} />;
  return <Week session={session} onLogout={() => logout(false)} onExpired={() => logout(true)} />;
}

function Login({ expired }: { expired: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "unknown" | "error">("idle");
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("sending");
        try {
          await sendStudionLoginLink(email.trim(), `${window.location.origin}/studion`);
          setState("sent");
        } catch (error) {
          // create_user: false: okänd e-post ger 400/422 från Auth.
          setState(error instanceof BookingApiError && (error.status === 400 || error.status === 422) ? "unknown" : "error");
        }
      }}
    >
      {expired && <Notice tone="error">{t.expired}</Notice>}
      <h2 className="text-xl">{t.loginTitle}</h2>
      <p>{t.loginLead}</p>
      <input type="email" required autoComplete="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit" className={primaryButtonClass} disabled={state === "sending"}>{t.loginButton}</button>
      {state === "sent" && <Notice>{t.loginSent}</Notice>}
      {state === "unknown" && <Notice tone="error">{t.notApproved}</Notice>}
      {state === "error" && <Notice tone="error">{t.loginError}</Notice>}
    </form>
  );
}

function Week({ session, onLogout, onExpired }: { session: Session; onLogout: () => void; onExpired: () => void }) {
  const [monday, setMonday] = useState(() => mondayOf(stockholmDate(new Date())));
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [status, setStatus] = useState<"ok" | "error" | "forbidden">("ok");
  const [picked, setPicked] = useState<Slot | null>(null);
  const [hours, setHours] = useState(1);
  const [note, setNote] = useState("");
  const [result, setResult] = useState<"idle" | "booking" | "booked" | "taken" | "error" | "forbidden">("idle");

  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getStudionSlots(monday, addDays(monday, 7), session.accessToken)
      .then((data) => {
        if (cancelled) return;
        setSlots(data);
        setStatus("ok");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof BookingApiError && error.status === 401) return onExpired();
        setStatus(error instanceof BookingApiError && error.status === 403 ? "forbidden" : "error");
        setSlots([]);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monday, session.accessToken, refresh]);

  function goToWeek(next: string) {
    setSlots(null);
    setPicked(null);
    setMonday(next);
  }
  function load() {
    setSlots(null);
    setRefresh((n) => n + 1);
  }

  const days = weekDays(monday);
  const rows = useMemo(() => weekRows(days), [monday]); // eslint-disable-line react-hooks/exhaustive-deps
  const grid = useMemo(() => slotsByDayHour(slots ?? [], days), [slots, monday]); // eslint-disable-line react-hooks/exhaustive-deps
  const maxHours = picked && slots ? maxConsecutiveHours(slots, picked.start) : 1;

  async function book() {
    if (!picked) return;
    setResult("booking");
    try {
      await createStudionBooking({
        startAt: picked.start,
        hours,
        name: session.email,
        email: session.email,
        notes: note,
        accessToken: session.accessToken,
      });
      setResult("booked");
      setPicked(null);
      setNote("");
      load();
    } catch (error) {
      if (error instanceof BookingApiError && error.status === 409) setResult("taken");
      else if (error instanceof BookingApiError && error.status === 401) onExpired();
      else if (error instanceof BookingApiError && error.status === 403) setResult("forbidden");
      else setResult("error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <span>{session.email}</span>
        <button type="button" className={secondaryButtonClass} onClick={onLogout}>{t.logout}</button>
      </div>
      <p className="text-sm">{t.cleaning} {t.cancelRule}</p>

      <div className="flex items-center justify-between gap-3">
        <button type="button" className={secondaryButtonClass} onClick={() => goToWeek(addDays(monday, -7))}>{t.prevWeek}</button>
        <button type="button" className={secondaryButtonClass} onClick={() => goToWeek(addDays(monday, 7))}>{t.nextWeek}</button>
      </div>

      {status === "forbidden" && <Notice tone="error">{t.notApproved}</Notice>}
      {status === "error" && <Notice tone="error">{t.error}</Notice>}
      {slots === null ? (
        <p>{t.loading}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-14" />
                {days.map((day) => (
                  <th key={day} className="px-1 py-2 text-left font-medium">{formatDayLabel(day)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <td className="pr-2 align-top tabular-nums opacity-70">{row.label}</td>
                  {days.map((day) => {
                    const slot = grid.get(day)?.get(row.key);
                    const active = picked?.start === slot?.start;
                    return (
                      <td key={day} className="p-0.5">
                        {slot ? (
                          <button
                            type="button"
                            onClick={() => {
                              setPicked(slot);
                              setHours(1);
                              setResult("idle");
                            }}
                            className={`h-8 w-full rounded border text-xs ${active ? "bg-current/10 font-semibold" : "hover:bg-current/5"}`}
                          >
                            {t.free}
                          </button>
                        ) : (
                          <div className="h-8 w-full rounded bg-current/5" aria-hidden />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {picked ? (
        <div className="space-y-4 rounded border p-4">
          <p className="font-medium">{formatDateTime(picked.start)}</p>
          <label className="block space-y-1">
            <span className="text-sm">{t.hours}</span>
            <select className={inputClass} value={hours} onChange={(e) => setHours(Number(e.target.value))}>
              {Array.from({ length: maxHours }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>{n} h</option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-sm">{t.note}</span>
            <textarea className={inputClass} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          <button type="button" className={primaryButtonClass} disabled={result === "booking"} onClick={book}>
            {result === "booking" ? t.booking : t.book}
          </button>
        </div>
      ) : (
        <p className="text-sm">{t.pickHint}</p>
      )}
      {result === "booked" && <Notice>{t.booked}</Notice>}
      {result === "taken" && <Notice tone="error">{t.taken}</Notice>}
      {result === "forbidden" && <Notice tone="error">{t.notApproved}</Notice>}
      {result === "error" && <Notice tone="error">{t.error}</Notice>}
    </div>
  );
}
