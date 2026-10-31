import { notFound } from "next/navigation";

import { LongevityPage } from "@/components/LongevityPage";
import { isLongevityBlocked, longevityRobots } from "@/lib/longevity";
import { longevity } from "@/lib/longevity-content";
import { pageMetadata } from "@/lib/seo";

const content = longevity.blodanalys;
export function generateMetadata() {
  if (isLongevityBlocked()) notFound();
  return {
    ...pageMetadata({ title: content.title, description: content.metaDescription, path: content.path }),
    robots: longevityRobots(),
  };
}

export default function Page() {
  if (isLongevityBlocked()) notFound();
  return <LongevityPage content={content} placement="blodanalys" />;
}
