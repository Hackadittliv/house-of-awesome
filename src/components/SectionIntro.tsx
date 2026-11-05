import { Eyebrow } from "@/components/Eyebrow";
import { HeadingText } from "@/components/HeadingText";
import { fitStyle } from "@/lib/heading";

type SectionIntroProps = {
  id: string;
  eyebrow?: string;
  title: string;
  lead?: React.ReactNode;
  align?: "center" | "left";
  eyebrowTone?: "bronze" | "gold";
  className?: string;
};

export function SectionIntro({
  id,
  eyebrow,
  title,
  lead,
  align = "center",
  eyebrowTone = "bronze",
  className = "",
}: SectionIntroProps) {
  return (
    <div
      className={`@container max-w-3xl space-y-4 ${align === "center" ? "mx-auto text-center" : ""} ${className}`}
    >
      {eyebrow ? <Eyebrow tone={eyebrowTone}>{eyebrow}</Eyebrow> : null}
      <h2 id={id} className="hoa-h2 leading-tight text-hoa-ink" style={fitStyle(title)}>
        <HeadingText text={title} />
      </h2>
      {lead ? (
        <p className="text-lg leading-relaxed text-hoa-ink/80 md:text-xl">{lead}</p>
      ) : null}
    </div>
  );
}
