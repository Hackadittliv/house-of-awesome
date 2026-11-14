import Image from "next/image";
import Link from "next/link";

// Lucas Eliassons HOA-logga. Liggande variant i sidhuvudet; vid mycket smal rad bara ugglan.
// Svart på kräm (sidhuvudet är en ljus yta), guld på svart (sidfoten).
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="House of Awesome, startsida"
      className={`inline-flex min-h-11 shrink-0 items-center rounded-lia-md ${className}`}
    >
      <Image
        src="/images/hoa-logo-liggande-svart.webp"
        alt="House of Awesome"
        width={552}
        height={112}
        className="h-11 w-auto sm:h-14 @max-[17.5rem]:hidden"
      />
      <Image
        src="/images/hoa-uggla-svart.webp"
        alt="House of Awesome"
        width={256}
        height={256}
        className="hidden h-10 w-10 @max-[17.5rem]:block"
      />
    </Link>
  );
}

export function LogoMark({ variant, className = "" }: { variant: "svart" | "guld"; className?: string }) {
  return (
    <Image
      src={`/images/hoa-logo-liggande-${variant}.webp`}
      alt="House of Awesome"
      width={552}
      height={112}
      className={`w-auto ${className}`}
    />
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display font-bold tracking-[-0.015em] text-hoa-ink ${className}`}>
      House of <span className="text-hoa-wordmark-accent">Awesome</span>
    </span>
  );
}
