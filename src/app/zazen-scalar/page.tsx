import { Bullets, Hero, Section } from "@/components/v2/ui";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Zazen Scalar",
  description: "Hela House of Awesome ligger i ett Zazen Scalar-fält.",
  path: "/zazen-scalar",
});

// Källa: LIA Professional, partnersidan för ZaZen Health Solutions (lifeisawesome.se), som bygger på tillverkarens produktsidor och tekniska blad.
export default function Page() {
  return (
    <>
      <Hero eyebrow="Fältet" title="Hela huset i ett Zazen Scalar-fält" lead="Zazen Scalar-panelerna finns i hela lokalen och omger dig medan du tränar, vilar och behandlas." />
      <Section title="Vad det är">
        <div className="mx-auto max-w-2xl space-y-6">
          <p className="text-center text-hoa-ink/90">
            Zazen Health Solutions tillverkar Scalar 300 Core och 500 Core, två elektriska wellnessprodukter som tillverkaren kallar scalar-generatorer.
          </p>
          <Bullets
            items={[
              "Två format: en fristående 300 Core och en större kvadratisk 500 Core-panel",
              "Tillverkaren anger 24 V DC matning och högst 24 W effekt för båda modellerna",
              "Kliv in och upplev miljön själv",
            ]}
          />
          <p className="text-center text-sm text-hoa-ink-muted">Vi beskriver tekniken utifrån format och tillverkarens tekniska data, utan medicinska effektlöften.</p>
        </div>
      </Section>
    </>
  );
}
