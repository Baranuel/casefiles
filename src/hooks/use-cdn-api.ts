import { CdnApi } from "@/network/cdn"
import { useConfig } from "@/providers/ConfigProvider"
import { useAuth } from "@clerk/nextjs"

export const useCdnApi = (uniqueWsId?: string) => {
    const { BASE_API_URL } = useConfig()
    const { getToken } = useAuth()

    const cdnApi = new CdnApi({
        baseUrl: BASE_API_URL,
        getToken: getToken,
        uniqueWsId
    })

    return cdnApi
}