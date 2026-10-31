/** Egen introduktion för longevitysidorna. Ändrar inte forsta-halsosamtal. */
export const INTRODUCTION_SLUG = "kostnadsfri-introduktion";
export const INTRODUCTION_HREF = `/boka/${INTRODUCTION_SLUG}`;

export function isPendingIntroduction(service: { slug: string; bookable: boolean }): boolean {
  return service.slug === INTRODUCTION_SLUG && !service.bookable;
}
