"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Avbokningslänkar i mejlen pekar på /boka?avboka=…, samma form som på lifeisawesome.se. */
export function CancelLinkForwarder() {
  const router = useRouter();
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("avboka");
    if (token) router.replace(`/avboka?avboka=${encodeURIComponent(token)}`);
  }, [router]);
  return null;
}
