import { useConfig } from "@/providers/ConfigProvider";
import { Case } from "@/types/cases";
import { ElementDto } from "@/types/elements";
import { useAuth } from "@clerk/nextjs";

export const useCasesApi = (wsId?:string) => {
    const { BASE_API_URL } = useConfig()
    const { getToken } = useAuth()


    const getCases = async (): Promise<Case[]> => {
        const token = await getToken({ template: "casefiles" });

        if (!token) {
            throw new Error("No token found");
        }
        const res: Response = await fetch(BASE_API_URL + "/cases", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (!res.ok) {
            throw new Error(`Error fetching cases: ${res.status}`);
        }

        const cases = await res.json();
        return cases;
    };

    const createCase = async (title: string): Promise<Case> => {
        const token = await getToken({ template: "casefiles" });

        const res: Response = await fetch(BASE_API_URL + `/cases`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(title),
        });
        const newCase = await res.json();
        return newCase;
    };



    const deleteCase = async (caseId: string): Promise<void> => {
        const token = await getToken({ template: "casefiles" });
        await fetch(BASE_API_URL + "/cases/" + caseId, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        return;
    };

    const getCaseElements = async (caseId:string): Promise<ElementDto[]> => {
        const token = await getToken({ template: "casefiles" });
        const res = await fetch(BASE_API_URL + "/cases/" + caseId + '/elements', {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        return await res.json()
    }

    const createCaseElement = async (caseId:string, payload: Omit<ElementDto, 'id'>): Promise<ElementDto> => {
        const token = await getToken({ template: "casefiles" });
        const res = await fetch(BASE_API_URL + "/cases/" + caseId + '/elements' +`?wsId=${wsId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(payload)
        });
        return await res.json()
    }

    const deleteCaseElements = async (caseId:string): Promise<ElementDto> => {
        const token = await getToken({ template: "casefiles" });
        const res = await fetch(BASE_API_URL + "/cases/" + caseId + '/elements', {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });
        return await res.json()
    }
    



    return { getCases, createCase, deleteCase, getCaseElements, createCaseElement, deleteCaseElements };
}