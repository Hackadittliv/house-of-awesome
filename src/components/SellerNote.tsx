import { sellerLine, sellerTermsUrl, termsLabel } from "@/lib/seller";

export function SellerNote({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-hoa-ink-muted ${className}`.trim()}>
      {sellerLine}{" "}
      <a href={sellerTermsUrl} className="underline hover:text-hoa-gold">{termsLabel}</a>
    </p>
  );
}
