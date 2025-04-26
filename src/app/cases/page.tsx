import { Plus } from "lucide-react";
import { PageWrapper } from "@/components/global/PageWrapper";
import { SectionWrapper } from "@/components/global/SectionWrapper";
import Link from "next/link";

export default async function CasesPage() {
  return (
    <PageWrapper>
      <SectionWrapper>
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold text-primary-800">Active Cases</h1>
            <p className="text-lg text-primary-800/70">Browse through our collection of cases</p>
          </div>
          <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg">
            <Plus className="w-5 h-5" />
            <span>New Case</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((caseItem) => (
            <Link 
              href={`/cases/${caseItem}`}
              key={caseItem}
              className="bg-white border border-primary-800/10 rounded-lg p-6 
                hover:border-primary-600/20 hover:shadow-sm transition-all"
            >
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm text-primary-800">
                    #{String(caseItem).padStart(3, "0")}
                  </span>
                  <span className="px-2 py-1 text-xs bg-primary-50 text-primary-600 rounded-full">
                    Active
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-primary-900">
                  The Mystery of the Dancing Detective
                </h3>
                <p className="text-sm text-primary-800/70 line-clamp-2">
                  A peculiar case involving a series of mysterious disappearances...
                </p>

                {/* Footer */}
                <div className="flex gap-4 pt-4 text-xs text-primary-800/60 border-t">
                  <span>48h ago</span>
                  <span>3 agents</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </SectionWrapper>
    </PageWrapper>
  );
}
