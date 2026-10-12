"use client";

import { useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

import { Notice } from "@/components/booking/fields";
import { stripePublishableKey } from "@/lib/booking/config";
import { bookingCopy } from "@/lib/booking/copy";

export function EmbeddedCheckout({ clientSecret }: { clientSecret: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(!stripePublishableKey);

  useEffect(() => {
    if (!stripePublishableKey || !container.current) return;
    let destroyed = false;
    let checkout: { destroy: () => void } | null = null;
    (async () => {
      try {
        const stripe = await loadStripe(stripePublishableKey);
        if (!stripe || destroyed) return;
        const instance = await stripe.createEmbeddedCheckoutPage({ fetchClientSecret: async () => clientSecret });
        if (destroyed) {
          instance.destroy();
          return;
        }
        checkout = instance;
        instance.mount(container.current!);
      } catch {
        if (!destroyed) setFailed(true);
      }
    })();
    return () => {
      destroyed = true;
      checkout?.destroy();
    };
  }, [clientSecret]);

  if (failed) return <Notice tone="error">{bookingCopy.paymentUnavailable}</Notice>;
  return <div ref={container} data-testid="stripe-embedded-checkout" className="min-h-96 rounded-lia-md bg-hoa-bone" />;
}
