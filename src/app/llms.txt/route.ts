import {
  HEALTH_DISCLAIMER,
  formatAddress,
  formatDuration,
  formatSek,
  getBookableServices,
  getInquiryServices,
  getMemberships,
  site,
} from "@/lib/content";
import { bookingUrl } from "@/lib/links";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const bookable = getBookableServices()
    .map((service) => {
      const facts = [formatDuration(service), service.priceLabel].filter(Boolean).join(". ");
      return `- [${service.name}](${absoluteUrl(`/tjanster/${service.slug}`)}): ${service.lead} ${facts}. Boka: ${bookingUrl(service.slug, "llms")}`;
    })
    .join("\n");

  const inquiry = getInquiryServices()
    .map((service) => `- [${service.name}](${absoluteUrl(`/tjanster/${service.slug}`)}): ${service.lead}`)
    .join("\n");

  const memberships = getMemberships()
    .map((plan) => `- ${plan.name}: ${formatSek(plan.pricePerMonth)} per månad. ${plan.items.join(", ")}.`)
    .join("\n");

  const body = `# ${site.name}

> ${site.description}

${site.name} är ett hus för träning, återhämtning och longevity på ${formatAddress()}, i Stenungsunds kommun. Huset drivs av ${site.operator.legalName} (org.nr ${site.operator.orgNr}), som också driver ${site.operator.url}. Tidigare namn: ${site.formerName}. Bokning och betalning sker via Life Is Awesome, i en gemensam kalender.

## Kontakt

- Adress: ${formatAddress()}
- Telefon: ${site.contact.phoneDisplay}
- Mejl: ${site.contact.email}
- Öppettider: ${site.hours.members} ${site.hours.staffed}

## Tjänster att boka direkt

${bookable}

## Tjänster efter förfrågan

${inquiry}

## Medlemskap (12 månaders bindningstid)

${memberships}

## Sidor

- [Tjänster](${absoluteUrl("/tjanster")})
- [Medlemskap](${absoluteUrl("/medlemskap")})
- [Om huset](${absoluteUrl("/om")})
- [Besök och kontakt](${absoluteUrl("/besok")})
- [Frågor och svar](${absoluteUrl("/faq")})
- [Integritetspolicy](${absoluteUrl("/integritetspolicy")})

## Viktigt

${HEALTH_DISCLAIMER}
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
