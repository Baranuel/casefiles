import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCasesApi } from "./use-cases-api";
import { ElementDto } from "@/types/elements";

export const useCaseElementsMutation = (caseId: string, wsId?:string) => {
    const { createCaseElement, deleteCaseElements } = useCasesApi(wsId);
    const queryClient = useQueryClient();

    const updateMutation = useMutation({
        mutationKey: ['element-mutation', caseId],
        mutationFn: (payload: Omit<ElementDto, 'id'>) => createCaseElement(caseId, payload),

        onMutate: async (newElement) => {
            await queryClient.cancelQueries({ queryKey: ['case-elements', caseId] });
            const previousElements = queryClient.getQueryData<ElementDto[]>(['case-elements', caseId]);
            queryClient.setQueryData<ElementDto[]>(['case-elements', caseId], old =>
                old ? [...old, { ...newElement, id: 'temp-' + Math.random() }] : [{ ...newElement, id: 'temp-' + Math.random() }]
            );

            return { previousElements };
        },

        onError: (_err, _newElement, context) => {
            if (context?.previousElements) {
                queryClient.setQueryData(['case-elements', caseId], context.previousElements);
            }
        },
        onSettled: () => {
            // queryClient.invalidateQueries({ queryKey: ['case-elements', caseId] });
        },
    });

    const deleteAllMutation = useMutation({
        mutationKey: ['element-delete-mutation', caseId],
        mutationFn: () => deleteCaseElements(caseId),
        onSettled: () => {
            // queryClient.setQueryData(['case-elements', caseId], [] as ElementDto[])
            queryClient.invalidateQueries({ queryKey: ['case-elements', caseId] }); 
        }
    })



    return { updateMutation, deleteAllMutation };
};