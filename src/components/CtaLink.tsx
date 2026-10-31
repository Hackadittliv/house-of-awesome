import Link from "next/link";

type CtaLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "lg" | "sm";
  className?: string;
};

const base =
  "inline-flex max-w-full items-center justify-center gap-2 font-display text-sm font-medium transition-colors";

// px-6 på mobil så att etiketter som "Boka kostnadsfritt samtal med Patrik" ryms på en rad vid 360 px.
const sizes = {
  lg: "min-h-12 rounded-full px-6 text-center sm:px-8",
  sm: "min-h-11 rounded-lia-md px-3 py-2",
};

// Ghost är en textlänk i ytans textfärg: svart på kräm och kräm på svart, alltid understruken.
const variants = {
  primary: "bg-hoa-gold text-hoa-espresso no-underline hover:bg-hoa-gold/90",
  secondary: "border border-hoa-line bg-hoa-bg text-hoa-ink no-underline hover:bg-hoa-hover",
  ghost: "text-hoa-ink underline underline-offset-4 hover:decoration-2",
};

export function CtaLink({
  href,
  children,
  variant = "primary",
  size = "lg",
  className = "",
}: CtaLinkProps) {
  const classes =
    variant === "ghost"
      ? `${base} min-h-11 ${variants.ghost} ${className}`
      : `${base} ${sizes[size]} ${variants[variant]} ${className}`;

  if (/^(https?:|mailto:|tel:)/.test(href)) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
