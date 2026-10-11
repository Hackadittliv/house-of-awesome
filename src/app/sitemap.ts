import type { MetadataRoute } from "next";

import { getServices, servicesSnapshot } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

const CONTENT_UPDATED = new Date("2026-10-11");

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { path: string; priority: number }[] = [
    { path: "/", priority: 1 },
    { path: "/tjanster", priority: 0.9 },
    { path: "/medlemskap", priority: 0.9 },
    { path: "/om", priority: 0.7 },
    { path: "/besok", priority: 0.8 },
    { path: "/faq", priority: 0.6 },
    { path: "/integritetspolicy", priority: 0.2 },
    { path: "/cookies", priority: 0.2 },
  ];

  const servicesUpdated = new Date(servicesSnapshot.fetchedAt);

  return [
    ...pages.map(({ path, priority }) => ({
      url: absoluteUrl(path),
      lastModified: CONTENT_UPDATED,
      priority,
    })),
    ...getServices().map((service) => ({
      url: absoluteUrl(`/tjanster/${service.slug}`),
      lastModified: service.bookable ? servicesUpdated : CONTENT_UPDATED,
      priority: service.bookable ? 0.8 : 0.6,
    })),
  ];
}
