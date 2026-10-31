import Image from "next/image";
import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="House of Awesome, startsida"
      className={`inline-flex min-h-11 shrink-0 items-center gap-3 rounded-lia-md ${className}`}
    >
      <Image
        src="/images/lia-uggla.webp"
        alt=""
        width={56}
        height={56}
        className="h-10 w-10 sm:h-12 sm:w-12"
      />
      <Wordmark className="text-lg sm:text-xl @max-[17.5rem]:hidden" />
    </Link>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-bold tracking-[-0.015em] text-hoa-ink ${className}`}>
      House of <span className="text-hoa-wordmark-accent">Awesome</span>
    </span>
  );
}
