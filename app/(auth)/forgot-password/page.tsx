'use client'
import ForgotPasswordEmail from '@/components/layout/auth/forgot-password-email'
import Image from 'next/image'
import React, { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

const LoginPage = () => {
    const containerRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        const el = containerRef.current
        const ctx = gsap.context(() => {
            gsap.fromTo(
                el,
                {
                    x: "-100%",
                    // y: "-100%",
                    y: 0,
                    scale: 0,
                    transformOrigin: "top left",
                },
                {
                    x: "0%",
                    y: "0%",
                    scale: 1,
                    duration: 1,
                    ease: "power3.out",
                }
            )
        })
    }, [])


    return (
        <div className='grid grid-cols-12 w-screen h-screen' ref={containerRef}>
            <div className='lg:col-span-5 col-span-12 flex lg:items-center items-start justify-center'>
                <ForgotPasswordEmail />
            </div>
            <div className='lg:col-span-7 lg:block hidden relative'>
                <Image
                    src={'/login.webp'}
                    fill
                    alt=''
                    className='absolute w-full h-full object-cover top-0'
                />
            </div>
        </div>
    )
}

export default LoginPage