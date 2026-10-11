import { WELLNESS_DISCLAIMER } from "@/lib/content";

export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`max-w-3xl text-xs leading-5 text-hoa-ink-muted ${className}`}>
      {WELLNESS_DISCLAIMER}
    </p>
  );
}
