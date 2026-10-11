import Link from "next/link";

type CtaLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

const variants = {
  primary: "bg-hoa-gold text-hoa-bg hover:bg-hoa-gold-hover",
  secondary: "border border-hoa-gold text-hoa-gold hover:bg-hoa-gold hover:text-hoa-bg",
  ghost: "text-hoa-gold hover:text-hoa-gold-hover underline-offset-4 hover:underline",
};

export function CtaLink({ href, children, variant = "primary", className = "" }: CtaLinkProps) {
  const classes = `inline-flex min-h-11 items-center justify-center rounded-sm px-5 py-2.5 text-sm font-medium tracking-wide transition-colors ${variants[variant]} ${className}`;

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
