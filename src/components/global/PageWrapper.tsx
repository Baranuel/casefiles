import { ReactNode } from "react"

export const PageWrapper = ({children}: {children: ReactNode}) => {
    return (
        <main className=" w-screen  flex flex-col flex-1 ">
            {children}
        </main>
    )
}