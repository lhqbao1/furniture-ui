// components/auth/Protected.tsx
"use client"
import { useMe } from "@/features/auth/hook"
import { useCurrentUser } from "@/features/users/hook"
import { ReactNode, useEffect } from "react"

export default function Protected({ children }: { children: ReactNode }) {
    const { data: user, isLoading } = useCurrentUser()
    console.log(user)
    useEffect(() => {
        if (!user) {
            // window.location.href = "/login"
        }
    }, [isLoading, user])

    if (isLoading) return <div className="p-6">Loading...</div>
    if (!user) return null
    return <>{children}</>
}
