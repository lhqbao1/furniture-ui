'use client'
import { trendingProducts } from '@/data/data'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import ListReviewButton from './list-review-buttons'
import gsap from 'gsap'

interface ProductTime {
    id: number
    timeLeft: number // seconds
    barWidth: number // % từ 30–70%
}

const CountDownGridLayout = () => {
    const cardRefs = useRef<HTMLDivElement[]>([])

    // Khởi tạo productTimes với barWidth ngẫu nhiên 30–70%
    const [productTimes, setProductTimes] = useState<ProductTime[]>(
        trendingProducts.map(p => {
            const randomPercent = Math.floor(Math.random() * (70 - 30 + 1)) + 30
            return {
                id: p.id,
                timeLeft: Math.floor((randomPercent / 100) * 3 * 60 * 60), // seconds
                barWidth: randomPercent
            }
        })
    )

    // update countdown từng sản phẩm
    useEffect(() => {
        const intervals = trendingProducts.map((product, idx) => {
            const target = new Date().getTime() + productTimes[idx].timeLeft * 1000
            return setInterval(() => {
                const now = new Date().getTime()
                const diff = Math.max(0, Math.floor((target - now) / 1000))
                setProductTimes(prev => {
                    const newTimes = [...prev]
                    // giữ barWidth trong 30–70%
                    const percentLeft = Math.max(30, Math.min(70, (diff / (3 * 60 * 60)) * 100))
                    newTimes[idx] = { ...newTimes[idx], timeLeft: diff, barWidth: percentLeft }
                    return newTimes
                })
            }, 1000)
        })

        return () => intervals.forEach(i => clearInterval(i))
    }, [])

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }

    // GSAP hover animation nút review
    useEffect(() => {
        cardRefs.current.forEach((card) => {
            const btn = card.querySelector<HTMLDivElement>('.list-review-btn')
            if (!btn) return

            gsap.set(btn, { display: 'none', opacity: 0 })

            card.addEventListener('mouseenter', () => {
                gsap.fromTo(btn, { x: 20 }, { display: 'block', opacity: 1, duration: 0.5, x: 0 })
            })
            card.addEventListener('mouseleave', () => {
                gsap.fromTo(btn, { x: 0 }, { x: 20, opacity: 0, duration: 0.5, onComplete: () => { gsap.set(btn, { display: 'none' }) } })
            })
        })
    }, [])

    return (
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 sm:mt-6 mt-4'>
            {trendingProducts.map((product, idx) => {
                const { timeLeft, barWidth } = productTimes[idx]
                return (
                    <div
                        key={product.id}
                        className='bg-white p-4 rounded-2xl shadow relative'
                        ref={el => { if (el) cardRefs.current[idx] = el }}
                    >
                        <Image
                            width={200}
                            height={200}
                            src={product.image}
                            alt={product.name}
                            className='w-full h-48 object-contain mb-2 rounded'
                        />

                        <div className='absolute top-4 right-0 list-review-btn'>
                            <ListReviewButton />
                        </div>

                        <div className='flex flex-col items-end gap-4 2xl:mt-20 '>
                            <div className="relative w-full"> {/* container relative */}
                                {/* Thanh progress */}
                                <div className="h-2.5 w-full bg-gray-300 relative overflow-hidden rounded-full">
                                    <div
                                        style={{ width: `${100 - barWidth}%` }}
                                        className="absolute top-0 left-0 h-full bg-primary animate-stripes rounded-full"
                                    ></div>
                                </div>

                                {/* Tooltip */}
                                <div
                                    className="absolute -top-14 z-10 transform -translate-x-1/2"
                                    style={{ left: `${100 - barWidth}%` }}
                                >
                                    <div className="relative bg-primary text-white p-1 rounded min-w-[120px]">
                                        <p className="text-center text-2xl font-bold">
                                            €{(product.salePrice + (100 - barWidth) / 100 * (product.price - product.salePrice)).toFixed(2)}
                                        </p>
                                        <div
                                            className="absolute left-1/2 -bottom-4 w-0 h-0 border-l-16 border-l-transparent border-r-16 border-r-transparent border-t-16 border-t-primary -translate-x-1/2"
                                        >
                                        </div>
                                    </div>
                                </div>
                            </div>



                            <div className='flex flex-row justify-between w-full'>
                                <div className='flex flex-row gap-1 text-base text-gray-500'>
                                    <p>ends in:</p>
                                    <div>{formatTime(timeLeft)}</div>
                                </div>
                                <p className='text-base text-gray-500 font-bold'>€{product.price}</p>


                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default CountDownGridLayout
