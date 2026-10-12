// Språkregler för synlig text på sajten. Används av tester och av check-copy.mjs.

export const COPY_RULES = [
  { id: "tankstreck", message: "tankstreck (– eller —)", pattern: /[\u2013\u2014]/u },
  { id: "bindestreck-som-streck", message: "bindestreck mellan mellanslag", pattern: /\s-\s/u },
  { id: "man", message: "ordet 'man'", pattern: /(?<!\p{L})man(?!\p{L})/iu },
  { id: "hen", message: "ordet 'hen'", pattern: /(?<!\p{L})hen(?!\p{L})/iu },
  {
    id: "halsopastaende",
    message: "hälsopåstående",
    pattern:
      /(?<!\p{L})(botar|bota|läker|läkning|inflammation\p{L}*|immunförsvar\p{L}*|anti-?aging|mitokondri\p{L}*|cellförnyelse|föryngra\p{L}*|detox\p{L}*|garanterat|kliniskt bevisa\p{L}*)(?!\p{L})/iu,
  },
  {
    // De medicinska delarna beskrivs med LIA:s formulering: ansvarig, behörig vårdgivare bedömer.
    id: "medicinskt-lofte",
    message: "starkare medicinskt löfte än LIA:s formulering",
    pattern:
      /(?<!\p{L})(?:(?:individuellt\s+)?ordiner\p{L}*\s+(?:individuellt\s+)?av\s+(?:en\s+|vår\s+)?läkare|vår\s+läkare|läkarbedömning\p{L}*)(?!\p{L})/iu,
  },
  {
    // Huset har medicinska delar, så en generell friskrivning om att allt är friskvård blir fel.
    id: "generell-friskrivning",
    message: "generellt påstående om att verksamheten är friskvård eller inte vård",
    pattern: /(?<!\p{L})(?:är\s+inte\s+vård|inte\s+är\s+vård|är\s+friskvård)(?!\p{L})/iu,
  },
  {
    id: "utfallslofte",
    message: "löfte om upplevt resultat",
    pattern: /(?<!\p{L})(?:mer\s+energi|mer\s+ork|många\s+upplever|ger\s+resultat)(?!\p{L})/iu,
  },
  {
    id: "engelsk-ewot",
    message: "skriv EWOT (träning med extra syre)",
    pattern: /exercise\s+with\s+oxygen/iu,
  },
];

export function findCopyViolations(text) {
  const violations = [];
  for (const rule of COPY_RULES) {
    const match = text.match(rule.pattern);
    if (match) {
      const start = Math.max(0, (match.index ?? 0) - 40);
      violations.push({
        rule: rule.id,
        message: rule.message,
        excerpt: text.slice(start, (match.index ?? 0) + match[0].length + 40).replace(/\s+/g, " "),
      });
    }
  }
  return violations;
}
