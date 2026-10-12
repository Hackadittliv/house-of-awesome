import { HEALTH_DISCLAIMER } from "@/lib/content";

export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <p className={`max-w-3xl text-xs leading-5 text-hoa-ink-muted ${className}`}>
      {HEALTH_DISCLAIMER}
    </p>
  );
}
