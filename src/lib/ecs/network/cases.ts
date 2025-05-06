import { Case } from "@/types/cases";
import axios, { AxiosInstance } from "axios";

type getToken = (params:Record<string,string>) =>  Promise<string | null>;
export class CasesApi {
  private api: AxiosInstance;
  private getToken?:getToken
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
    const token = await this.getToken({template:'casefiles'});
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async fetchCases() {
    const headers = await this.authHeaders();
    const response = await this.api.get<Case[]>("/cases", { headers });
    return response.data;
  }

  async fetchCaseById(id: string) {
    const headers = await this.authHeaders();
    const response = await this.api.get(`/cases/${id}`, { headers });
    return response.data;
  }

  async createCase(title: string) {
    const headers = await this.authHeaders();
    const response = await this.api.post("/cases", { title }, { headers });
    return response.data;
  }

  async deleteCase(id: string) {
    const headers = await this.authHeaders();
    const response = await this.api.delete(`/cases/${id}`, { headers });
    return response.data;
  }

}