import { Eyebrow } from "@/components/Eyebrow";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  lead: string;
};

export function PageHeader({ eyebrow, title, lead }: PageHeaderProps) {
  return (
    <header className="mx-auto max-w-3xl space-y-4 text-center">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h1 className="text-3xl leading-tight text-hoa-ink md:text-5xl">{title}</h1>
      <p className="text-lg leading-relaxed text-hoa-ink-muted md:text-xl">{lead}</p>
    </header>
  );
}
