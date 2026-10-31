import Link from "next/link";

import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { Prose, ProseHeading } from "@/components/Prose";
import { site } from "@/lib/content";
import { trackers } from "@/lib/consent";
import { mailtoUrl } from "@/lib/links";
import { paymentReceiverLine } from "@/lib/seller";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Integritetspolicy",
  description: `Så behandlar ${site.operator.legalName} personuppgifter på houseofawesome.se.`,
  path: "/integritetspolicy",
});

const UPDATED = "11 oktober 2026";

export default function IntegritetspolicyPage() {
  const { operator, contact } = site;
  const anyTracker = Boolean(trackers.gaMeasurementId || trackers.metaPixelId);

  return (
    <Container className="py-14 md:py-20">
      <PageHeader
        eyebrow="Integritet"
        title="Integritetspolicy"
        lead={`Här beskriver vi hur ${operator.legalName} behandlar personuppgifter när du besöker houseofawesome.se.`}
      />

      <div className="mt-12">
        <Prose>
          <ProseHeading>Personuppgiftsansvarig</ProseHeading>
          <p>
            <strong>{operator.legalName}</strong>, org.nr {operator.orgNr},{" "}
            {`${operator.registeredAddress}, driver House of Awesome och är personuppgiftsansvarig.`} Du når oss på{" "}
            <a href={mailtoUrl("Integritet")}>{contact.email}</a>.
          </p>

          <ProseHeading>Bokning, betalning och medlemskap</ProseHeading>
          <p>
            När du bokar en tid, köper ett presentkort eller medlemskap eller fyller i en hälsodeklaration
            behandlas uppgifterna av {operator.legalName} i samma bokningssystem som lifeisawesome.se.{" "}
            {paymentReceiverLine} Vilka uppgifter som samlas in, varför och hur länge de sparas står i{" "}
            <a href={operator.privacyPolicyUrl}>integritetspolicyn hos Life Is Awesome</a>.
          </p>

          <ProseHeading>Vad vi behandlar på den här sajten</ProseHeading>
          <ul>
            <li>
              <strong>Tekniska uppgifter.</strong> När du besöker sajten sparar vår leverantör av
              webbhotell, Netlify, tekniska loggar med bland annat adressen till din uppkoppling (IP),
              webbläsare och tidpunkt. Syftet är drift och säkerhet. Rättslig grund är vårt berättigade intresse av
              en säker och fungerande sajt. Loggarna sparas under en begränsad tid.
            </li>
            <li>
              <strong>Ditt cookieval.</strong> Vi sparar ditt val om cookies i din webbläsare så
              att vi inte behöver fråga igen. Det är nödvändigt för att valet ska gälla.
            </li>
            <li>
              <strong>Analys och marknadsföring.</strong>{" "}
              {anyTracker
                ? "Används bara om du har gett ditt samtycke. Rättslig grund är samtycke, och du kan när som helst ändra dig under Cookieinställningar längst ner på sidan."
                : "Just nu använder vi inga verktyg för analys eller marknadsföring på sajten. Om vi börjar göra det laddas de bara efter ditt samtycke."}{" "}
              Se även <Link href="/cookies">cookies</Link>.
            </li>
            <li>
              <strong>När du kontaktar oss.</strong> Mejlar eller ringer du oss behandlar vi dina
              kontaktuppgifter och det du berättar, för att kunna svara. Rättslig grund är vårt
              berättigade intresse av att besvara frågor. Vi sparar uppgifterna så länge det behövs
              för ärendet.
            </li>
          </ul>
          <p>Den här sajten har inga formulär och inga konton.</p>

          <ProseHeading>Mottagare</ProseHeading>
          <p>
            Netlify driver sajten åt oss som personuppgiftsbiträde. Netlify är ett amerikanskt
            företag, och överföring sker med stöd av EU:s standardavtalsklausuler.
            {trackers.gaMeasurementId
              ? " Med ditt samtycke tar Google emot uppgifter för analys."
              : ""}
            {trackers.metaPixelId
              ? " Med ditt samtycke tar Meta emot uppgifter för att mäta annonser."
              : ""}{" "}
            Vi säljer aldrig dina uppgifter.
          </p>

          <ProseHeading>Dina rättigheter</ProseHeading>
          <p>
            Du har rätt att få veta vilka uppgifter vi har om dig, att få dem rättade eller
            raderade, att begränsa eller invända mot behandlingen och att få ut dina uppgifter i ett
            maskinläsbart format. Har du gett samtycke kan du när som helst återkalla det. Kontakta
            oss på <a href={mailtoUrl("Mina personuppgifter")}>{contact.email}</a>.
          </p>
          <p>
            Om du är missnöjd med hur vi behandlar dina uppgifter kan du klaga hos
            Integritetsskyddsmyndigheten, <a href="https://www.imy.se">imy.se</a>.
          </p>

          <p className="pt-6 text-sm">Senast uppdaterad {UPDATED}.</p>
        </Prose>
      </div>
    </Container>
  );
}
