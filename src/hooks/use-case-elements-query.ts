import { useQuery } from "@tanstack/react-query"
import { useCasesApi } from "./use-cases-api"
import { ElementDto } from "@/types/elements"

export const useCaseElementsQuery = (caseId: string) => {
    const { getCaseElements } = useCasesApi()

    return useQuery<ElementDto[]>({
        queryKey: ['case-elements', caseId],
        queryFn: () => getCaseElements(caseId),
        placeholderData: [],
        refetchOnMount:true,
        refetchOnWindowFocus:true
    })
    

}