'use server'

import { BASE_API_URL } from '@/constants'
import { getClerkToken } from './clerk'
import { Case } from '@/types/cases'

export const getCases = async (): Promise<Case[]> => {
    const token = await getClerkToken()
    const res = await fetch(
        `${BASE_API_URL}/cases`,
        {
            headers: { Authorization: `Bearer ${token}` }
        }
    )

    return res.json()
}