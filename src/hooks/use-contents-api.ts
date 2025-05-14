import { ContentsApi } from "@/network/contents"
import { useConfig } from "@/providers/ConfigProvider"
import { useAuth } from "@clerk/nextjs"

export const useContentsApi = (uniqueWsId?: string) => {
    const { BASE_API_URL } = useConfig()
    const { getToken } = useAuth()

    const contentsApi = new ContentsApi({
        baseUrl: BASE_API_URL,
        getToken: getToken,
        uniqueWsId
    })

    return contentsApi
}