import { ElementDto } from "@/types/elements";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";


export const usePreviewElement = (caseId: string) => {
    const queryClient = useQueryClient();

    const getPreviewElement = useCallback((elementId: string | null) => {
        if (!elementId) {
            return null
        }
        const previewElement = queryClient.getQueryData<ElementDto[]>(["case-elements", caseId])?.find((element) => element.id === elementId);
        if (!previewElement) {
            return null
        }
        return previewElement;
    }, [caseId, queryClient]);

    return { getPreviewElement };
}