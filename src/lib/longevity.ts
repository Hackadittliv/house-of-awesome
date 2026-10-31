import type { Metadata } from "next";

// Publiceringsvillkor finns i content/README.md.
export const LONGEVITY_PUBLISHED = false;

export function longevityRobots(published: boolean = LONGEVITY_PUBLISHED): Metadata["robots"] {
  return published ? undefined : { index: false, follow: false, noimageindex: true };
}
