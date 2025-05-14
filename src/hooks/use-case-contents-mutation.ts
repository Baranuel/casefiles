import { UpdateContentDto } from "@/types/contents";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContentsApi } from "./use-contents-api";
import { ElementDto } from "@/types/elements";

export const useCaseContentsMutation = (caseId: string) => {
    const queryClient = useQueryClient();
    const contentsApi = useContentsApi();

    const updateMutation = useMutation({
        mutationFn: (content: UpdateContentDto) => {
            return contentsApi.updateContent(caseId, content);
        },
        onMutate: async (updatedContent) => {
            await queryClient.cancelQueries({ queryKey: ['case-elements', caseId] });
            const previousElements = queryClient.getQueryData<ElementDto[]>(['case-elements', caseId]);

            queryClient.setQueryData<ElementDto[]>(['case-elements', caseId], (old) => {
                if (!old) return previousElements;
                return old.map(element =>
                    element.id === updatedContent.element_id ? {
                        ...element, content: {
                            ...element.content, ...updatedContent.value
                        }
                    } : element
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

    return { updateMutation };
}