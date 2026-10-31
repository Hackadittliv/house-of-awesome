import { CtaLink } from "@/components/CtaLink";
import { Avatar, Card, Grid, Hero, Section, Soon } from "@/components/v2/ui";
import { SHORT_CALL_SLUG, bookingUrl, inquiryUrl, mailtoUrl } from "@/lib/links";
import { PORTRAITS } from "@/lib/people";
import { practitioners } from "@/lib/practitioners";
import { REBECCA } from "@/lib/rebecca";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Behandlingar & samtal",
  description: "Healing, coachning, vägledning, traumaterapi och samtal i House of Awesome.",
  path: "/behandlingar-och-samtal",
});

function Monogram({ name }: { name: string }) {
  const initials = name.split(" ").filter((p) => /^\p{Lu}/u.test(p)).map((p) => p[0]).slice(0, 2).join("");
  return (
    <div aria-hidden className="flex size-16 items-center justify-center rounded-full bg-hoa-secondary/40 font-display text-xl text-hoa-gold">
      {initials}
    </div>
  );
}

export default function Page() {
  const book = bookingUrl(SHORT_CALL_SLUG, "beh_samtal");
  return (
    <>
      <Hero eyebrow="Behandlingar & samtal" title="För kropp och sinne" lead="Healing, bioresonans, coachning och samtal.">
        <CtaLink href={bookingUrl(null, "beh_hero")}>Boka behandling eller samtal</CtaLink>
      </Hero>
      <Section>
        <Grid>
          <Card id="healing" label="Energi" title="Healing" text="Energimedicinsk healingterapi (EMHT) med Rebecca Gustafsson, på plats eller på distans.">
            <ul className="space-y-1 text-sm text-hoa-ink">
              <li><span className="text-hoa-gold">950 kr</span> · 45 min på plats</li>
              <li><span className="text-hoa-gold">750 kr</span> · 45 min på distans</li>
              <li><span className="text-hoa-gold">1 500 kr</span> · 75 min</li>
            </ul>
            <CtaLink href="#rebecca" size="sm" className="mt-auto w-fit">Läs mer och boka</CtaLink>
          </Card>
          <Card id="bioresonans" label="Frekvens" title="Bioresonans">
            <Soon>Mer information kommer snart</Soon>
          </Card>
          <Card id="coachning" label="Livsstil · 1 timme" title="Coachning" price="1 500 kr" text="Vi går igenom träning, stress och återhämtning och gör en plan du faktiskt orkar leva efter.">
            <CtaLink href={bookingUrl("coaching-45", "beh_coaching")} size="sm" className="mt-auto w-fit">Boka coachning</CtaLink>
          </Card>
          <Card id="vagledning" label="Funktionsmedicin · 1 timme" title="Vägledning i funktionsmedicin" price="1 500 kr" text="Ett samtal om din helhet, dina provsvar och relevanta nästa steg. Ett komplement till vården.">
            <CtaLink href={inquiryUrl("funktionsmedicin", "beh_vagledning")} size="sm" className="mt-auto w-fit">Boka vägledning</CtaLink>
          </Card>
          <Card id="samtal" label="Nervsystem & sinne" title="Traumaterapi och samtal" text="Kroppsorienterad bearbetning av stress och trauma i trygg takt. Ett tryggt rum för sinnet, som komplement till vården.">
            <CtaLink href={book} size="sm" className="mt-auto w-fit">Boka samtal</CtaLink>
          </Card>
        </Grid>
      </Section>
      <Section id="rebecca" eyebrow="Healing · EMHT" title={REBECCA.name} lead="Energimedicinsk healingterapi, på plats i huset eller på distans." band>
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-[auto_1fr]">
          <div className="flex justify-center md:block">
            <Avatar {...PORTRAITS.rebecca} size="lg" />
          </div>
          <div className="space-y-5">
            <p className="leading-relaxed text-hoa-ink/90">{REBECCA.intro}</p>
            <ul className="space-y-2 text-sm text-hoa-ink">
              {REBECCA.options.map((o) => (
                <li key={o.label} className="flex justify-between gap-4 border-b border-hoa-line pb-2">
                  <span className="min-w-0">{o.label}</span>
                  <span className="shrink-0 text-hoa-gold">{o.price}</span>
                </li>
              ))}
            </ul>
            <CtaLink href={REBECCA.requestPath} className="w-fit">Skicka förfrågan till Rebecca</CtaLink>
          </div>
        </div>
      </Section>
      <Section id="terapeuter" eyebrow="Terapeuter & coacher" title="Möt dem som arbetar i huset" lead="Varje terapeut och coach har sin egen bokning. Följ länken på kortet.">
        <Grid>
          {practitioners.map((p) => (
            <Card key={p.id} id={p.id} label={p.company ? `${p.role} · ${p.company}` : p.role} title={p.name} text={p.intro}>
              <Monogram name={p.name} />
              {p.services.length ? (
                <ul className="text-sm">
                  {p.services.map((s) => (
                    <li key={s.href}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-between gap-3 py-1 text-hoa-ink underline-offset-4 hover:decoration-2">
                        <span className="min-w-0">{s.name}</span>
                        <span className="shrink-0 text-hoa-gold">{s.price}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <Soon>Bokningslänk kommer snart</Soon>
              )}
              {p.website ? (
                <a href={p.website.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 w-fit items-center text-sm text-hoa-ink underline-offset-4 hover:decoration-2">
                  Läs mer på {p.website.label}
                </a>
              ) : null}
              {p.services.length ? (
                <CtaLink href={p.services[0].href} size="sm" className="mt-auto w-fit">Boka hos {p.name.split(" ")[0]}</CtaLink>
              ) : null}
            </Card>
          ))}
          <Card label="Healing" title="Rebecca Gustafsson" text="Energimedicinsk healingterapi (EMHT). På plats i huset eller på distans.">
            <Avatar {...PORTRAITS.rebecca} />
            <CtaLink href="#rebecca" size="sm" variant="secondary" className="mt-auto w-fit">Läs mer</CtaLink>
          </Card>
          <Card label="Coach" title="Lucas Eliasson" text="Träning, Basläger och The Awesome Protocol, med fokus på en stark kropp som håller hela livet.">
            <Avatar {...PORTRAITS.lucas} />
          </Card>
          <Card label="Är du terapeut?" title="Hyr behandlingsrum" text="Arbeta i ett hus med diagnostik, gym och behandlingar, med kunder som redan söker helhet.">
            <CtaLink href={mailtoUrl("Behandlingsrum i House of Awesome")} size="sm" variant="secondary" className="mt-auto w-fit">Hör av dig</CtaLink>
          </Card>
        </Grid>
      </Section>
    </>
  );
}
