'use server'

import { getClerkToken } from './clerk'

export const getCases = async () => {

    const token = await getClerkToken()

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/cases`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )

    return res.json()
}