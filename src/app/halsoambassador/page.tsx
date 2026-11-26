import Image from "next/image";

import { Container } from "@/components/Container";
import { CtaLink } from "@/components/CtaLink";
import { Section, Steps } from "@/components/v2/ui";
import { fitStyle } from "@/lib/heading";
import { pageMetadata } from "@/lib/seo";

const title = "Bli hälsoambassadör";
const signup = "https://lifeisawesome.se/halsoambassador?fran=hoa#registrera";

export const metadata = pageMetadata({
  title,
  description: "Bli hälsoambassadör utan kostnad. Tipsa personer och företag om tjänster hos House of Awesome och Life Is Awesome och välj kontant ersättning eller Awesome-kredit.",
  path: "/halsoambassador",
});

const steps = [
  { label: "Registrera dig", text: "Du registrerar dig hos Life Is Awesome och bekräftar din e-postadress. Har du redan ett konto där använder du samma konto." },
  { label: "Dela ditt tips", text: "Du får en personlig tipslänk. Dela den med en vän, en kollega eller ett företag som kan ha nytta av någon av våra tjänster." },
  { label: "Få ersättning", text: "När kopplingen till kunden har verifierats gäller den i tolv månader. Under den tiden kan köp från kunden som du själv tipsade ge dig ersättning. Egna köp ger ingen ersättning." },
];

export default function HalsoambassadorPage() {
  return (
    <>
      <section className="hoa-surface-dark py-10 md:py-16">
        <Container className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1.25fr_0.85fr] md:gap-12">
          <div className="@container min-w-0 space-y-6">
            <h1 className="hoa-h1 text-hoa-ink" style={fitStyle(title)}>{title}</h1>
            <p className="max-w-xl text-lg leading-relaxed text-hoa-ink-muted md:text-xl">
              Känner du någon som skulle trivas här? Tipsa personer och företag om alla tjänster hos House of Awesome och Life Is Awesome. Det är kostnadsfritt att bli hälsoambassadör och alla privatpersoner är välkomna.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <CtaLink href={signup}>Registrera mig hos Life Is Awesome</CtaLink>
              <CtaLink href="#ersattning" variant="ghost">Så fungerar ersättningen</CtaLink>
            </div>
          </div>
          <div className="relative aspect-[3/2] overflow-hidden rounded-2xl md:aspect-[4/5]">
            <Image src="/images/patrik-och-alexandra.webp" alt="Patrik och Alexandra, grundarna av Life Is Awesome" fill preload sizes="(min-width: 1152px) 28rem, (min-width: 768px) 39vw, 94vw" className="object-cover object-[center_12%] md:object-center" />
          </div>
        </Container>
      </section>
      <Section title="Från ditt första tips till ersättning" band>
        <Steps steps={steps} />
      </Section>
      <Section id="ersattning" title="Så räknas din ersättning">
        <div className="mx-auto max-w-3xl">
          <p className="text-lg leading-relaxed text-hoa-ink-muted">
            Du väljer mellan 10 % kontant ersättning och 15 % i Awesome-kredit. Vi räknar på den faktiska förtjänsten som verksamheten har granskat och godkänt för tjänsten. Vid förmedling räknar vi på vår mottagna provision efter direkta kostnader.
          </p>
          <h3 className="mt-8 text-xl font-semibold">Om den godkända förtjänsten är 1 000 kr</h3>
          <dl className="mt-4 grid grid-cols-1 gap-5 border-y border-hoa-line py-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-hoa-ink-muted">Kontant ersättning, 10 %</dt>
              <dd className="mt-1 font-display text-4xl font-semibold text-hoa-gold">100 kr</dd>
            </div>
            <div>
              <dt className="text-sm text-hoa-ink-muted">Awesome-kredit, 15 %</dt>
              <dd className="mt-1 font-display text-4xl font-semibold text-hoa-gold">150 kr</dd>
            </div>
          </dl>
          <CtaLink href={signup} className="mt-8">Registrera mig hos Life Is Awesome</CtaLink>
        </div>
      </Section>
    </>
  );
}
