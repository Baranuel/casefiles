"use client";

import { useCasesApi } from "@/hooks/use-cases-api";
import { useQuery } from "@tanstack/react-query";
import { CasefileCard } from "./CasefileCard";

export const CaseList = () => {
  const { getCases } = useCasesApi();

  const { data, isError, isLoading } = useQuery({
    queryKey: ["cases"],
    queryFn: getCases,
  });

  if (isLoading) {
    return <div className="text-center">Loading cases...</div>;
  }

  if (isError) {
    return <div className="text-center">Error loading cases</div>;
  }

  return (
    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-2">
      {data?.map((caseItem) => (
        <CasefileCard key={caseItem.id} caseItem={caseItem} />
      ))}
    </div>
  );
};
