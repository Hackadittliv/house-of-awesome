export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl space-y-4 leading-7 text-hoa-ink-muted [&_a]:text-hoa-gold [&_a]:underline [&_a]:underline-offset-4 [&_h2]:pt-6 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:text-hoa-ink [&_li]:pl-1 [&_strong]:font-medium [&_strong]:text-hoa-ink [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
      {children}
    </div>
  );
}
