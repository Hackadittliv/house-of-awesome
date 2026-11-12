"use client";

import { ClientOnly } from "@/components/booking/ClientOnly";
import { giftCardThanksText, readStoredGiftCardReceipt } from "@/lib/giftcard/giftcard";

function GiftCardThanksText() {
  const text = giftCardThanksText(readStoredGiftCardReceipt());
  if (!text) return null;
  return (
    <p className="text-sm text-hoa-ink" data-testid="giftcard-thanks-value">
      {text}
    </p>
  );
}

export function GiftCardThanksValue() {
  return (
    <ClientOnly>
      <GiftCardThanksText />
    </ClientOnly>
  );
}
