import Image from "next/image";

import { Container } from "@/components/Container";
import { CtaLink } from "@/components/CtaLink";
import { Bullets, Card, Grid, Hero, Section } from "@/components/v2/ui";
import { HOA_EVENT_SLUG, liaEventUrl, type CatalogEvent } from "@/lib/events";

export function EventUnavailable({ sourceOrigin }: { sourceOrigin: string }) {
  return (
    <div className="mx-auto max-w-2xl space-y-5 py-8 text-center">
      <p className="text-hoa-ink-muted">
        Eventinformationen kunde inte hämtas just nu. Du kan läsa mer hos Life Is Awesome.
      </p>
      <CtaLink href={liaEventUrl(sourceOrigin, HOA_EVENT_SLUG)} variant="secondary">
        Till eventet hos Life Is Awesome
      </CtaLink>
    </div>
  );
}

type EventProps = { event: CatalogEvent; sourceOrigin: string };

export function EventCard({ event, sourceOrigin }: EventProps) {
  return (
    <Card label="Intresseanmälan öppen" title={event.title} text={event.summary} price={event.price.label}>
      <p className="text-sm text-hoa-ink-muted">
        {event.datesLabel} · {event.timeLabel}
      </p>
      <p className="text-sm text-hoa-ink-muted">
        {event.location.name}, {event.location.city}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <CtaLink href={`/event/${event.slug}`} variant="secondary">
          Se helgens program
        </CtaLink>
        <CtaLink href={liaEventUrl(sourceOrigin, event.slug)}>Anmäl intresse hos Life Is Awesome</CtaLink>
      </div>
    </Card>
  );
}

export function EventDetail({ event, sourceOrigin }: EventProps) {
  return (
    <>
      <Hero eyebrow="House of Awesome" title={event.title} lead={event.summary}>
        <div className="w-full space-y-5">
          <div className="space-y-2">
            <p className="font-display text-lg text-hoa-ink">
              {event.datesLabel} · {event.timeLabel}
            </p>
            <p className="font-display text-2xl text-hoa-gold">{event.price.label}</p>
            <p className="text-sm text-hoa-ink-muted">{event.price.note}</p>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CtaLink href={liaEventUrl(sourceOrigin, event.slug)}>Anmäl intresse hos Life Is Awesome</CtaLink>
            {event.program.length > 0 && (
              <CtaLink href="#program" variant="secondary">
                Se programmet
              </CtaLink>
            )}
          </div>
        </div>
      </Hero>
      <Container>
        <Image
          unoptimized
          src={event.heroImage.src}
          alt={event.heroImage.alt}
          width={1600}
          height={900}
          className="aspect-video w-full rounded-2xl object-cover"
        />
        <dl className="grid grid-cols-1 gap-6 border-b border-hoa-line py-8 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-widest text-hoa-ink-muted">När</dt>
            <dd className="mt-2 font-display text-lg">
              {event.datesLabel}
              <br />
              <span className="text-sm">{event.timeLabel}</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-hoa-ink-muted">Var</dt>
            <dd className="mt-2 font-display text-lg">
              {event.location.name}
              <br />
              <span className="text-sm">
                {event.location.address}, {event.location.city}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-hoa-ink-muted">Pris för helgen</dt>
            <dd className="mt-2 font-display text-2xl text-hoa-gold">{event.price.label}</dd>
            <dd className="mt-2 text-sm text-hoa-ink-muted">{event.price.note}</dd>
          </div>
        </dl>
      </Container>
      <Section title={event.introduction.heading}>
        <p className="mx-auto max-w-3xl whitespace-pre-line text-lg leading-relaxed text-hoa-ink-muted">
          {event.introduction.text}
        </p>
      </Section>
      {event.experiences.length > 0 && (
        <Section title="Det här får du uppleva" band>
          <Grid>
            {event.experiences.map((item, i) => (
              <Card key={i} title={item.title} text={item.text} />
            ))}
          </Grid>
        </Section>
      )}
      {event.program.length > 0 && (
        <Section id="program" eyebrow="Helgen" title="Preliminärt program">
          <div className="mx-auto max-w-3xl divide-y divide-hoa-line">
            {event.program.map((item, i) => (
              <article key={i} className="grid gap-3 py-7 sm:grid-cols-[10rem_1fr]">
                <p className="text-sm text-hoa-gold">
                  {item.day}
                  <br />
                  {item.date}
                </p>
                <div>
                  <h3 className="font-display text-xl">{item.title}</h3>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-hoa-ink-muted">
                    {item.text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </Section>
      )}
      {event.hosts.length > 0 && (
        <Section title="Du möter" band>
          <Grid cols={2}>
            {event.hosts.map((host, i) => (
              <Card
                key={i}
                title={host.name}
                label={host.role}
                text={
                  <>
                    {host.image && (
                      <Image
                        unoptimized
                        src={host.image}
                        alt={host.name}
                        width={400}
                        height={400}
                        className="mb-5 aspect-square w-full rounded-xl object-cover object-top"
                      />
                    )}
                    <span className="whitespace-pre-line">{host.text}</span>
                  </>
                }
              />
            ))}
          </Grid>
        </Section>
      )}
      <Section title="Bra att veta">
        <div className="grid gap-10 md:grid-cols-2">
          {event.included.length > 0 && (
            <div>
              <h3 className="mb-5 font-display text-xl">Det här ingår</h3>
              <Bullets items={event.included} />
            </div>
          )}
          {event.pending.length > 0 && (
            <div>
              <h3 className="mb-5 font-display text-xl">Detaljer som återstår att bekräfta</h3>
              <ul className="space-y-3 text-sm text-hoa-ink-muted">
                {event.pending.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Section>
      {event.faq.length > 0 && (
        <Section title="Frågor och svar" band>
          <div className="mx-auto max-w-3xl divide-y divide-hoa-line">
            {event.faq.map((item, i) => (
              <details key={i} className="py-5">
                <summary className="cursor-pointer font-display text-lg">{item.question}</summary>
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-hoa-ink-muted">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </Section>
      )}
      <Section id="intresse" title="Intresseanmälan">
        <div className="mx-auto max-w-xl space-y-6 text-center">
          <p className="text-hoa-ink-muted">
            Lämna ditt intresse hos Life Is Awesome så får du besked om bokningsöppningen. Intresseanmälan är
            kostnadsfri och innebär ingen platsbokning.
          </p>
          <CtaLink href={liaEventUrl(sourceOrigin, event.slug)}>Anmäl intresse hos Life Is Awesome</CtaLink>
        </div>
      </Section>
    </>
  );
}
