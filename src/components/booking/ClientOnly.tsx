"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** Renderar bara i webbläsaren, så att barnen kan läsa adressfält och sessionStorage direkt. */
export function ClientOnly({ children }: { children: React.ReactNode }) {
  const isClient = useSyncExternalStore(subscribe, () => true, () => false);
  return isClient ? children : null;
}
