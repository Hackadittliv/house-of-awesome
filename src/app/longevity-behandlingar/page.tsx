import { CtaLink } from "@/components/CtaLink";
import { Bullets, Card, Grid, Hero, Section } from "@/components/v2/ui";
import { SHORT_CALL_SLUG, bookingUrl } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Longevity-behandlingar",
  description: "Celloxy IHHT, tryckkammare, rödljus + PEMF och EWOT i House of Awesome, Stora Höga.",
  path: "/longevity-behandlingar",
});

export default function Page() {
  return (
    <>
      <Hero eyebrow="Longevity-behandlingar · Utrustning" title="Longevity-behandlingar" lead="Återhämtning, syre och ljus med utrustning i framkant. Boka direkt eller prata med oss först.">
        <CtaLink href={bookingUrl(null, "longevity_hero")}>Boka behandling</CtaLink>
        <CtaLink href={bookingUrl(SHORT_CALL_SLUG, "longevity_hero")} variant="secondary">Kostnadsfri rådgivning</CtaLink>
      </Hero>
      <Section>
        <Grid cols={2}>
          <Card id="celloxy-ihht" label="1 · Cellträning utan svett" title="Celloxy IHHT" text={<>
            <p className="mb-3 text-hoa-ink-muted">Intermittent hypoxi-hyperoxi-träning. Växlar mellan 16 och 9 % syre och upp till 36 % syre.</p>
            <p>Tänk höghöjdsträning, fast bekvämt liggande. Du andas växelvis syrefattig och syrerik luft genom en mask. Metoden utgår från forskningen om hur cellerna känner av syre. Allt du behöver göra är att andas och slappna av.</p>
          </>}>
            <Bullets items={["Ett lugnt sätt att arbeta med kondition och uthållighet", "Passar alla, från idrottare till nybörjare och äldre", "Upplevelsen är individuell"]} />
            <p className="text-xs text-hoa-ink-muted">Övervakad session. Lämplighet bedöms före start.</p>
            <CtaLink href={bookingUrl("ihht-50", "longevity_ihht")} size="sm" className="mt-auto w-fit">Boka</CtaLink>
          </Card>
          <Card id="tryckkammare" label="2 · Syre under tryck" title="Tryckkammare (HBOT)" text={<>
            <p className="mb-3 text-hoa-ink-muted">1,5 ATA med 93 till 95 % syre.</p>
            <p>Luta dig tillbaka och vila. En stund av lugn för både kropp och huvud, oavsett om du tränar hårt eller bara vill ge dig själv något extra.</p>
          </>}>
            <Bullets items={["En del av din återhämtning efter träning", "Lugn tid i en avskild miljö", "Upplevelsen är individuell"]} />
            <p className="text-xs text-hoa-ink-muted">Hälsodeklaration före första behandlingen, bland annat för öronproblem och klaustrofobi.</p>
            <CtaLink href={bookingUrl("hbot-60", "longevity_hbot")} size="sm" className="mt-auto w-fit">Boka</CtaLink>
          </Card>
          <Card id="rodljus-pemf" label="3 · Ljus och puls" title="Rödljus + PEMF" text={<p>Rött ljus på 660 nm kombinerat med PEMF. Du ligger bekvämt och slappnar av i en lugn och behaglig behandling.</p>}>
            <Bullets items={["Ett skönt avslut efter träningen", "Särskilt uppskattat under de mörka årstiderna", "Ingår i alla gymmedlemskap"]} />
            <CtaLink href={bookingUrl("redlight-20", "longevity_redlight")} size="sm" className="mt-auto w-fit">Boka</CtaLink>
          </Card>
          <Card id="ewot" label="4 · Syre" title="EWOT" text={<p>Intervallträning med högkoncentrerat syre via mask. Kort, intensivt och tidseffektivt. Hjärtat i The Awesome Protocol.</p>}>
            <Bullets items={["Ett nytt sätt att utmana kondition och uthållighet", "Intensitet anpassad efter din nivå", "Kombinera med rödljus för ett komplett pass"]} />
            <CtaLink href={bookingUrl("ewot-15", "longevity_ewot")} size="sm" className="mt-auto w-fit">Boka</CtaLink>
          </Card>
        </Grid>
      </Section>
    </>
  );
}
