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
    <Container className="py-16 md:py-24">
      <PageHeader
        eyebrow="Frågor och svar"
        title="Vanliga frågor"
        lead="Hittar du inte svaret här är du välkommen att mejla oss."
      />

      <div className="mx-auto mt-12 max-w-3xl space-y-3">
        {items.map((item) => (
          <details
            key={item.id}
            className="group rounded-2xl border border-hoa-gold/20 bg-hoa-secondary/20 px-5 open:border-hoa-gold/40"
          >
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3 text-hoa-ink marker:hidden">
              <h2 className="text-base md:text-lg">{item.question}</h2>
              <span aria-hidden className="text-xl text-hoa-gold transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="pb-5 leading-relaxed text-hoa-ink/80">{item.answer}</p>
          </details>
        ))}
      </div>

      <div className="mt-10 text-center">
        <CtaLink href={mailtoUrl("Fråga till House of Awesome")} variant="secondary">
          Mejla en fråga
        </CtaLink>
      </div>

      <JsonLd data={faqJsonLd(items)} />
    </Container>
  );
}
