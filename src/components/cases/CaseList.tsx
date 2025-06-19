"use client";

import { useCasesApi } from "@/hooks/use-cases-api";
import { useQuery } from "@tanstack/react-query";
import { CasefileCard } from "./CasefileCard";

export const CaseList = () => {
  const api = useCasesApi();

  const { data, error, isError, isLoading } = useQuery({
    queryKey: ["cases"],
    queryFn: () => api.fetchCases(),
  });

  if (isLoading) {
    return <div className="text-center">Loading cases...</div>;
  }

  if (isError) {
    console.log(error);
    return <div className="text-center">Error loading cases</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] py-12">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            className="text-amber-400"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="3"
              y="5"
              width="18"
              height="14"
              rx="3"
              fill="currentColor"
              fillOpacity="0.15"
            />
            <rect
              x="7"
              y="9"
              width="10"
              height="2"
              rx="1"
              fill="currentColor"
            />
            <rect
              x="7"
              y="13"
              width="6"
              height="2"
              rx="1"
              fill="currentColor"
            />
          </svg>
        <h2 className="text-xl font-semibold text-amber-900 mb-2">
          No cases found
        </h2>
        <p className="text-amber-800/80 mb-4 text-center max-w-xs">
          You haven&apos;t created any detective cases yet.
          <br />
          Click{" "}
          <span className="font-semibold text-amber-900">Create Case</span> to
          get started!
        </p>
      </div>
    );
  }

  return (
    <div className="grid  grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 ">
      {data?.map((caseItem) => (
        <CasefileCard key={caseItem.id} caseItem={caseItem} />
      ))}
    </div>
  );
};
