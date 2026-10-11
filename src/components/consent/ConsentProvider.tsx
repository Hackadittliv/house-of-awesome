"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import {
  CONSENT_CHANGE_EVENT,
  CONSENT_STORAGE_KEY,
  clearTrackingCookies,
  createConsent,
  isRevocation,
  parseConsent,
  type ConsentChoice,
} from "@/lib/consent";

const SERVER_SNAPSHOT = "__server__";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CONSENT_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CONSENT_CHANGE_EVENT, callback);
  };
}

function readStorage(): string | null {
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY);
  } catch {
    return null;
  }
}

type ConsentContextValue = {
  ready: boolean;
  choice: ConsentChoice | null;
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  save: (analytics: boolean, marketing: boolean) => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, readStorage, () => SERVER_SNAPSHOT);
  const ready = raw !== SERVER_SNAPSHOT;
  const choice = useMemo(() => (ready ? parseConsent(raw) : null), [raw, ready]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const save = useCallback(
    (analytics: boolean, marketing: boolean) => {
      const next = createConsent(analytics, marketing);
      const revoked = isRevocation(choice, next);
      try {
        window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Utan localStorage (t.ex. vissa privata lägen) sparas inget val och bannern visas igen.
      }
      setSettingsOpen(false);
      window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
      if (revoked) {
        clearTrackingCookies();
        window.location.reload();
      }
    },
    [choice],
  );

  const value = useMemo<ConsentContextValue>(
    () => ({
      ready,
      choice,
      settingsOpen,
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false),
      save,
    }),
    [ready, choice, settingsOpen, save],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const value = useContext(ConsentContext);
  if (!value) throw new Error("useConsent måste användas inom ConsentProvider");
  return value;
}
