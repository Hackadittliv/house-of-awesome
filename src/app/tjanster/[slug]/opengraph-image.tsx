import { formatDuration, getService, getServices } from "@/lib/content";
import { ogContentType, ogSize, renderOgImage } from "@/lib/og";

export const alt = "Tjänst hos House of Awesome i Stora Höga";
export const size = ogSize;
export const contentType = ogContentType;

export function generateStaticParams() {
  return getServices().map((service) => ({ slug: service.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  const duration = service ? formatDuration(service) : null;

  return renderOgImage({
    eyebrow: duration ? `Tjänst · ${duration}` : "Tjänst",
    title: service?.name ?? "Tjänster",
    subtitle: service?.lead ?? "House of Awesome i Stora Höga",
  });
}
