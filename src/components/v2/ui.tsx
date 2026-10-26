import Image from "next/image";
import type { ReactNode } from "react";

import { Container } from "@/components/Container";
import { CtaLink } from "@/components/CtaLink";
import { Eyebrow } from "@/components/Eyebrow";

export const cardClass = "rounded-2xl border border-hoa-gold/20 bg-hoa-secondary/20 p-6";

export function Hero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <section className="px-4 pt-14 pb-12 text-center md:pt-20 md:pb-16">
      <div className="mx-auto max-w-2xl space-y-5">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1 className="text-4xl leading-tight text-hoa-ink md:text-6xl">{title}</h1>
        {lead ? <p className="text-lg leading-relaxed text-hoa-ink-muted">{lead}</p> : null}
        {children ? <div className="flex flex-col items-center justify-center gap-3 pt-3 sm:flex-row">{children}</div> : null}
      </div>
    </section>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
  band = false,
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  lead?: string;
  children?: ReactNode;
  band?: boolean;
}) {
  return (
    <section id={id} className={`scroll-mt-28 py-14 md:py-20 ${band ? "bg-hoa-secondary/40" : ""}`}>
      <Container>
        {title ? (
          <div className="mx-auto mb-10 max-w-2xl space-y-4 text-center">
            {eyebrow ? <Eyebrow tone={band ? "gold" : "bronze"}>{eyebrow}</Eyebrow> : null}
            <h2 className="text-3xl leading-tight text-hoa-ink md:text-4xl">{title}</h2>
            {lead ? <p className="text-lg leading-relaxed text-hoa-ink-muted">{lead}</p> : null}
          </div>
        ) : null}
        {children}
      </Container>
    </section>
  );
}

export function Grid({ children, cols = 3 }: { children: ReactNode; cols?: 2 | 3 | 4 }) {
  const c = { 2: "md:grid-cols-2", 3: "md:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[cols];
  return <div className={`grid gap-4 ${c}`}>{children}</div>;
}

export type CardImage = { src: string; alt: string };

export function Card({
  id,
  label,
  title,
  text,
  price,
  image,
  children,
  featured = false,
}: {
  id?: string;
  label?: string;
  title: string;
  text?: ReactNode;
  price?: string;
  image?: CardImage;
  children?: ReactNode;
  featured?: boolean;
}) {
  return (
    <article
      id={id}
      className={`flex scroll-mt-28 flex-col gap-3 rounded-2xl p-6 ${
        featured ? "border-2 border-hoa-gold bg-hoa-secondary/30 shadow-gold" : "border border-hoa-gold/20 bg-hoa-secondary/20"
      }`}
    >
      {image ? (
        <div className="relative mb-2 aspect-[4/3] overflow-hidden rounded-xl border border-hoa-gold/20">
          <Image src={image.src} alt={image.alt} fill sizes="(min-width: 768px) 34rem, 90vw" className="object-cover" />
        </div>
      ) : null}
      {label ? <p className="text-xs font-semibold uppercase tracking-[0.25em] text-hoa-bronze">{label}</p> : null}
      <h3 className="text-xl text-hoa-ink">{title}</h3>
      {price ? <p className="font-display text-2xl font-bold text-hoa-gold">{price}</p> : null}
      {text ? <div className="text-sm leading-relaxed text-hoa-ink/80">{text}</div> : null}
      {children}
    </article>
  );
}

export function Avatar({ src, alt, size = "md" }: { src: string; alt: string; size?: "md" | "lg" }) {
  const box = size === "lg" ? "size-40" : "size-24";
  return (
    <div className={`relative ${box} shrink-0 overflow-hidden rounded-full border border-hoa-gold/40 bg-hoa-secondary/40`}>
      <Image src={src} alt={alt} fill sizes={size === "lg" ? "10rem" : "6rem"} className="object-cover object-top" />
    </div>
  );
}

export function Soon({ children = "Kommer snart" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex w-fit items-center rounded-full border border-hoa-line px-3 py-1 text-xs text-hoa-ink-muted">
      {children}
    </span>
  );
}

export function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-sm text-hoa-ink/90">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span aria-hidden className="text-hoa-gold">✓</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Steps({ steps }: { steps: { label: string; title?: string; text: string }[] }) {
  return (
    <ol className="grid gap-4 md:grid-cols-3">
      {steps.map((s, i) => (
        <li key={s.label} className={cardClass}>
          <p className="font-display text-3xl font-bold text-hoa-gold">{i + 1}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.25em] text-hoa-bronze">{s.label}</p>
          {s.title ? <h3 className="mt-2 text-xl text-hoa-ink">{s.title}</h3> : null}
          <p className="mt-2 text-sm leading-relaxed text-hoa-ink/80">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}

export function TwoWays({ bookHref, adviceHref }: { bookHref: string; adviceHref: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card label="Jag vet vad jag vill ha" title="Boka behandling" text="Välj behandling och en ledig tid direkt i bokningen.">
        <CtaLink href={bookHref} className="mt-2 w-full sm:w-fit">Boka behandling</CtaLink>
      </Card>
      <Card label="Jag känner mig osäker" title="Kostnadsfri rådgivning" text="10 minuter där vi lyssnar och föreslår rätt nästa steg. Inget köpkrav." featured>
        <CtaLink href={adviceHref} className="mt-2 w-full sm:w-fit">Boka rådgivning</CtaLink>
      </Card>
    </div>
  );
}
