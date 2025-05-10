import { ElementsApi } from "@/network/elements"
import { useConfig } from "@/providers/ConfigProvider"
import { useAuth } from "@clerk/nextjs"


export const useElementsApi = (uniqueWsId?: string) => {
    const { BASE_API_URL } = useConfig()
    const { getToken } = useAuth()

    const  elementsApi = new ElementsApi({
        baseUrl: BASE_API_URL,
        getToken: getToken,
        uniqueWsId
    })

    return elementsApi

}