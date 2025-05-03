import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCasesApi } from "./use-cases-api";
import { ElementDto } from "@/types/elements";
import { useSocketContext } from "@/providers/SocketProvider";

export const useCaseElementsMutation = (caseId: string) => {
    const {uniqueWsId} = useSocketContext()
    const { createCaseElement, deleteCaseElements } = useCasesApi(uniqueWsId);
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationKey: ['element-mutation', caseId],
        mutationFn: (payload: ElementDto) => createCaseElement(caseId, payload),

        onMutate: async (newElement) => {
            await queryClient.cancelQueries({ queryKey: ['case-elements', caseId] });
            const previousElements = queryClient.getQueryData<ElementDto[]>(['case-elements', caseId]);
            queryClient.setQueryData<ElementDto[]>(['case-elements', caseId], old =>
                old ? [...old, { ...newElement }] : [{...newElement}]
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



    return {createMutation, deleteAllMutation };
};