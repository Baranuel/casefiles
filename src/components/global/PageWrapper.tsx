import { ReactNode } from "react"

export const PageWrapper = ({children}: {children: ReactNode}) => {
    return (
        <main className="bg-background-500 w-screen min-h-screen max-w-[1720px] mx-auto flex flex-col items-center justify-start lg:justify-center">
            {children}
        </main>
    )
}