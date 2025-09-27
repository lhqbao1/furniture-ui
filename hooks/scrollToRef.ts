import { useRef } from "react"

export function useSmoothScrollToRef<T extends HTMLElement>() {
    const refs = useRef<Record<string, T | null>>({})

    const scrollTo = (key: string, offset = 0) => {
        const el = refs.current[key]
        if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY + offset
            window.scrollTo({ top, behavior: "smooth" })
        }
    }

    const registerRef = (key: string, el: T | null) => {
        refs.current[key] = el
    }

    return { scrollTo, registerRef }
}