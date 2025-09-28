import { useRef, useCallback } from "react"

export function useSmoothScrollToRef<T extends HTMLElement>() {
  const refs = useRef<Record<string, T | null>>({})
  const containerRef = useRef<HTMLDivElement | null>(null)

  const registerRef = useCallback((key: string, el: T | null) => {
    refs.current[key] = el
  }, [])

  const setContainer = useCallback((el: HTMLDivElement | null) => {
    containerRef.current = el
  }, [])

  /**
   * Try to scroll to ref key.
   * Returns true if element existed and a scroll was issued, false otherwise.
   */
  const scrollTo = useCallback((key: string, offset = 0): boolean => {
    const el = refs.current[key]
    const container = containerRef.current

    if (!el) return false

    if (container) {
      // compute top relative to container in a robust way
      const containerRect = container.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      const top = elRect.top - containerRect.top + container.scrollTop + offset
      container.scrollTo({ top, behavior: "smooth" })
    } else {
      // fallback to window
      const top = window.scrollY + el.getBoundingClientRect().top + offset
      window.scrollTo({ top, behavior: "smooth" })
    }

    return true
  }, [])

  return { registerRef, scrollTo, setContainer }
}
