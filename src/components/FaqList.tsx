import { fitStyle } from "@/lib/heading";
import type { FaqItem } from "@/lib/types";

/**
 * Vanliga frågor som en avdelad lista utan kortboxar, samma på startsidan och /faq.
 * Frågan är minst 48 px hög. På /faq är frågan en h2 för rubrikstrukturen, i normal skiftläge.
 * Långa ord krymper i stället för att brytas (hoa-fit-text, plustecknet räknas bort).
 */
export function FaqList({ items, heading, className = "" }: { items: FaqItem[]; heading?: "h2" | "h3"; className?: string }) {
  const Question = heading ?? "span";
  return (
    <div className={`divide-y divide-hoa-line border-y border-hoa-line ${className}`}>
      {items.map((item) => (
        <details key={item.id} className="group @container">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3 text-hoa-ink [&::-webkit-details-marker]:hidden">
            <Question
              className="hoa-fit-text min-w-0 flex-1 font-display font-bold normal-case tracking-normal text-hoa-ink [--hoa-fit-offset:2.5rem] [--hoa-size:1rem] md:[--hoa-size:1.125rem]"
              style={fitStyle(item.question, false)}
            >
              {item.question}
            </Question>
            <span aria-hidden className="text-xl leading-none text-hoa-ink transition-transform group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="pb-5 leading-relaxed text-hoa-ink-muted">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
