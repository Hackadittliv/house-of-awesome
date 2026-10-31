import { Container } from "@/components/Container";
import { CtaLink } from "@/components/CtaLink";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { Section } from "@/components/v2/ui";
import { getFaqItems } from "@/lib/content";
import { mailtoUrl } from "@/lib/links";
import { faqJsonLd, pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Frågor och svar",
  description:
    "Svar på vanliga frågor om House of Awesome: bokning, priser, medlemskap, hälsodeklaration och var vi finns.",
  path: "/faq",
});

export default function FaqPage() {
  const items = getFaqItems();

  // Samma avdelade lista som på startsidan, på ett krämband som avslutar main.
  return (
    <>
      <Container className="pt-14 pb-12 md:pt-20 md:pb-16">
        <PageHeader
          eyebrow="Frågor och svar"
          title="Vanliga frågor"
          lead="Hittar du inte svaret här är du välkommen att mejla oss."
        />
      </Container>

      <Section band>
        <FaqList items={items} heading="h2" className="mx-auto max-w-3xl" />
        <div className="mt-10 text-center">
          <CtaLink href={mailtoUrl("Fråga till House of Awesome")} variant="secondary">
            Mejla en fråga
          </CtaLink>
        </div>
      </Section>

      <JsonLd data={faqJsonLd(items)} />
    </>
  );
}
