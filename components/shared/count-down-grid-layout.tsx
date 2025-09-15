'use client'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import ListReviewButton from './list-review-buttons'
import gsap from 'gsap'
import { useMediaQuery } from 'react-responsive'
import { ProductItem } from '@/types/products'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

interface CountDownGridLayoutProps {
    products: ProductItem[]
}

interface ProductTime {
    id: string
    timeLeft: number
    barWidth: number
}

const CountDownGridLayout = ({ products }: CountDownGridLayoutProps) => {
    const cardRefs = useRef<HTMLDivElement[]>([])
    const isMobile = useMediaQuery({ maxWidth: 650 }) // breakpoint mobile
    const t = useTranslations()

    // state riêng cho countdown & progress
    const [productTimes, setProductTimes] = useState<ProductTime[]>(() =>
        products.map((p) => {
            const randomPercent = Math.floor(Math.random() * (70 - 30 + 1)) + 30
            return {
                id: p.id ?? crypto.randomUUID(),
                timeLeft: Math.floor((randomPercent / 100) * 3 * 60 * 60), // seconds
                barWidth: randomPercent,
            }
        })
    )

    // Countdown + bar update
    useEffect(() => {
        const timeIntervals = products.map((_, idx) => {
            const targetTime =
                new Date().getTime() + productTimes[idx].timeLeft * 1000
            return setInterval(() => {
                const now = new Date().getTime()
                const diff = Math.max(0, Math.floor((targetTime - now) / 1000))
                setProductTimes((prev) => {
                    const newTimes = [...prev]
                    newTimes[idx] = { ...newTimes[idx], timeLeft: diff }
                    return newTimes
                })
            }, 1000)
        })

        const priceIntervals = products.map((_, idx) => {
            return setInterval(() => {
                setProductTimes((prev) => {
                    const newTimes = [...prev]
                    const old = newTimes[idx]
                    const percentLeft = Math.max(
                        30,
                        Math.min(70, (old.timeLeft / (3 * 60 * 60)) * 100)
                    )
                    newTimes[idx] = { ...old, barWidth: percentLeft }
                    return newTimes
                })
            }, 5000)
        })

        return () => {
            timeIntervals.forEach((i) => clearInterval(i))
            priceIntervals.forEach((i) => clearInterval(i))
        }
    }, [products])

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(
            2,
            '0'
        )}:${String(secs).padStart(2, '0')}`
    }

    // GSAP hover animation
    useEffect(() => {
        cardRefs.current.forEach((card) => {
            const btn = card.querySelector<HTMLDivElement>('.list-review-btn')
            if (!btn) return

            gsap.set(btn, { display: 'none', opacity: 0 })

            card.addEventListener('mouseenter', () => {
                gsap.fromTo(btn, { x: 20 }, { display: 'block', opacity: 1, duration: 0.3, x: 0 })
            })
            card.addEventListener('mouseleave', () => {
                gsap.fromTo(btn, { x: 0 }, { x: 0, opacity: 0, duration: 0.3, onComplete: () => { gsap.set(btn, { display: 'none' }); } })
            })
        })
    }, [])

    return (
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-0 sm:mt-6 mt-4'>
            {products.map((product, idx) => {
                const { timeLeft, barWidth } =
                    productTimes[idx] ?? { timeLeft: 0, barWidth: 50 }
                const categories = product.categories || []
                const level1 = categories.find(c => c.level === 1)
                const level2 = categories.filter(c => c.level === 2)[0] // level 2 đầu tiên
                const categoryHref = level1 && level2
                    ? `/${level1.name}/${level2.name}/${product.id}`
                    : level1
                        ? `/${level1.name}/${product.id}`
                        : level2
                            ? `/${level2.name}/${product.id}`
                            : `/${product.id}`
                return (
                    <Link href={`/product/${categoryHref}`} passHref key={product.id}>
                        <div
                            className='bg-white p-4 relative group'
                            style={{
                                borderTop: isMobile
                                    ? undefined
                                    : idx < 4
                                        ? ''
                                        : '1px solid #e0e0e0',
                                borderRight: isMobile
                                    ? undefined
                                    : idx === 3 || idx === 7
                                        ? ''
                                        : '1px solid #e0e0e0',
                            }}
                            ref={(el) => {
                                if (el) cardRefs.current[idx] = el
                            }}
                        >
                            <div className='text-gray-600 font-semibold xl:text-2xl text-base xl:mb-14 mb-0 line-clamp-2 lg:min-h-[64px] min-h-[52px]'>
                                {product.name}
                            </div>
                            <Image
                                width={200}
                                height={200}
                                src={product.static_files ? product.static_files[0].url : '/1.png'}
                                alt={product.name}
                                className='w-full h-48 object-contain mb-2 rounded'
                            />

                            <div className='absolute bottom-18 right-0 list-review-btn'>
                                <ListReviewButton />
                            </div>

                            <div className='flex flex-col items-end gap-2 xl:mt-20 mt-10 '>
                                <div className='relative w-full'>
                                    <div className='h-2.5 w-full bg-gray-300 relative overflow-hidden rounded-full'>
                                        <div
                                            style={{ width: `${100 - barWidth}%` }}
                                            className='absolute top-0 left-0 h-full bg-primary animate-stripes rounded-full'
                                        ></div>
                                    </div>

                                    <div
                                        className='absolute -top-12 z-10 transform -translate-x-1/2'
                                        style={{ left: `${100 - barWidth}%` }}
                                    >
                                        <div className='bg-primary text-white p-1 rounded min-w-[100px] relative flex flex-col'>
                                            <p className='text-center text-xl font-bold'>
                                                €{(
                                                    product.final_price +
                                                    ((100 - barWidth) / 100) *
                                                    (product.price - product.final_price)
                                                ).toFixed(2)}

                                            </p>
                                            <div className='absolute left-1/2 -bottom-3 w-0 h-0 border-l-16 border-l-transparent border-r-16 border-r-transparent border-t-16 border-t-primary -translate-x-1/2'></div>
                                        </div>
                                    </div>
                                </div>

                                <div className='flex xl:flex-row flex-col xl:justify-between items-end xl:items-center w-full'>
                                    <div className='flex flex-row gap-1 text-base text-gray-500'>
                                        <p>{t('endIn')}:</p>
                                        <div>{formatTime(timeLeft)}</div>
                                    </div>
                                    <p className='text-base text-gray-500 font-bold'>
                                        {/* €{(
                                            product.final_price +
                                            ((100 - barWidth) / 100) *
                                            (product.price - product.final_price)
                                        ).toFixed(2)} */}
                                        €{product.price.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            {/* Hover border animation */}
                            <span className='absolute bottom-0 left-0 w-full h-[1px] bg-secondary scale-x-0 origin-center transition-transform duration-300 group-hover:scale-x-100'></span>
                            <span className='absolute top-0 left-0 h-full w-[1px] bg-secondary scale-y-0 origin-center transition-transform duration-300 group-hover:scale-y-100'></span>
                            <span className='absolute top-0 right-0 w-full h-[1px] bg-secondary scale-x-0 origin-center transition-transform duration-300 group-hover:scale-x-100'></span>
                            <span className='absolute bottom-0 right-0 h-full w-[1px] bg-secondary scale-y-0 origin-center transition-transform duration-300 group-hover:scale-y-100'></span>
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}

export default CountDownGridLayout
