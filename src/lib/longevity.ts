import type { Metadata } from "next";

// Publiceringsvillkor finns i content/README.md.
export const LONGEVITY_PUBLISHED = true;

export function isLongevityBlocked(
  published: boolean = LONGEVITY_PUBLISHED,
  env: { CONTEXT?: string; NODE_ENV?: string; LONGEVITY_PREVIEW?: string } = process.env,
): boolean {
  return !(published || env.CONTEXT === "deploy-preview" || env.CONTEXT === "branch-deploy"
    || env.NODE_ENV === "development" || env.LONGEVITY_PREVIEW === "1");
}

export function longevityRobots(published: boolean = LONGEVITY_PUBLISHED): Metadata["robots"] {
  return published ? undefined : { index: false, follow: false, noimageindex: true };
}
