import type { AwesomeCreditQuote } from "@/lib/booking/api";
import { formatSek } from "@/lib/content";

type Props = {
  quote: AwesomeCreditQuote;
  selected: boolean;
  disabled: boolean;
  onChange: (selected: boolean) => void;
};

export function AwesomeCreditChoice({ quote, selected, disabled, onChange }: Props) {
  return (
    <fieldset disabled={disabled} className="space-y-3 rounded-lia-md border border-hoa-line bg-hoa-card p-4">
      <legend className="px-1 text-lg font-semibold text-hoa-ink">Awesome-kredit</legend>
      <p className="text-sm text-hoa-ink-muted">Tillgängligt saldo: {formatSek(quote.availableOre / 100)}</p>
      <label className="flex min-h-11 items-center gap-3 text-hoa-ink">
        <input type="checkbox" checked={selected} onChange={(event) => onChange(event.target.checked)} className="size-5 accent-hoa-gold" />
        Använd {formatSek(quote.appliedOre / 100)} av min Awesome-kredit
      </label>
      <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm text-hoa-ink" aria-live="polite" aria-atomic="true">
        <dt>Behandlingens pris</dt><dd className="text-right">{formatSek(quote.priceOre / 100)}</dd>
        <dt>Vald Awesome-kredit</dt><dd className="text-right">{formatSek(selected ? quote.appliedOre / 100 : 0)}</dd>
        <dt className="font-semibold">Kvar att betala</dt><dd className="text-right font-semibold">{formatSek((selected ? quote.remainingOre : quote.priceOre) / 100)}</dd>
      </dl>
    </fieldset>
  );
}
