import { Container } from "@/components/Container";
import { CtaLink } from "@/components/CtaLink";
import { PageHeader } from "@/components/PageHeader";
import { formatSek, getMemberships, site } from "@/lib/content";
import { mailtoUrl, membershipUrl } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Medlemskap",
  description:
    "Fyra medlemskap i House of Awesome från 599 kr per månad. Gym dygnet runt, rödljus och The Awesome Protocol. 12 månaders bindningstid.",
  path: "/medlemskap",
});

const common = [
  "Gymmet dygnet runt, alla dagar",
  "Introduktion och individanpassad träningsplan",
  "12 månaders bindningstid",
];

export default function MedlemskapPage() {
  const plans = getMemberships();

  return (
    <Container className="py-16 md:py-24">
      <PageHeader
        eyebrow="Medlemskap"
        title="Din hälsa, på dina villkor"
        lead="Alla medlemskap ger gymmet dygnet runt och en träningsplan. Skillnaden är hur mycket rödljus och hur många pass med The Awesome Protocol som ingår."
      />

      <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <li
            key={plan.priceId}
            className={`flex flex-col rounded-2xl bg-hoa-secondary/20 p-5 md:p-6 ${
              plan.featured ? "border-2 border-hoa-gold shadow-gold" : "border border-hoa-gold/20"
            }`}
          >
            {plan.featured ? (
              <p className="mb-3 self-start rounded-full bg-hoa-gold px-3 py-1 text-xs font-semibold text-hoa-espresso">
                Mest valt
              </p>
            ) : null}
            <h2 className="text-xl text-hoa-ink md:text-2xl">{plan.name}</h2>
            <p className="mt-3 font-display text-3xl font-bold text-hoa-gold">
              {formatSek(plan.pricePerMonth)}
              <span className="font-sans text-base font-normal text-hoa-ink-muted"> per månad</span>
            </p>
            <p className="mt-2 text-sm text-hoa-ink-muted">{plan.tagline}</p>
            <ul className="mt-5 flex-1 space-y-2">
              {plan.items.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-hoa-ink">
                  <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-hoa-gold" />
                  {item}
                </li>
              ))}
            </ul>
            {plan.spots ? (
              <p className="mt-4 text-xs font-semibold text-hoa-gold">Endast {plan.spots} platser.</p>
            ) : null}
            <CtaLink
              href={membershipUrl(plan.priceId, "membership_page")}
              variant={plan.featured ? "primary" : "secondary"}
              className="mt-6 w-full"
            >
              Välj {plan.name}
            </CtaLink>
          </li>
        ))}
      </ul>

      <section aria-labelledby="ingar-alltid" className="mt-14 grid gap-8 border-t border-hoa-line pt-10 lg:grid-cols-2">
        <div>
          <h2 id="ingar-alltid" className="text-2xl text-hoa-ink md:text-3xl">
            Ingår i alla medlemskap
          </h2>
          <ul className="mt-5 space-y-2">
            {common.map((item) => (
              <li key={item} className="flex gap-3 text-hoa-ink">
                <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-hoa-gold" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4 text-sm leading-6 text-hoa-ink-muted">
          <p>
            Medlemskapet köps och hanteras hos Life Is Awesome, som driver House of Awesome. Där
            loggar du in, ser dina pass och hämtar kvitto.
          </p>
          <p>
            Villkoren för medlemskap finns hos{" "}
            <a href={site.operator.termsUrl} className="text-hoa-gold underline underline-offset-4">
              Life Is Awesome
            </a>
            .
          </p>
          <CtaLink href={mailtoUrl("Fråga om medlemskap")} variant="ghost" className="px-0">
            Frågor om medlemskap? Mejla oss
          </CtaLink>
        </div>
      </section>
    </Container>
  );
}
