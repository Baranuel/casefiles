'use client'

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/global/Button";
import { useCasesApi } from "@/hooks/use-cases-api";

export function CreateCaseButton({baseUrl}:{baseUrl:string}) {
    const queryClient = useQueryClient();
    const {createCase} = useCasesApi(baseUrl);

  const mutation = useMutation({
    mutationFn: (data:string) => createCase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] })
    },
  });

  return (
    <Button
      onClick={() => mutation.mutate('New Case')}
      isLoading={mutation.isPending}
      loadingText="Creating..."
    >
      Create Case
    </Button>
  );
}