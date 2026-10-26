import { CtaLink } from "@/components/CtaLink";
import { Bullets, Card, Grid, Hero, Section, Soon, Steps } from "@/components/v2/ui";
import { mailtoUrl } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Longevity-resor",
  description: "Individuella longevity-program i Bohuslän på 3, 7 eller 14 nätter.",
  path: "/longevity-resor",
});

const day = [
  ["06.30", "Andning och kallbad", "Morgonandning och dopp i havet eller kar."],
  ["08.00", "Frukost efter dina värden", "Mat anpassad efter dina mål."],
  ["09.30", "The Awesome Protocol", "Kraft, syre och ljus."],
  ["11.30", "Tryckkammare", "Lugn tid för återhämtning."],
  ["13.00", "Lunch och vila", "Ingen skärm, ingen stress."],
  ["15.00", "Natur eller behandling", "Vandring längs kusten, healing eller vila."],
  ["17.30", "Föreläsning eller samtal", "Sömn, ljus, kost och stress. En kunskap om dagen."],
  ["21.30", "Sömnrutin", "Mörkt, svalt och mätt med wearable."],
];

export default function Page() {
  const inquiry = mailtoUrl("Förfrågan om longevity-resa");
  return (
    <>
      <Hero eyebrow="Longevity-resor i Bohuslän" title="Res hit. Åk hem med en plan." lead="Ett individuellt program på tre nätter till två veckor, med västkustens natur runt omkring.">
        <CtaLink href={inquiry}>Gör en förfrågan</CtaLink>
      </Hero>
      <Section id="program">
        <Grid>
          <Card label="3 nätter" title="Awesome Reset" text="En introduktion till ditt eget protokoll.">
            <Bullets items={["Blodpanel, InBody, HRV", "Läkarsamtal", "Daglig behandling och träning", "Personligt protokoll att ta med hem"]} />
          </Card>
          <Card label="7 nätter" title="Awesome Week" text="Vårt kärnprogram. Tid att bygga nya vanor." featured>
            <Bullets items={["Allt i Reset, plus biologisk ålder", "Två till tre sessioner per dag", "Coachad träning, andning och kyla", "Kost efter dina provsvar", "Uppföljning efter 90 dagar"]} />
          </Card>
          <Card label="14 nätter" title="Awesome Deep" text="För dig som vill gå på djupet.">
            <Bullets items={["Allt i Week", "Utökad diagnostik: gener, metaller, mögel, infektioner", "Mätning före och efter på plats", "Ett års digital uppföljning"]} />
          </Card>
        </Grid>
        <div className="mt-8 text-center"><Soon>Priser per program och boende kommer snart</Soon></div>
      </Section>
      <Section id="resan" eyebrow="Resan i tre delar" title="Före, på plats och efter" band>
        <Steps steps={[
          { label: "Före", text: "Hälsoformulär, videosamtal och tester hemma, så att vi kan börja från dag ett." },
          { label: "På plats", text: "Dag 1 är baslinje. Sedan följer du ditt protokoll, justerat efter hur kroppen svarar." },
          { label: "Efter", text: "Skriftligt protokoll, digital uppföljning och ny mätning efter 90 dagar." },
        ]} />
      </Section>
      <Section id="en-dag" eyebrow="Exempel" title="En dag under Awesome Week">
        <ol className="mx-auto max-w-2xl divide-y divide-hoa-line border-y border-hoa-line">
          {day.map(([time, title, text]) => (
            <li key={time} className="flex gap-6 py-4">
              <span className="w-14 shrink-0 font-display font-bold text-hoa-gold">{time}</span>
              <span><span className="block text-hoa-ink">{title}</span><span className="text-sm text-hoa-ink-muted">{text}</span></span>
            </li>
          ))}
        </ol>
      </Section>
      <Section id="tillval" band>
        <Grid>
          <Card label="Västkusten" title="Naturen som en del av programmet" text="Hav, klippor och skog inom räckhåll. Kallbad, havskajak och vandring." />
          <Card label="Tillval" title="Gör resan till din" text="Medföljande partner, privat coach, extra sessioner och transfer från Landvetter, cirka 45 minuter bort." />
          <Card label="Boende" title="Partnerboenden i närområdet" text="Från enkelt till exklusivt."><Soon>Partners kommer snart</Soon></Card>
        </Grid>
        <div className="mt-8 text-center"><CtaLink href={inquiry}>Gör en förfrågan om longevity-resa</CtaLink></div>
      </Section>
    </>
  );
}
