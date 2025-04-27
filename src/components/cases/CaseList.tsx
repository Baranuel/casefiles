"use client";

import { useCasesApi } from "@/hooks/use-cases-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

export const CaseList = ({baseUrl}:{baseUrl:string}) => {
  const queryClient = useQueryClient();
  const { getCases,deleteCase } = useCasesApi(baseUrl);
  
  const { data, isError, isLoading} = useQuery({
    queryKey: ["cases"],
    queryFn: getCases,
  });

  const deleteMutation = useMutation({
    mutationFn: (caseId: string) => deleteCase(caseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
  });

  console.log(process.env)

  if (isLoading) {
    return <div className="text-center">Loading cases...</div>;
  }

  if (isError) {
    return <div className="text-center">Error loading cases</div>;
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2">
      {data?.map((caseItem) => (
        <Link
          href={`/cases/${caseItem.id}`}
          key={caseItem.id}
          className="bg-white border border-primary-800/10 rounded-lg p-6 
          hover:border-primary-600/20 hover:shadow-sm transition-all max-h-[250px]"
        >
          <div className="flex flex-col gap-4 " onDoubleClick={() => deleteMutation.mutate(caseItem.id)}>
            <div className="flex justify-between items-center">
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
