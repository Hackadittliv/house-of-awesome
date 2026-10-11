"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { CANCEL_TOKEN_KEY } from "@/lib/booking/sensitive-url";

/**
 * Avbokningslänkar i mejlen pekar på /boka?avboka=…, samma form som på lifeisawesome.se.
 * Skriptet i <head> skickar normalt vidare till /avboka. Det här är reserven om det inte hann köra,
 * och koden följer med via sessionStorage, aldrig i adressen.
 */
export function CancelLinkForwarder() {
  const router = useRouter();
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("avboka");
    if (!token) return;
    try {
      window.sessionStorage.setItem(CANCEL_TOKEN_KEY, token);
    } catch {
      // Utan lagring visar avbokningssidan att koden saknas och hänvisar till mejlet.
    }
    window.history.replaceState(window.history.state, "", window.location.pathname);
    router.replace("/avboka");
  }, [router]);
  return null;
}
