import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ElementDto } from "@/types/elements";
import { useSocketContext } from "@/providers/SocketProvider";
import { useElementsApi } from "./use-elements-api";

export const useCaseElementsMutation = (caseId: string) => {
    const queryClient = useQueryClient();
    const { uniqueWsId } = useSocketContext()
    const api = useElementsApi(uniqueWsId);

    const createMutation = useMutation({
        mutationKey: ['element-mutation', caseId],
        mutationFn: (payload: ElementDto) => api.createElement(caseId, payload),

        onMutate: async (newElement) => {
            await queryClient.cancelQueries({ queryKey: ['case-elements', caseId] });
            const previousElements = queryClient.getQueryData<ElementDto[]>(['case-elements', caseId]);
            queryClient.setQueryData<ElementDto[]>(['case-elements', caseId], old =>
                old ? [...old, { ...newElement }] : [{ ...newElement }]
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

    const updateMutation = useMutation({
        mutationKey: ['element-mutation', caseId],
        mutationFn: (payload: ElementDto) => api.updateElement(payload.id, payload),

        onMutate: async (updatedElement) => {
            await queryClient.cancelQueries({ queryKey: ['case-elements', caseId] });
            const previousElements = queryClient.getQueryData<ElementDto[]>(['case-elements', caseId]);

            queryClient.setQueryData<ElementDto[]>(['case-elements', caseId], (old) => {
                if (!old) return [updatedElement];
                return old.map(element =>
                    element.id === updatedElement.id ? { ...element, ...updatedElement } : element
                );
            });

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



    return { createMutation, updateMutation };
};