"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore, type ComponentProps } from "react";

import { LIA_ORIGIN, isReferralDocument, readReferralCode, referralHref, subscribeReferral } from "@/lib/referral";

const noReferral = () => null;
const ordinaryDocument = () => false;
const unchangedDocument = () => () => undefined;
function usePrivateDocument() {
  return useSyncExternalStore(unchangedDocument, isReferralDocument, ordinaryDocument);
}

export function useReferralCode() {
  return useSyncExternalStore(subscribeReferral, readReferralCode, noReferral);
}

type AnchorProps = Omit<ComponentProps<"a">, "href"> & { href: string };

export function ReferralLink({ href, ...props }: AnchorProps) {
  const code = useReferralCode();
  const privateDocument = usePrivateDocument();
  const destination = referralHref(href, code);
  // A fresh document prevents analytics loaded on an ordinary SPA route from following a tip link.
  if (code || privateDocument || /[?&]ref=/.test(destination)) return <a {...props} href={destination} referrerPolicy="no-referrer" />;
  return <Link {...props} href={destination} />;
}

export function ReferralAnchor({ href, ...props }: AnchorProps) {
  const code = useReferralCode();
  const privateDocument = usePrivateDocument();
  return <a {...props} href={referralHref(href, code)} referrerPolicy={code || privateDocument ? "no-referrer" : props.referrerPolicy} />;
}

export function ReferralAccountLink() {
  const pathname = usePathname();
  const code = useReferralCode();
  if (!code || /^\/(?:avboka|boka\/tack|presentkort\/tack)(?:\/|$)/.test(pathname ?? "")) return null;
  return (
    <aside className="bg-hoa-light px-4 py-2 text-center text-sm text-hoa-light-ink">
      Tipskod {code} ·{" "}
      <a className="underline underline-offset-4" href={LIA_ORIGIN + "/medlem/ambassador/tips/" + code} referrerPolicy="no-referrer">
        Se vilka tjänster du kan använda tipskoden för
      </a>
    </aside>
  );
}
