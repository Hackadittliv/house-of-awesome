import { LongevityPage } from "@/components/LongevityPage";
import { longevity } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const content = longevity.foretag;
export const metadata = pageMetadata({ title: content.title, description: content.metaDescription, path: content.path });

export default function Page() {
  return <LongevityPage content={content} placement="foretag" />;
}
