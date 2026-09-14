import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { getFaqItems } from "@/lib/content";

export const metadata: Metadata = {
  title: "FAQ",
};

export default function FaqPage() {
  const items = getFaqItems();

  return (
    <Container className="py-16 sm:py-20">
      <PageHeader
        eyebrow="Frågor"
        title="Vanliga frågor"
        lead="Korta svar för fas 1. Inga medicinska påståenden och inga påhittade priser."
      />

      <dl className="mt-12 divide-y divide-hoa-line border-y border-hoa-line">
        {items.map((item) => (
          <div key={item.id} className="grid gap-3 py-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
            <dt className="text-hoa-ink">{item.question}</dt>
            <dd className="text-sm leading-6 text-hoa-ink-muted">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </Container>
  );
}
