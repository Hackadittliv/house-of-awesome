import Link from "next/link";

import { CtaLink } from "@/components/CtaLink";
import { Disclaimer } from "@/components/Disclaimer";
import { JsonLd } from "@/components/JsonLd";
import { Prose } from "@/components/Prose";
import { Avatar, Card, Grid, Hero, Section } from "@/components/v2/ui";
import { bookingUrl, SHORT_CALL_SLUG } from "@/lib/links";
import { PORTRAITS } from "@/lib/people";
import { breadcrumbJsonLd } from "@/lib/seo";
import type { LongevityPageContent } from "@/lib/types";

export function LongevityPage({ content, placement, portrait = false }: {
  content: LongevityPageContent;
  placement: "anne" | "blodanalys" | "foretag";
  portrait?: boolean;
}) {
  return (
    <>
      <Hero
        eyebrow={content.eyebrow}
        title={content.h1}
        lead={content.lead}
        portrait={portrait ? <Avatar {...PORTRAITS.anne} size="lg" /> : undefined}
      >
        <CtaLink href={bookingUrl(SHORT_CALL_SLUG, `${placement}_hero`)}>{content.cta.buttonLabel}</CtaLink>
      </Hero>

      {content.sections.map((section, index) => (
        <Section
          key={section.id}
          id={section.id}
          titleId={`${section.id}-rubrik`}
          title={section.heading}
          band={(content.sections.length - index) % 2 === 0}
        >
          <div className="mx-auto max-w-3xl space-y-6">
            <Prose>
              {section.body?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.points ? <ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul> : null}
            </Prose>
            {section.steps ? (
              <ol className="space-y-4">
                {section.steps.map((step, stepIndex) => (
                  <li key={step.title}>
                    <Card label={`${stepIndex + 1}`} title={step.title} text={step.text} />
                  </li>
                ))}
              </ol>
            ) : null}
            {section.items ? (
              <Grid cols={2}>
                {section.items.map((item) => <Card key={item.title} title={item.title} text={item.text} />)}
              </Grid>
            ) : null}
            {section.bodyAfter ? <Prose>{section.bodyAfter.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</Prose> : null}
          </div>
        </Section>
      ))}

      <Section band titleId="introduktion" title={content.cta.heading} lead={content.cta.text}>
        <div className="mt-8 text-center">
          <CtaLink href={bookingUrl(SHORT_CALL_SLUG, `${placement}_cta`)}>{content.cta.buttonLabel}</CtaLink>
        </div>
        <Disclaimer text={content.disclaimer} className="mx-auto mt-10" />
        <nav aria-label="Läs vidare" className="mt-8">
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            {content.links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="inline-flex min-h-11 items-center text-hoa-gold underline underline-offset-4">{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </Section>
      <JsonLd data={breadcrumbJsonLd([{ name: "Hem", path: "/" }, { name: content.h1, path: content.path }])} />
    </>
  );
}
