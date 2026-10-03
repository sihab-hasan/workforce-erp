import { useCompanyAbout } from "#features/company/hooks/use-company";
import { CompanyHeroSection } from "#features/company/components/CompanyHeroSection";
import { CompanyStatsSection } from "#features/company/components/CompanyStatsSection";
import { CompanyStorySection } from "#features/company/components/CompanyStorySection";
import { ValuesSection } from "#features/company/components/ValuesSection";
import { LeadershipSection } from "#features/company/components/LeadershipSection";
import { GlobalOfficesSection } from "#features/company/components/GlobalOfficesSection";
import { BenefitsSection } from "#features/company/components/BenefitsSection";
import { CompanyCallToActionSection } from "#features/company/components/CompanyCallToActionSection";

export default function AboutPage() {
  const { data } = useCompanyAbout();

  return (
    <main className="min-h-screen bg-background">
      <CompanyHeroSection company={data.company} />
      <CompanyStatsSection stats={data.stats} />
      <CompanyStorySection story={data.story} />
      <ValuesSection values={data.values} />
      <LeadershipSection leadership={data.leadership} />
      <GlobalOfficesSection offices={data.offices} />
      <BenefitsSection benefits={data.benefits} />
      <CompanyCallToActionSection />
    </main>
  );
}
