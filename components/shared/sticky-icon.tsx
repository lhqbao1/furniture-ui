"use client"

import React, { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useGetCartItems } from "@/features/cart/hook"
import { useRouter } from "next/navigation"

export default function StickyIcon() {
    const wrapperRef = useRef<HTMLDivElement | null>(null)
    const { data: cart, isLoading: isLoadingCart, isError: isErrorCart } = useGetCartItems()
    const router = useRouter()

    useEffect(() => {
        let cleanup: (() => void) | undefined

            ; (async () => {
                const gsapModule = await import("gsap")
                const { ScrollTrigger } = await import("gsap/ScrollTrigger")
                const gsap = gsapModule.gsap || gsapModule.default || gsapModule

                gsap.registerPlugin(ScrollTrigger)

                const el = wrapperRef.current
                if (!el) return

                gsap.set(el, { transformOrigin: "50% 0%", rotation: 0 })

                const wiggle = () => {
                    gsap
                        .timeline({ defaults: { ease: "power2.inOut" } })
                        .to(el, { rotation: 5, duration: 0.18 })
                        .to(el, { rotation: -5, duration: 0.18 })
                        .to(el, { rotation: 3, duration: 0.15 })
                        .to(el, { rotation: -3, duration: 0.15 })
                        .to(el, { rotation: 0, duration: 0.2, ease: "elastic.out(1, 0.5)" })
                }


                ScrollTrigger.addEventListener("scrollStart", wiggle)

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
            className="fixed right-0 top-[150px] z-50 w-24 h-24 cursor-pointer"
            onClick={() => {
                router.push('/cart')
            }}
        >
            <div className="relative">
                <Image
                    src="/cart-logo.svg"
                    alt="icon"
                    width={64}
                    height={64}
                    className="w-24 h-24 select-none pointer-events-auto "
                />
                <p className="absolute bottom-4 text-lg text-white font-bold left-7.5 text-center flex flex-col leading-3">{isLoadingCart || isErrorCart ? 0 : cart?.items.length} <br /> <span className="text-sm font-semibold">items</span></p>
            </div>
        </div>
    )
}
