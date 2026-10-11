import { Container } from "@/components/Container";
import { CtaLink } from "@/components/CtaLink";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
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

  return (
    <Container className="py-16 sm:py-20">
      <PageHeader
        eyebrow="Frågor och svar"
        title="Vanliga frågor"
        lead="Hittar du inte svaret här är du välkommen att mejla oss."
      />

      <div className="mt-12 divide-y divide-hoa-line border-y border-hoa-line">
        {items.map((item) => (
          <details key={item.id} className="group py-2">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3 text-lg text-hoa-ink marker:hidden">
              <h2 className="font-normal">{item.question}</h2>
              <span aria-hidden className="text-hoa-gold transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="max-w-3xl pb-4 leading-7 text-hoa-ink-muted">{item.answer}</p>
          </details>
        ))}
      </div>

      <div className="mt-10">
        <CtaLink href={mailtoUrl("Fråga till House of Awesome")} variant="secondary">
          Mejla en fråga
        </CtaLink>
      </div>

      <JsonLd data={faqJsonLd(items)} />
    </Container>
  );
}
