import { liaSupabaseAnonKey, liaSupabaseUrl } from "./booking/config";

type ProgramStatus = "loading" | "active" | "paused";
let status: ProgramStatus = "loading";
let checkedAt = 0;
let reading: Promise<void> | null = null;
const listeners = new Set<() => void>();

export function programStatus() { return status; }
export function programEnabled() { return status === "active"; }

export function refreshProgramStatus(force = false) {
  if (reading || (!force && Date.now() - checkedAt < 30_000)) return;
  reading = (async () => {
    let next: ProgramStatus = "paused";
    try {
      if (liaSupabaseUrl && liaSupabaseAnonKey) {
        const response = await fetch(liaSupabaseUrl + "/rest/v1/rpc/amb_reach_public_status", {
          method: "POST", cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer",
          headers: { apikey: liaSupabaseAnonKey, Authorization: "Bearer " + liaSupabaseAnonKey, "Content-Type": "application/json" },
          body: "{}", signal: AbortSignal.timeout(5000),
        });
        if (response.ok && (await response.json())?.enabled === true) next = "active";
      }
    } catch { /* Missing rollout or unavailable API leaves ordinary guest booking available. */ }
    checkedAt = Date.now();
    status = next;
    for (const listener of listeners) listener();
  })().finally(() => { reading = null; });
}

const onFocus = () => refreshProgramStatus(true);
export function subscribeProgram(notify: () => void) {
  if (!listeners.size) window.addEventListener("focus", onFocus);
  listeners.add(notify);
  refreshProgramStatus();
  return () => {
    listeners.delete(notify);
    if (!listeners.size) window.removeEventListener("focus", onFocus);
  };
}
