import Link from "next/link";

export const inputClass =
  "mt-1 block w-full rounded-lia-md border border-hoa-line bg-hoa-card px-3 py-3 text-base text-hoa-ink placeholder:text-hoa-ink-muted/60 focus:border-hoa-gold focus:outline-none";

export const primaryButtonClass =
  "inline-flex min-h-12 items-center justify-center rounded-full bg-hoa-gold px-8 text-center font-display text-sm font-medium text-hoa-espresso transition-colors hover:bg-hoa-gold/90 disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-hoa-line px-5 font-display text-sm text-hoa-ink transition-colors hover:bg-hoa-bronze disabled:cursor-not-allowed disabled:opacity-40";

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  multiline?: boolean;
};

export function Field({ label, name, type = "text", required, autoComplete, value, onChange, maxLength, multiline }: FieldProps) {
  return (
    <label className="block text-sm text-hoa-ink-muted" htmlFor={name}>
      {label}
      {multiline ? (
        <textarea
          id={name}
          name={name}
          rows={4}
          maxLength={maxLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          autoComplete={autoComplete}
          maxLength={maxLength}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      )}
    </label>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error"; children: React.ReactNode }) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-lia-md border px-4 py-3 text-sm leading-relaxed ${
        tone === "error" ? "border-hoa-danger/60 bg-hoa-danger/10 text-hoa-ink" : "border-hoa-line bg-hoa-card text-hoa-ink-muted"
      }`}
    >
      {children}
    </div>
  );
}

export function PrivacyText({ text, linkLabel }: { text: string; linkLabel: string }) {
  return (
    <p className="text-xs leading-relaxed text-hoa-ink-muted">
      {text}{" "}
      <Link href="/integritetspolicy" className="text-hoa-gold underline-offset-4 hover:underline">
        {linkLabel}
      </Link>
      .
    </p>
  );
}
