import { describe, expect, it } from "vitest";

import { bookingCopy } from "@/lib/booking/copy";
import { paymentReceiverLine, sellerLine, sellerTermsUrl } from "@/lib/seller";

import { findCopyViolations } from "../scripts/copy-rules.mjs";

describe("säljaren bakom House of Awesome", () => {
  it("namnger bolag och org.nr", () => {
    expect(sellerLine).toBe("House of Awesome drivs av Life Is Awesome AB, org.nr 559389-8363.");
  });

  it("visar vem som tar emot betalningen så att kontoutdraget går att känna igen", () => {
    expect(paymentReceiverLine).toBe(
      "Betalningen tas emot av Life Is Awesome AB och visas som Life Is Awesome på ditt kontoutdrag.",
    );
    expect(bookingCopy.paymentLead).toContain(paymentReceiverLine);
  });

  it("länkar till köpvillkoren hos Life Is Awesome", () => {
    expect(sellerTermsUrl).toBe("https://lifeisawesome.se/villkor");
  });

  it("följer språkreglerna", () => {
    for (const line of [sellerLine, paymentReceiverLine, bookingCopy.paymentLead]) {
      expect(findCopyViolations(line)).toEqual([]);
      expect(line).not.toMatch(/(?<!\p{L})(inte|sjukt)(?!\p{L})/iu);
    }
  });
});
