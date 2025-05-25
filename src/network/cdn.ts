import axios, { AxiosInstance } from "axios";


type getToken = (params: Record<string, string>) => Promise<string | null>;

export class CdnApi {
    private api: AxiosInstance;
    private getToken?: getToken
    private uniqueWsId?: string;

    constructor(
        { baseUrl, getToken, uniqueWsId }: {
            baseUrl: string,
            getToken?: getToken,
            uniqueWsId?: string
        }
    ) {
        this.api = axios.create({
            baseURL: baseUrl,
            headers: {
                "Content-Type": "application/json",
            },
        });
        this.getToken = getToken;
        this.uniqueWsId = uniqueWsId;
    }

    private async authHeaders() {
        if (!this.getToken) return {};
        const token = await this.getToken({ template: 'casefiles' });
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    async getImages({limit, cursor}: { limit?: number; cursor?: string | null } = {}) {
        const headers = await this.authHeaders();

        const params: Record<string, string> = {
            wsId: this.uniqueWsId || '',
            limit: limit ? limit.toString() : '20', // Default to 20 if not provided
            cursor: cursor || '',
        };

        const queryString = new URLSearchParams(params).toString();
        const response = await this.api.get<{
            images: string[];
            cursor?: string | null;
        }>(`/cdn/images?${queryString}`, { headers });
        return response.data;
    }
}
