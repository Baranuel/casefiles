import { Plus } from "lucide-react";
import { PageWrapper } from "@/components/global/PageWrapper";
import { SectionWrapper } from "@/components/global/SectionWrapper";
import { getCases } from "@/actions/cases";
import { CaseList } from "@/components/cases/CaseList";
import { Suspense } from "react";

export default async function CasesPage() {
  const cases = await getCases();

  return (
    <PageWrapper>
      <SectionWrapper>
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold text-primary-800">
              Active Cases
            </h1>
            <p className="text-lg text-primary-800/70">
              Browse through our collection of cases
            </p>
          </div>
          <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg">
            <Plus className="w-5 h-5" />
            <span>New Case</span>
          </button>
        </div>
        <Suspense
          fallback={<div className="text-center">Loading cases...</div>}
        >
          <CaseList cases={cases} />
        </Suspense>
      </SectionWrapper>
    </PageWrapper>
  );
}
