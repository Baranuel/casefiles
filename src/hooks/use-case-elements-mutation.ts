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
    });

    const deleteMutation = useMutation({
        mutationKey: ['element-mutation', caseId],
        mutationFn: (elementId: string) => api.deleteElement(elementId),
        onMutate: async (deletedElementId) => {
            await queryClient.cancelQueries({ queryKey: ['case-elements', caseId] });
            const previousElements = queryClient.getQueryData<ElementDto[]>(['case-elements', caseId]);
            queryClient.setQueryData<ElementDto[]>(['case-elements', caseId], (old) => {
                if (!old) return [];
                return old.filter(element => element.id !== deletedElementId);
            });
            return { previousElements };
        },
        onError: (_err, _deletedElementId, context) => {
            if (context?.previousElements) {
                queryClient.setQueryData(['case-elements', caseId], context.previousElements);
            }
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
    });

    const updateBatchMutation = useMutation({
        mutationKey: ['element-mutation', caseId],
        mutationFn: (payload: ElementDto[]) =>
            api.updateBatchElements(caseId, payload),

        onMutate: async (updatedElements) => {
            // 1) Cancel any outgoing refetches (so they don’t overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['case-elements', caseId] });
            const previousElements = queryClient.getQueryData<ElementDto[]>(['case-elements', caseId]);

            queryClient.setQueryData<ElementDto[]>(['case-elements', caseId], (old = []) => {
                const updatesById = new Map(updatedElements.map(el => [el.id, el]));

                return old.map(el =>
                    updatesById.has(el.id)
                        ? { ...el, ...updatesById.get(el.id)! }
                        : el
                );
            });

            // 4) Return the snapshot so we can roll back on error
            return { previousElements };
        },

        onError: (_err, _variables, context) => {
            if (context?.previousElements) {
                queryClient.setQueryData(['case-elements', caseId], context.previousElements);
            }
        },
    });




    return { createMutation, updateMutation, updateBatchMutation, deleteMutation };
};