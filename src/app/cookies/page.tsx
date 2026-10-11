import Link from "next/link";

import { Container } from "@/components/Container";
import { CookieSettingsButton } from "@/components/consent/CookieSettingsButton";
import { PageHeader } from "@/components/PageHeader";
import { Prose } from "@/components/Prose";
import { CONSENT_STORAGE_KEY, trackers } from "@/lib/consent";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Cookies",
  description: "Vilka cookies och vilken lagring houseofawesome.se använder, och hur du ändrar ditt val.",
  path: "/cookies",
});

type Row = { name: string; category: string; purpose: string; lifetime: string };

export default function CookiesPage() {
  const rows: Row[] = [
    {
      name: CONSENT_STORAGE_KEY,
      category: "Nödvändig",
      purpose: "Sparar ditt cookieval i webbläsaren (localStorage).",
      lifetime: "Tills du ändrar valet eller rensar webbläsaren",
    },
  ];
  if (trackers.gaMeasurementId) {
    rows.push({
      name: "_ga, _ga_*",
      category: "Analys",
      purpose: "Google Analytics, räknar besök och sidvisningar.",
      lifetime: "Upp till 2 år",
    });
  }
  if (trackers.metaPixelId) {
    rows.push({
      name: "_fbp",
      category: "Marknadsföring",
      purpose: "Meta pixel, mäter annonser i sociala medier.",
      lifetime: "3 månader",
    });
  }

  return (
    <Container className="py-16 sm:py-20">
      <PageHeader
        eyebrow="Integritet"
        title="Cookies"
        lead="Vi frågar innan något annat än det nödvändiga sparas. Inget verktyg för analys eller marknadsföring laddas innan du har sagt ja."
      />

      <div className="mt-12 overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <caption className="sr-only">Cookies och lagring på houseofawesome.se</caption>
          <thead>
            <tr className="border-b border-hoa-gold/50 text-hoa-gold">
              <th scope="col" className="py-3 pr-4 font-medium">Namn</th>
              <th scope="col" className="py-3 pr-4 font-medium">Kategori</th>
              <th scope="col" className="py-3 pr-4 font-medium">Syfte</th>
              <th scope="col" className="py-3 font-medium">Lagringstid</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-b border-hoa-line align-top">
                <td className="py-3 pr-4 font-mono text-hoa-ink">{row.name}</td>
                <td className="py-3 pr-4 text-hoa-ink">{row.category}</td>
                <td className="py-3 pr-4 text-hoa-ink-muted">{row.purpose}</td>
                <td className="py-3 text-hoa-ink-muted">{row.lifetime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10">
        <Prose>
          {rows.length === 1 ? (
            <p>
              Just nu använder sajten inga verktyg för analys eller marknadsföring. Därför finns
              bara den nödvändiga lagringen i tabellen.
            </p>
          ) : null}
          <p>
            När du går vidare till bokningen hamnar du på lifeisawesome.se, som har en egen
            cookiebanner och egna inställningar.
          </p>
          <p>
            Mer om hur vi behandlar personuppgifter finns i vår{" "}
            <Link href="/integritetspolicy">integritetspolicy</Link>.
          </p>
        </Prose>
        <CookieSettingsButton className="mt-8 inline-flex min-h-11 items-center justify-center rounded-sm border border-hoa-gold px-5 py-2.5 text-sm font-medium text-hoa-gold transition-colors hover:bg-hoa-gold hover:text-hoa-bg" />
      </div>
    </Container>
  );
}
