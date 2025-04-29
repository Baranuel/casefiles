import { Case } from "@/types/cases";
import Link from "next/link";
import { LoaderIcon, Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCasesApi } from "@/hooks/use-cases-api";

interface CasefileCardProps {
  caseItem: Case;
}

export const CasefileCard = ({ caseItem }: CasefileCardProps) => {
  const queryClient = useQueryClient();
  const { deleteCase } = useCasesApi();
  const { mutate, isPending } = useMutation({
    mutationFn: deleteCase,
    onSuccess: () => {
      // Optimistically remove the case from the cache
      queryClient.setQueryData(["cases"], (old: Case[]) =>
        old.filter((c) => c.id !== caseItem.id)
      );
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
  });

  return (
    <Link
      href={`/cases/${caseItem.id}`}
      className={`group/card relative bg-white border border-primary-800/10 rounded-lg p-6 
        max-h-[220px]
        hover:border-primary-600/20 hover:shadow-sm
        transition-all duration-200 ease-in-out
        ${isPending ? "opacity-50 pointer-events-none" : "opacity-100"}`}
    >
      {/* Delete Button - Shows on Hover */}
      <button
        title="Delete Case"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          mutate(caseItem.id);
        }}
        className={`absolute top-3 right-3 p-2 rounded-full 
            md:invisible md:opacity-0
            group-hover/card:visible group-hover/card:opacity-100
            transition-all duration-200
            bg-red-50 text-red-600
            hover:bg-red-100
            visible
            ${isPending && "visible opacity-100"}
            disabled:cursor-not-allowed`}
        disabled={isPending}
      >
        {!isPending ? (
          <Trash2 className="w-4 h-4" />
        ) : (
          <LoaderIcon className="w-4 h-4 animate-spin" />
        )}
      </button>

      <div className="flex flex-col gap-4">
        {/* Status Badge */}
        <div className="flex justify-between items-center">
          <span className="px-2 py-1 text-xs bg-primary-50 text-primary-600 rounded-full">
            Active
          </span>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-primary-900 line-clamp-2">
            {caseItem.title}
          </h3>
          <p className="text-sm text-primary-800/70 line-clamp-2">
            A peculiar case involving a series of mysterious disappearances...
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-4 pt-4 text-xs text-primary-800/60 border-t">
          <span>48h ago</span>
          <span>3 agents</span>
        </div>
      </div>
    </Link>
  );
};
