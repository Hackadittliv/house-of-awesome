import "server-only";

import longevityData from "../../content/longevity.json";
import type { LongevityPageContent } from "@/lib/types";

export const longevity: Record<keyof typeof longevityData, LongevityPageContent> = longevityData;
