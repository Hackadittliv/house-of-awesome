import { HEALTH_DISCLAIMER } from "@/lib/content";

export function Disclaimer({ className = "", text = HEALTH_DISCLAIMER }: { className?: string; text?: string }) {
  return (
    <p className={`max-w-3xl text-xs leading-5 text-hoa-ink-muted ${className}`}>
      {text}
    </p>
  );
}
