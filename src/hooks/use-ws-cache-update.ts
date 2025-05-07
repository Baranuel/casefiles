import { ElementDto } from "@/types/elements"
import { useQueryClient } from "@tanstack/react-query"



export const useWsCacheUpdate = (caseId: string) => {

    const queryClient = useQueryClient()

    const wsElementCreate = (queryKey: string, newElement: ElementDto) => {
        const updater = (oldCachedElements: ElementDto[]) => {
            if (oldCachedElements.find(el => el.id === newElement.id)) return
            return [...oldCachedElements, newElement]
        }
        queryClient.setQueryData([queryKey, caseId], updater)
    }


    const wsElementUpdate = (queryKey: string, updatedElement: ElementDto) => {
        const updater = (oldCachedElements: ElementDto[]) => {
            if (!oldCachedElements.find(el => el.id === updatedElement.id)) return

            return [...oldCachedElements.map(el => el.id === updatedElement.id ? { ...el, ...updatedElement } : el)]
        }
        queryClient.setQueryData([queryKey, caseId], updater)
    }
    const wsElementsBatchUpdate = (queryKey: string, updatedElements: ElementDto[]) => {
        const updater = (oldCachedElements: ElementDto[]) => {
            const updatesById = new Map(updatedElements.map(el => [el.id, el]));

            return oldCachedElements.map(el =>
                updatesById.has(el.id)
                    ? { ...el, ...updatesById.get(el.id)! }
                    : el
            );
        }
        queryClient.setQueryData([queryKey, caseId], updater)
    }

    return {
        wsElementCreate,
        wsElementUpdate,
        wsElementsBatchUpdate
    }

}