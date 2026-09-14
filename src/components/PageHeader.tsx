type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  lead: string;
};

export function PageHeader({ eyebrow, title, lead }: PageHeaderProps) {
  return (
    <header className="max-w-2xl">
      {eyebrow ? (
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-hoa-gold">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-display text-4xl leading-tight text-hoa-ink sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 text-base leading-7 text-hoa-ink-muted sm:text-lg">
        {lead}
      </p>
    </header>
  );
}
