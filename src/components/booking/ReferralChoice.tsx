"use client";
import { useState } from "react";
import { useReferralCode } from "@/components/ReferralLink";

export function useReferralChoice() {
  const code = useReferralCode();
  const [chosen, setChosen] = useState<string | null>(null);
  const accepted = code && code === chosen ? code : null;
  const field = code ? <label className="flex items-start gap-3 text-sm text-hoa-ink">
    <input type="checkbox" name="confirm-referral" checked={Boolean(accepted)} className="mt-1 size-4 accent-hoa-gold"
      onChange={event => setChosen(event.target.checked ? code : null)} />
    <span>Jag vill ange ambassadörens tipskod <strong>{code}</strong> för den här förfrågan eller beställningen.</span>
  </label> : null;
  return { accepted, field };
}
