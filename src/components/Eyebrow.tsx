export function Eyebrow({
  children,
  tone = "bronze",
}: {
  children: React.ReactNode;
  tone?: "bronze" | "gold";
}) {
  // Mittpunkten följer med ordet före (hårt mellanslag), så att en ny rad aldrig börjar med "·".
  const content = typeof children === "string" ? children.replace(/ · /g, "\u00a0· ") : children;
  return (
    <p
      className={`text-balance text-xs font-semibold uppercase tracking-[0.25em] md:text-sm ${
        tone === "gold" ? "text-hoa-gold" : "text-hoa-bronze"
      }`}
    >
      {content}
    </p>
  );
}
