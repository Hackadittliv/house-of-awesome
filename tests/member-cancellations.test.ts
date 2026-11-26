// @vitest-environment happy-dom
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CancelBooking } from "@/components/booking/CancelBooking";
import { bookingCopy as copy } from "@/lib/booking/copy";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const token = "b47d28f0-424b-4d30-a66b-d6404f6759da";
const preview = { preview: true, preview_token: token };
const card = { house247: true, kind: "card", amount_ore: 55500, voucher_uses: 0 };
const voucher = { house247: true, kind: "voucher", amount_ore: 0, voucher_uses: 1 };
const included = { house247: true, kind: "included", amount_ore: 0, voucher_uses: 0, quota_uses: 1 };
const done = { ok: true, already: false, late: false };
let root: Root | undefined;

async function show(responses: Response[]) {
  const requests: Record<string, unknown>[] = [];
  vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
    expect(url).toMatch(/\/cancel-booking$/);
    requests.push(JSON.parse(String(init.body)));
    const response = responses.shift();
    if (!response) throw new Error("Unplanned request");
    return response;
  }));
  history.replaceState(null, "", "/avboka?avboka=" + token);
  const container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => { root!.render(createElement(CancelBooking)); });
  return { requests, container };
}

async function click(container: HTMLElement, label: string) {
  const button = [...container.querySelectorAll("button")].find(element => element.textContent === label);
  expect(button).toBeDefined();
  await act(async () => { button!.click(); });
}

afterEach(() => {
  act(() => { root?.unmount(); });
  root = undefined;
  document.body.replaceChildren();
  vi.unstubAllGlobals();
});

describe("Avbokning från husets mejllänk", () => {
  it.each([
    { terms: { house247: false }, expected: {}, before: copy.cancelLead, result: {}, after: copy.cancelDoneLead },
    { terms: card, expected: { expected_refund_ore: 55500 }, before: "555", result: { house247_refund: "pending", house247_amount_ore: 55500 }, after: "behandlas" },
    { terms: { ...card, amount_ore: 0 }, expected: { expected_refund_ore: 0 }, before: "ingen återbetalning", result: { house247_refund: "not_due" }, after: "ingen återbetalning" },
    { terms: voucher, expected: { expected_refund_ore: 0, expected_voucher_uses: 1 }, before: "tillbaka ett pass", result: { house247_voucher_uses: 1 }, after: "återförts till ditt klippkort" },
    { terms: { ...voucher, voucher_uses: 0 }, expected: { expected_refund_ore: 0, expected_voucher_uses: 0 }, before: "återförs inget pass", result: { house247_voucher_uses: 0 }, after: "Inget pass har återförts" },
    { terms: { ...voucher, eligible: true, voucher_uses: 0 }, expected: { expected_refund_ore: 0, expected_voucher_uses: 0 }, before: "återförs inget pass", result: { house247_voucher_uses: 0 }, after: "Inget pass har återförts" },
    { terms: included, expected: { expected_refund_ore: 0, expected_voucher_uses: 0, expected_quota_uses: 1 }, before: "tillbaka ett EWOT-pass", result: { house247_quota_uses: 1 }, after: "återförts till din veckokvot" },
    { terms: { ...included, quota_uses: 0 }, expected: { expected_refund_ore: 0, expected_voucher_uses: 0, expected_quota_uses: 0 }, before: "fortfarande mot veckokvoten", result: { house247_quota_uses: 0 }, after: "räknas mot din veckokvot" },
  ])("bekräftar först efter granskning av $before", async ({ terms, expected, before, result, after }) => {
    const { requests, container } = await show([Response.json(terms), Response.json({ ...done, ...result })]);
    expect(requests).toEqual([preview]);
    expect(container.textContent).toContain(before);
    expect(location.search).toBe("");
    await click(container, copy.cancelConfirm);
    expect(requests).toEqual([preview, { cancel_token: token, ...expected }]);
    expect(container.textContent).toContain(after);
    expect(container.querySelector("button")).toBeNull();
  });

  it("kräver en ny bekräftelse om 24-timmarsgränsen passerades", async () => {
    const { requests, container } = await show([
      Response.json(voucher),
      Response.json({ error: "Refund terms changed" }, { status: 409 }),
      Response.json({ ...voucher, voucher_uses: 0 }),
      Response.json({ ...done, house247_voucher_uses: 0, customer_notification_pending: true }),
    ]);
    await click(container, copy.cancelConfirm);
    expect(requests).toEqual([preview, { cancel_token: token, expected_refund_ore: 0, expected_voucher_uses: 1 }, preview]);
    expect(container.textContent).toContain("Villkoren har ändrats");
    expect(container.textContent).toContain("återförs inget pass");
    await click(container, copy.cancelConfirm);
    expect(requests.at(-1)).toEqual({ cancel_token: token, expected_refund_ore: 0, expected_voucher_uses: 0 });
    expect(container.textContent).toContain("Bekräftelsemejlet har ännu inte kunnat bekräftas");
  });

  it.each([
    Response.json({ error: "missing cancel_token" }, { status: 400 }),
    Response.json({ ...included, quota_uses: 2 }),
    Response.json({ ...voucher, amount_ore: 99 }),
  ])("behåller bokningen om förhandsbeskedet saknas eller är ogiltigt", async response => {
    const { requests, container } = await show([response, Response.json(card)]);
    expect(container.textContent).not.toContain(copy.cancelConfirm);
    await click(container, "Försök igen");
    expect(requests).toEqual([preview, preview]);
    expect(container.textContent).toContain(copy.cancelConfirm);
  });
});
