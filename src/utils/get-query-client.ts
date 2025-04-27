import { isServer, QueryClient } from "@tanstack/react-query";


const makeQueryClient = () => {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 10, // 10 seconds
            }
        }
    })
}

let browserQueryClient: QueryClient | null = null

export function getQueryClient() {

    if (isServer) {
        return makeQueryClient()
    }
    if (!browserQueryClient) {
        browserQueryClient = makeQueryClient()
    }
    return browserQueryClient

}