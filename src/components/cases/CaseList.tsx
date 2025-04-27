import { Case } from "@/types/cases";
import Link from "next/link";

export const CaseList = ({ cases }: { cases: Case[] }) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cases?.map((caseItem) => (
        <Link
          href={`/cases/${caseItem}`}
          key={caseItem.id}
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
  );
};
