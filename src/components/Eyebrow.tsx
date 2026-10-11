export function Eyebrow({
  children,
  tone = "bronze",
}: {
  children: React.ReactNode;
  tone?: "bronze" | "gold";
}) {
  return (
    <p
      className={`text-xs font-semibold uppercase tracking-[0.25em] md:text-sm ${
        tone === "gold" ? "text-hoa-gold" : "text-hoa-bronze"
      }`}
    >
      {children}
    </p>
  );
}
