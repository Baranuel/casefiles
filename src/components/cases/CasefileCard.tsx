import { Case } from "@/types/cases";
import Link from "next/link";
import { LoaderIcon, Trash2, Users, Clock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCasesApi } from "@/hooks/use-cases-api";

export const CasefileCard = ({ caseItem }: { caseItem: Case }) => {
  const queryClient = useQueryClient();
  const { deleteCase } = useCasesApi();
  const { mutate, isPending } = useMutation({
    mutationFn: deleteCase,
    onSuccess: () => {
      queryClient.setQueryData(["cases"], (old: Case[]) =>
        old.filter((c) => c.id !== caseItem.id)
      );
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
  });

  return (
    <Link
      href={`/cases/${caseItem.id}`}
      className={`group/card relative flex flex-col gap-3 p-4 rounded-lg bg-white
        hover:shadow-sm transition-all 
        ${isPending ? "opacity-50 pointer-events-none" : ""}`}
    >
      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          mutate(caseItem.id);
        }}
        className="absolute right-3 top-3 p-2 rounded-full
          opacity-0 group-hover/card:opacity-100 transition-opacity
          bg-red-50 text-red-600 hover:bg-red-100"
        disabled={isPending}
      >
        {isPending ? (
          <LoaderIcon className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>

      {/* Content */}
      <span className="text-xs font-medium bg-primary-50 text-primary-700  py-1 rounded-full w-fit">
        Active Case
      </span>

      <div>
        <h3 className="font-semibold text-primary-950 mb-1.5 line-clamp-2">
          {caseItem.title}
        </h3>
        <p className="text-sm text-primary-800 line-clamp-2">
          {"No description provided"}
        </p>
      </div>

      <div className="flex gap-4 pt-3 text-xs text-primary-700 border-t border-primary-100">
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          2d ago
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          3 agents
        </span>
      </div>
    </Link>
  );
};
