import { useQuery } from "@tanstack/react-query"
import { ElementDto } from "@/types/elements"
import { useElementsApi } from "./use-elements-api"

export const useCaseElementsQuery = (caseId: string) => {
    const api = useElementsApi()

    return useQuery<ElementDto[]>({
        queryKey: ['case-elements', caseId],
        queryFn: () => api.fetchElements(caseId),
        refetchOnMount: true,
        refetchOnWindowFocus: true
    })


}