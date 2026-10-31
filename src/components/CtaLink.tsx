import Link from "next/link";

type CtaLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "lg" | "sm";
  className?: string;
};

const base =
  "inline-flex items-center justify-center gap-2 font-display text-sm font-medium transition-colors";

const sizes = {
  lg: "min-h-12 rounded-full px-8 text-center",
  sm: "min-h-11 rounded-lia-md px-3 py-2",
};

const variants = {
  primary: "bg-hoa-gold text-hoa-espresso hover:bg-hoa-gold/90",
  secondary: "border border-hoa-line bg-hoa-bg text-hoa-ink hover:bg-hoa-hover",
  ghost: "text-hoa-gold underline-offset-4 hover:underline",
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
