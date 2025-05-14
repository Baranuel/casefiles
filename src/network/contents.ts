import { Content, UpdateContentDto } from "@/types/contents";
import axios, { AxiosInstance } from "axios";


type getToken = (params: Record<string, string>) => Promise<string | null>;

export class ContentsApi {
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

    async updateContent(caseId: string, content: UpdateContentDto) {
        const headers = await this.authHeaders();
        const response = await this.api.put<Content>(`/contents/${caseId}?wsId=${this.uniqueWsId}`, content, { headers });
        return response.data;
    }
}
