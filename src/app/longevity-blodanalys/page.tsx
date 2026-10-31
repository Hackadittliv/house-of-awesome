import { notFound } from "next/navigation";

import { LongevityPage } from "@/components/LongevityPage";
import { isLongevityBlocked, LONGEVITY_PUBLISHED, longevityRobots } from "@/lib/longevity";
import { longevity } from "@/lib/longevity-content";
import { pageMetadata } from "@/lib/seo";

const content = longevity.blodanalys;
export const metadata = {
  ...pageMetadata({ title: content.title, description: content.metaDescription, path: content.path }),
  robots: longevityRobots(),
};

export default function Page() {
  if (isLongevityBlocked(LONGEVITY_PUBLISHED, process.env.CONTEXT)) notFound();
  return <LongevityPage content={content} placement="blodanalys" />;
}
