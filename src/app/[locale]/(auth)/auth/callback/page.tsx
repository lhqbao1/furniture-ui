// app/auth/callback/page.tsx
"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { BeatLoader, FadeLoader } from "react-spinners"

export default function CallbackPage() {
    const params = useSearchParams()
    const router = useRouter()

    useEffect(() => {
        const token = params.get("token")
        const userId = params.get("user_id")

        if (token) {
            localStorage.setItem("access_token", token)
            if (userId) localStorage.setItem("user_id", userId)

            // Điều hướng đến trang sau khi đăng nhập
            router.push("/")
        }
    }, [params, router])

    return <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* overlay mờ + blur */}
        <div className="absolute inset-0 backdrop-blur-sm" />

        {/* card spinner */}
        <div
            role="status"
            aria-live="polite"
            className="relative z-10 flex flex-col items-center gap-4"
        >
            <BeatLoader color="#00B159" size={20} />

        </div>
    </div>
}
