import { CasesApi } from "@/network/cases";
import { useConfig } from "@/providers/ConfigProvider";
// import { Case } from "@/types/cases";
// import { ElementDto } from "@/types/elements";
import { useAuth } from "@clerk/nextjs";

export const useCasesApi = (uniqueWsId?: string) => {
    const { BASE_API_URL } = useConfig()
    const { getToken } = useAuth()

    const casesApi = new CasesApi({
        baseUrl:BASE_API_URL,
        getToken:getToken,
        uniqueWsId
    })

    return casesApi
}