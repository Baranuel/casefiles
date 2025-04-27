'use server';

import { auth } from "@clerk/nextjs/server"

export const getClerkToken = async () => {  
  const token = await (await auth()).getToken({
    template: 'casefiles',
  })

  return token
}