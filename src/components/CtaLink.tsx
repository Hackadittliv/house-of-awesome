import Link from "next/link";

type CtaLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  external?: boolean;
};

const variants = {
  primary:
    "bg-hoa-gold text-hoa-bg hover:bg-hoa-gold-hover",
  secondary:
    "border border-hoa-gold text-hoa-gold hover:bg-hoa-gold hover:text-hoa-bg",
  ghost:
    "text-hoa-gold hover:text-hoa-gold-hover underline-offset-4 hover:underline",
};

export function CtaLink({
  href,
  children,
  variant = "primary",
  external,
}: CtaLinkProps) {
  const isExternal = external ?? href.startsWith("http");
  const className = `inline-flex items-center justify-center rounded-sm px-5 py-2.5 text-sm font-medium tracking-wide transition-colors ${variants[variant]}`;

  if (isExternal) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
