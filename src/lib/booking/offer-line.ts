type PricedOption = {
  label: string;
  price: string;
};

function sekAmount(price: string): number | null {
  const normalized = price.replaceAll("\u00a0", " ").trim();
  const match = normalized.match(/^(\d{1,3}(?: \d{3})+|\d+) kr$/);
  if (!match) return null;
  return Number(match[1].replaceAll(" ", ""));
}

/** Första tiden i etiketten är passets längd (t.ex. «60 min: … 45 min healing»). */
function minutes(label: string): number | null {
  const match = label.match(/(\d+)\s*min(?:uter)?\b/);
  return match ? Number(match[1]) : null;
}

function minutesLine(values: number[]): string | null {
  const unique = [...new Set(values)].sort((a, b) => a - b);
  if (unique.length === 0) return null;
  if (unique.length === 1) return `${unique[0]} minuter`;
  if (unique.length === 2) return `${unique[0]} eller ${unique[1]} minuter`;
  return `${unique.slice(0, -1).join(", ")} eller ${unique[unique.length - 1]} minuter`;
}

/**
 * Kort underrad av tid och lägsta pris, bara från options.
 * «från» används när alla priser är kronor och de skiljer sig åt.
 * Priser som inte går att läsa som kronor utelämnas, de hittas inte på.
 */
export function optionDetail(options: readonly PricedOption[]): string | null {
  if (options.length === 0) return null;

  const times = minutesLine(options.flatMap((option) => {
    const value = minutes(option.label);
    return value === null ? [] : [value];
  }));

  const samePrice = options.every((option) => option.price === options[0].price);
  const amounts = options.map((option) => sekAmount(option.price));
  let price: string | null = null;
  if (samePrice) {
    price = options[0].price;
  } else if (amounts.every((amount) => amount !== null)) {
    const lowest = options.reduce((best, option) => (sekAmount(option.price)! < sekAmount(best.price)! ? option : best));
    price = `från ${lowest.price}`;
  }

  const line = [times, price].filter(Boolean).join(" · ");
  return line || null;
}
