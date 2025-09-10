'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

const CursorLoadingHandler = () => {
    const router = useRouter()
    const pathname = usePathname()
    const [isNavigating, setIsNavigating] = useState(false)

    useEffect(() => {
        const handleStart = () => setIsNavigating(true)
        const handleComplete = () => setIsNavigating(false)

        // Monkey patch router.push / router.replace
        const originalPush = router.push
        router.push = async (...args) => {
            handleStart()
            const result = await originalPush(...args)
            handleComplete()
            return result
        }

        const originalReplace = router.replace
        router.replace = async (...args) => {
            handleStart()
            const result = await originalReplace(...args)
            handleComplete()
            return result
        }

        return () => {
            // Restore original functions nếu cần
            router.push = originalPush
            router.replace = originalReplace
        }
    }, [router])

    useEffect(() => {
        // Khi đang navigating → đổi cursor
        document.body.style.cursor = isNavigating ? 'wait' : 'default'
    }, [isNavigating])

    return null
}

export default CursorLoadingHandler
