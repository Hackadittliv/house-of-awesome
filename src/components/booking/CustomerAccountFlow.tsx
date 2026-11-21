"use client";

import { Fragment, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { bookingEnabled } from "@/lib/booking/config";
import { isCustomerAccountDocument, signInCustomer, type CustomerAccount } from "@/lib/booking/customer-account";
import { inputClass, primaryButtonClass } from "./fields";
import { referralFromSearch } from "@/lib/referral";

const subscribe = () => () => undefined;
const serverMode = () => false;
const selectedMode = () => isCustomerAccountDocument() && new URLSearchParams(window.location.search).get("kundkonto") === "1";

function navigateAccountMode(enabled: boolean) {
  const here = new URL(window.location.href);
  const target = new URL(here.pathname, here.origin);
  const code = referralFromSearch(here.search);
  if (code) target.searchParams.set("ref", code);
  const service = here.searchParams.get("tjanst");
  if (service && /^[a-z0-9-]{1,100}$/.test(service)) target.searchParams.set("tjanst", service);
  if (enabled) target.searchParams.set("kundkonto", "1");
  if (here.pathname === "/butik") target.hash = "presentkort";
  // A full document keeps the password outside already loaded optional tracking scripts.
  window.location.assign(target.href);
}

export function CustomerAccountFlow({ children }: { children: (account: CustomerAccount | null) => ReactNode }) {
  const secure = useSyncExternalStore(subscribe, selectedMode, serverMode);
  const [account, setAccount] = useState<CustomerAccount | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!account?.accessToken) return;
    const timeout = window.setTimeout(() => setAccount({ ...account, accessToken: "" }), Math.max(account.expiresAt - Date.now(), 0));
    return () => window.clearTimeout(timeout);
  }, [account]);
  if (!bookingEnabled) return <>{children(null)}</>;
  if (secure && !account) return (
    <form className="space-y-4 rounded-lia-md border border-hoa-line p-4" onSubmit={async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const fields = new FormData(form);
      setBusy(true); setError("");
      try {
        const verified = await signInCustomer(String(fields.get("customer-email") || ""), String(fields.get("customer-password") || ""));
        form.reset(); setAccount(verified);
      } catch {
        setError("Kontrollera e-postadress och lösenord och att kontots e-postadress är bekräftad.");
      } finally { setBusy(false); }
    }}>
      <h2 className="text-xl">Logga in med ditt LIA-konto</h2>
      <label className="block">E-postadress för kontot<input className={inputClass} name="customer-email" autoComplete="username" type="email" required /></label>
      <label className="block">Lösenord<input className={inputClass} name="customer-password" autoComplete="current-password" type="password" required /></label>
      {error && <p role="alert">{error}</p>}
      <button className={primaryButtonClass} disabled={busy} type="submit">{busy ? "Loggar in…" : "Logga in"}</button>
      <button type="button" className="ml-3 underline" onClick={() => navigateAccountMode(false)}>Fortsätt som gäst</button>
    </form>
  );
  return <div className="space-y-4">
    {account ? <p className="text-sm">{account.accessToken ? `Inloggad som ${account.email}.` : "Din inloggning har gått ut."} <button type="button" className="underline" onClick={() => setAccount(null)}>{account.accessToken ? "Byt konto" : "Logga in igen"}</button></p>
      : <button type="button" className="min-h-11 text-sm underline" onClick={() => navigateAccountMode(true)}>Har du ett LIA-konto? Logga in</button>}
    <Fragment key={account?.userId ?? "guest"}>{children(account)}</Fragment>
  </div>;
}
