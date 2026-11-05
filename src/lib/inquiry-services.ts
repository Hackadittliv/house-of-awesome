import { getServices } from "@/lib/content";
import { REBECCA } from "@/lib/rebecca";
import { SANDRA } from "@/lib/sandra";

/**
 * Namn för förfrågningar som inte finns i tjänstekatalogen.
 * Katalogen vinner om en slug skulle finnas i båda.
 */
export const extraInquiryLabels: Record<string, string> = {
  event: "Event och lokaler",
  "longevity-resa": "Longevity-resa",
  behandlingsrum: "Hyra behandlingsrum",
  "anne-wevers": "Rådgivning hos Anne Wevers",
  "healing-emht": REBECCA.service,
  "massage-sandra": `${SANDRA.service} hos ${SANDRA.name}`,
};

export function requestServiceNames(): Record<string, string> {
  return {
    ...extraInquiryLabels,
    ...Object.fromEntries(getServices().map((service) => [service.slug, service.name])),
  };
}
