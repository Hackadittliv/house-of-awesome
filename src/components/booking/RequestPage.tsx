"use client";

import { ClientOnly } from "@/components/booking/ClientOnly";
import { RequestForm } from "@/components/booking/RequestForm";

function RequestFromQuery({ services }: { services: Record<string, string> }) {
  const slug = new URLSearchParams(window.location.search).get("tjanst");
  const known = slug && services[slug] ? slug : null;
  return <RequestForm serviceSlug={known} serviceName={known ? services[known] : null} />;
}

/** Läser ?tjanst= i webbläsaren så att sidan kan förrenderas statiskt. */
export function RequestPage({ services }: { services: Record<string, string> }) {
  return (
    <ClientOnly>
      <RequestFromQuery services={services} />
    </ClientOnly>
  );
}
