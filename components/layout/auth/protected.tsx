"use client"
import { ReactNode, useEffect, useState } from "react"

interface ProtectedProps {
    children: ReactNode
}

export default function Protected({ children }: ProtectedProps) {
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

    useEffect(() => {
        // check admin token trong localStorage
        const adminToken = localStorage.getItem("admin_access_token")
        if (!adminToken) {
            // không có token → redirect login
            window.location.href = "/"
        } else {
            setIsAdmin(true)
        }
    }, [])

    if (isAdmin === null) {
        // chưa kiểm tra xong
        return <div className="p-6">Loading...</div>
    }

    return <>{children}</>
}
