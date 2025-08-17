"use client"

import React, { useEffect, useRef } from "react"
import Image from "next/image"

export default function StickyIcon() {
    const wrapperRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        let cleanup: (() => void) | undefined

            ; (async () => {
                const gsapModule = await import("gsap")
                const { ScrollTrigger } = await import("gsap/ScrollTrigger")
                const gsap = gsapModule.gsap || gsapModule.default || gsapModule

                gsap.registerPlugin(ScrollTrigger)

                const el = wrapperRef.current
                if (!el) return

                gsap.set(el, { transformOrigin: "50% 50%", rotation: 0 })

                const wiggle = () => {
                    gsap
                        .timeline({ defaults: { ease: "power2.inOut" } })
                        .to(el, { rotation: 5, duration: 0.18 })
                        .to(el, { rotation: -5, duration: 0.18 })
                        .to(el, { rotation: 3, duration: 0.15 })
                        .to(el, { rotation: -3, duration: 0.15 })
                        .to(el, { rotation: 0, duration: 0.2, ease: "elastic.out(1, 0.5)" })
                }


                ScrollTrigger.addEventListener("scrollEnd", wiggle)

                const st = ScrollTrigger.create({
                    trigger: document.documentElement,
                    start: "top top",
                    end: "bottom bottom",
                })

                cleanup = () => {
                    ScrollTrigger.removeEventListener("scrollEnd", wiggle)
                    st.kill()
                }
            })()

        return () => {
            cleanup?.()
        }
    }, [])

    return (
        <div
            ref={wrapperRef}
            className="fixed right-0 top-[150px] z-50 w-48 h-48"
        >
            <Image
                src="/cart-icon.svg"
                alt="icon"
                width={64}
                height={64}
                className="w-48 h-48 select-none pointer-events-auto"
            />
        </div>
    )
}
