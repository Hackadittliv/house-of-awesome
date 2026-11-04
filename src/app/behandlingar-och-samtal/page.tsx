import { CtaLink } from "@/components/CtaLink";
import { Avatar, Card, Grid, Hero, Section, Soon } from "@/components/v2/ui";
import { SHORT_CALL_SLUG, bookingUrl, inquiryUrl, mailtoUrl } from "@/lib/links";
import { PORTRAITS } from "@/lib/people";
import { practitioners } from "@/lib/practitioners";
import { REBECCA } from "@/lib/rebecca";
import { SANDRA } from "@/lib/sandra";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Behandlingar & samtal",
  description: "Healing, svensk klassisk massage, coachning, vägledning, traumaterapi och samtal i House of Awesome.",
  path: "/behandlingar-och-samtal",
});

function Monogram({ name }: { name: string }) {
  const initials = name.split(" ").filter((p) => /^\p{Lu}/u.test(p)).map((p) => p[0]).slice(0, 2).join("");
  return (
    <div aria-hidden className="flex size-16 items-center justify-center rounded-full border border-hoa-gold/40 bg-hoa-secondary/40 font-display text-xl text-hoa-gold">
      {initials}
    </div>
  );
}

export default function Page() {
  const book = bookingUrl(SHORT_CALL_SLUG, "beh_samtal");
  return (
    <>
      <Hero eyebrow="Behandlingar & samtal" title="För kropp och sinne" lead="Healing, svensk klassisk massage, bioresonans, coachning och samtal.">
        <CtaLink href={bookingUrl(null, "beh_hero")}>Boka behandling eller samtal</CtaLink>
      </Hero>
      <Section>
        <Grid>
          <Card id="healing" label="Energi" title="Healing" text="Energimedicinsk healingterapi (EMHT) med Rebecca Gustafsson, på plats eller på distans.">
            <ul className="space-y-1 text-sm text-hoa-ink">
              {REBECCA.options.map((o) => (
                <li key={o.label}><span className="text-hoa-gold">{o.price}</span> · {o.label}</li>
              ))}
            </ul>
            <CtaLink href="#rebecca" size="sm" className="mt-auto w-fit">Läs mer och skicka förfrågan</CtaLink>
          </Card>
          <Card id="massage" label="Kropp" title={SANDRA.service} text={`Massage med ${SANDRA.name}, friskvårdsmassör. ${SANDRA.location}`}>
            <ul className="space-y-1 text-sm text-hoa-ink">
              {SANDRA.options.map((o) => (
                <li key={o.label}><span className="text-hoa-gold">{o.price}</span> · {o.label}</li>
              ))}
            </ul>
            <CtaLink href="#sandra" size="sm" className="mt-auto w-fit">Läs mer och skicka förfrågan</CtaLink>
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
        <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-[auto_1fr]">
          <div className="flex justify-center md:block">
            <Avatar {...PORTRAITS.rebecca} size="lg" />
          </div>
          <div className="space-y-5">
            <p className="leading-relaxed text-hoa-ink/90">{REBECCA.intro}</p>
            <ul className="space-y-2 text-sm text-hoa-ink">
              {REBECCA.options.map((o) => (
                <li key={o.label} className="flex justify-between gap-4 border-b border-hoa-line pb-2">
                  <span>{o.label}</span>
                  <span className="shrink-0 text-hoa-gold">{o.price}</span>
                </li>
              ))}
            </ul>
            <CtaLink href={REBECCA.requestPath} className="w-fit">Skicka förfrågan till Rebecca</CtaLink>
          </div>
        </div>
      </Section>
      <Section id="sandra" eyebrow="Massage · Friskvård" title={SANDRA.name} lead={SANDRA.location} band>
        <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-[auto_1fr]">
          <div className="flex justify-center md:block">
            <Avatar {...PORTRAITS.sandra} size="lg" />
          </div>
          <div className="space-y-5">
            <p className="leading-relaxed text-hoa-ink/90">{SANDRA.intro}</p>
            <h3 className="text-xl text-hoa-ink">{SANDRA.service}</h3>
            <p className="leading-relaxed text-hoa-ink/90">{SANDRA.description}</p>
            <ul className="space-y-2 text-sm text-hoa-ink">
              {SANDRA.options.map((o) => (
                <li key={o.label} className="flex justify-between gap-4 border-b border-hoa-line pb-2">
                  <span>{o.label}</span>
                  <span className="shrink-0 text-hoa-gold">{o.price}</span>
                </li>
              ))}
            </ul>
            <CtaLink href={SANDRA.requestPath} className="w-fit">Skicka förfrågan om massage hos Sandra</CtaLink>
          </div>
        </div>
      </Section>
      <Section id="terapeuter" eyebrow="Terapeuter & coacher" title="Möt dem som arbetar i huset" lead="Följ länken på kortet för förfrågan eller bokning hos respektive terapeut och coach.">
        <Grid>
          {practitioners.map((p) => (
            <Card key={p.id} id={p.id} label={p.company ? `${p.role} · ${p.company}` : p.role} title={p.name} text={p.intro}>
              <Monogram name={p.name} />
              {p.services.length ? (
                <ul className="space-y-1 text-sm">
                  {p.services.map((s) => (
                    <li key={s.href}>
                      <a href={s.href} target="_blank" rel="noopener noreferrer" className="flex justify-between gap-3 text-hoa-ink underline-offset-4 hover:text-hoa-gold hover:underline">
                        <span>{s.name}</span>
                        <span className="shrink-0 text-hoa-gold">{s.price}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <Soon>Bokningslänk kommer snart</Soon>
              )}
              {p.website ? (
                <a href={p.website.href} target="_blank" rel="noopener noreferrer" className="text-sm text-hoa-gold underline-offset-4 hover:underline">
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
          <Card label={SANDRA.role} title={SANDRA.name} text={`${SANDRA.service}. ${SANDRA.location}`}>
            <Avatar {...PORTRAITS.sandra} />
            <CtaLink href="#sandra" size="sm" variant="secondary" className="mt-auto w-fit">Läs mer</CtaLink>
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
