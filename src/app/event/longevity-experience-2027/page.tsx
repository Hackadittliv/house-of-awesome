import { notFound } from "next/navigation";
import { cache } from "react";

import { EventDetail, EventUnavailable } from "@/components/events/EventDetail";
import { Hero } from "@/components/v2/ui";
import { HOA_EVENT_SLUG, readEventCatalog } from "@/lib/events";
import { pageMetadata } from "@/lib/seo";

const loadEvent = cache(async () => {
  const { events, sourceOrigin } = await readEventCatalog();
  const event = events?.find((row) => row.slug === HOA_EVENT_SLUG && row.status === "interest");
  if (events && !event) notFound();
  return { event, sourceOrigin };
});

export async function generateMetadata() {
  const { event, sourceOrigin } = await loadEvent();
  const path = `/event/${HOA_EVENT_SLUG}`;
  return {
    ...pageMetadata({
      title: event?.title ?? "Event hos House of Awesome",
      description: event?.summary ?? "Event tillsammans med Life Is Awesome.",
      path,
      noindex: !event,
    }),
    alternates: { canonical: new URL(path, sourceOrigin).href },
  };
}

export default async function Page() {
  const { event, sourceOrigin } = await loadEvent();
  if (event) return <EventDetail event={event} sourceOrigin={sourceOrigin} />;
  return (
    <>
      <Hero eyebrow="Event" title="Event hos House of Awesome" />
      <EventUnavailable sourceOrigin={sourceOrigin} />
    </>
  );
}
