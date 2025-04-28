import { ReactNode } from "react"

export const PageWrapper = ({children}: {children: ReactNode}) => {
    return (
        <main className="group w-screen min-h-screen flex flex-col justify-start">
            {children}
        </main>
    )
}