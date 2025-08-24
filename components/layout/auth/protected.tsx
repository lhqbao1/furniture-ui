// components/auth/Protected.tsx
"use client"
import { useMe } from "@/features/auth/hook"
import { ReactNode, useEffect } from "react"

export default function Protected({ children }: { children: ReactNode }) {
    const { data, isLoading, isError } = useMe()

    useEffect(() => {
        if (!isLoading && (isError || !data?.user)) {
            window.location.href = "/login"
        }
    }, [isLoading, isError, data])

    if (isLoading) return <div className="p-6">Loading...</div>
    if (!data?.user) return null
    return <>{children}</>
}
