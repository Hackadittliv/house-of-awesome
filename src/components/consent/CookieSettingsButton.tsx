"use client";

import { useConsent } from "@/components/consent/ConsentProvider";

export function CookieSettingsButton({ className = "" }: { className?: string }) {
  const { openSettings } = useConsent();
  return (
    <button type="button" onClick={openSettings} className={className}>
      Cookieinställningar
    </button>
  );
}
