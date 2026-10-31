import { LongevityPage } from "@/components/LongevityPage";
import { longevity } from "@/lib/content";
import { longevityRobots } from "@/lib/longevity";
import { pageMetadata } from "@/lib/seo";

const content = longevity.blodanalys;
export const metadata = {
  ...pageMetadata({ title: content.title, description: content.metaDescription, path: content.path }),
  robots: longevityRobots(),
};

export default function Page() {
  return <LongevityPage content={content} placement="blodanalys" />;
}
