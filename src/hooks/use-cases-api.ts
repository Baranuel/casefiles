import { useConfig } from "@/providers/ConfigProvider";
import { Case } from "@/types/cases";
import { useAuth } from "@clerk/nextjs";

export const useCasesApi = () => {
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

        const res: Response = await fetch(BASE_API_URL + "/cases", {
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



    return { getCases, createCase, deleteCase };
}