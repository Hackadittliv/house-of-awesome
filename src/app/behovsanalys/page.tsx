import { AssessmentExperience } from "@/components/assessment/AssessmentExperience";
import { Container } from "@/components/Container";
import { PageHeader } from "@/components/PageHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Behovsanalys",
  description: "Berätta vad du vill komma vidare med. Vi hjälper dig hitta nästa steg för dig själv, ditt hem eller din verksamhet.",
  path: "/behovsanalys",
});

export default function AssessmentPage() {
  return (
    <>
      <Container className="py-14 md:py-20">
        <PageHeader
          eyebrow="Börja där du är"
          title="Hitta rätt hos oss"
          lead="Berätta vad du vill komma vidare med. Vi lyssnar och hjälper dig hitta ditt nästa steg."
        />
      </Container>
      <section className="hoa-surface-light bg-hoa-bg py-14 text-hoa-ink md:py-20" aria-label="Din behovsanalys">
        <Container>
          <AssessmentExperience />
          <noscript>
            <div className="mx-auto max-w-2xl space-y-4">
              <p>Du behöver aktivera JavaScript för att fylla i behovsanalysen här. Du kan också kontakta oss för personlig hjälp.</p>
              <a href="/besok" className="inline-flex min-h-11 items-center">Kontakta oss</a>
            </div>
          </noscript>
        </Container>
      </section>
    </>
  );
}
