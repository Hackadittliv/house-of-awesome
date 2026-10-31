import { Eyebrow } from "@/components/Eyebrow";
import { HeadingText } from "@/components/HeadingText";
import { fitStyle } from "@/lib/heading";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  lead: string;
};

export function PageHeader({ eyebrow, title, lead }: PageHeaderProps) {
  return (
    <header className="@container mx-auto max-w-3xl space-y-4 text-center">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h1 className="hoa-h1 leading-tight text-hoa-ink" style={fitStyle(title)}>
        <HeadingText text={title} />
      </h1>
      <p className="text-lg leading-relaxed text-hoa-ink-muted md:text-xl">{lead}</p>
    </header>
  );
}
