import { HeadingText } from "@/components/HeadingText";
import { fitStyle } from "@/lib/heading";

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="@container max-w-3xl space-y-4 leading-7 text-hoa-ink-muted [&_a]:text-hoa-gold [&_a]:underline [&_a]:underline-offset-4 [&_h2]:pt-6 [&_h2]:hoa-h2-prose [&_h2]:text-hoa-ink [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-hoa-ink [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
      {children}
    </div>
  );
}

/** Mellanrubrik i Prose. Långa ord som PERSONUPPGIFTSANSVARIG krymper så att de ryms på en rad. */
export function ProseHeading({ children }: { children: string }) {
  return (
    <h2 style={fitStyle(children)}>
      <HeadingText text={children} />
    </h2>
  );
}
