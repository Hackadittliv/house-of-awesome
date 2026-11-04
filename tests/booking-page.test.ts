import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import BookServicePage from "@/app/boka/[slug]/page";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { getService } from "@/lib/content";

vi.mock("@/lib/booking/config", () => ({ bookingEnabled: true }));
vi.mock("@/components/booking/BookingFlow", () => ({ BookingFlow: vi.fn(() => null) }));

afterEach(() => vi.clearAllMocks());

describe("bokningssidans tjänsteval", () => {
  it.each(["healing-emht", "hbot-60"])("för kliniken från %s till BookingFlow", async (slug) => {
    const service = getService(slug)!;
    const page = await BookServicePage({ params: Promise.resolve({ slug }), searchParams: Promise.resolve({}) });
    renderToStaticMarkup(page);

    expect(BookingFlow).toHaveBeenCalledTimes(1);
    expect(vi.mocked(BookingFlow).mock.calls[0][0]).toMatchObject({
      slug: service.slug,
      clinic: service.clinic,
      serviceName: service.name,
    });
  });
});
