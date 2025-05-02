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

    return {
        wsElementCreate
    }

}