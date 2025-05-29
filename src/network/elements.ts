import { ElementDto } from "@/types/elements";
import axios, { AxiosInstance } from "axios";

type getToken = (params:Record<string,string>) =>  Promise<string | null>;

export class ElementsApi {
    private api: AxiosInstance;
    private getToken?: getToken
    private uniqueWsId?: string;

    constructor(
        { baseUrl, getToken, uniqueWsId }: {
            baseUrl: string,
            getToken?:getToken ,
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
        const token = await this.getToken({template:'casefiles'});
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    async fetchElements(caseId: string) {
        const headers = await this.authHeaders();
        const response = await this.api.get(`/elements/${caseId}`, { headers });
        return response.data;
    }

    async createElement(caseId: string, payload: ElementDto) {
        const headers = await this.authHeaders();
        const wsIdParam = this.uniqueWsId ? `?wsId=${this.uniqueWsId}` : "";
        const response = await this.api.post<ElementDto>(
            `/elements/${caseId}${wsIdParam}`,
            payload,
            { headers }
        );
        return response.data;
    }

    async updateElement(elementId: string, payload: ElementDto) {
        const headers = await this.authHeaders();
        const wsIdParam = this.uniqueWsId ? `?wsId=${this.uniqueWsId}` : "";
        const response = await this.api.put<ElementDto>(
            `/elements/${elementId}${wsIdParam}`,
            payload,
            { headers }
        );
        return response.data;
    }
    async updateBatchElements(caseId:string, payload: ElementDto[]) {
        const headers = await this.authHeaders();
        const wsIdParam = this.uniqueWsId ? `?wsId=${this.uniqueWsId}` : "";
        const response = await this.api.put<ElementDto>(
            `/elements/${caseId}/batch${wsIdParam}`,
            payload,
            { headers }
        );
        return response.data;
    }

    async deleteElement(elementId: string) {
        const headers = await this.authHeaders();
        const wsIdParam = this.uniqueWsId ? `?wsId=${this.uniqueWsId}` : "";
        const response = await this.api.delete(
            `/elements/${elementId}${wsIdParam}`,
            { headers }
        );
        return response.data;
    }

}