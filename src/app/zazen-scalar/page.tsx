import { Hero, Section, Soon } from "@/components/v2/ui";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Zazen Scalar",
  description: "Hela House of Awesome ligger i ett Zazen Scalar-fält.",
  path: "/zazen-scalar",
});

export default function Page() {
  return (
    <>
      <Hero eyebrow="Fältet" title="Hela huset i ett Zazen Scalar-fält" lead="Zazen Scalar-panelerna finns i hela lokalen och omger dig medan du tränar, vilar och behandlas." />
      <Section title="Vad det är">
        <div className="mx-auto max-w-2xl space-y-6 text-center">
          <p className="text-hoa-ink/90">Zazen Health Solutions tillverkar Scalar 300 Core och 500 Core.</p>
          <Soon>Mer om tekniken kommer snart</Soon>
        </div>
      </Section>
    </>
  );
}
