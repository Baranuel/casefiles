import { ReactNode } from "react"

export const PageWrapper = ({children}: {children: ReactNode}) => {
    return (
        <main className=" w-screen min-h-[calc(100vh - 64px)] flex flex-col flex-1 ">
            {children}
        </main>
    )
}