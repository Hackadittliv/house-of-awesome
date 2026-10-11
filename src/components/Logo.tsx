import Image from "next/image";
import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex shrink-0 items-center gap-2.5 font-display text-lg tracking-wide text-hoa-ink ${className}`}
    >
      <Image src="/images/lia-uggla.webp" alt="" width={36} height={36} className="h-9 w-9" />
      <span>
        House of <span className="text-hoa-gold">Awesome</span>
      </span>
    </Link>
  );
}
