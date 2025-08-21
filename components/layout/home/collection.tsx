'use client'
import { collectionList } from '@/data/data'
import gsap from 'gsap'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import { useMediaQuery } from 'react-responsive'

const Collection = () => {
    const [listCollection, setListCollection] = useState(collectionList)
    const containerRefs = useRef<HTMLDivElement[]>([])
    const isMobile = useMediaQuery({ maxWidth: 430 }); // iPhone 12 Pro và nhỏ hơn

    useEffect(() => {
        const updated = collectionList.map((item, idx) => {
            const layout = [
                { col: 3, row: 2, color: '#84deee' },
                { col: 6, row: 1, color: '#df8888' },
                { col: 3, row: 1, color: '#84deee' },
                { col: 3, row: 1, color: '#ffb535' },
                { col: 6, row: 1, color: '#ffb535' },
            ]

            if (isMobile) {
                return { ...item, col: 12, row: 1, color: layout[idx].color }
            }

            return { ...item, ...layout[idx] }
        })
        setListCollection(updated)
    }, [])

    useEffect(() => {
        containerRefs.current.forEach((container) => {
            if (!container) return
            const text = container.querySelector<HTMLHeadingElement>('h3')
            const span = container.querySelector<HTMLSpanElement>('span')
            if (!text) return
            if (!span) return


            const handleEnter = () => {
                const containerRect = container.getBoundingClientRect()
                const textRect = text.getBoundingClientRect()

                const containerCenterX = containerRect.left + containerRect.width / 2
                const containerCenterY = containerRect.top + containerRect.height / 2
                const textCenterX = textRect.left + textRect.width / 2
                const textCenterY = textRect.top + textRect.height / 2

                const x = containerCenterX - textCenterX
                const y = containerCenterY - textCenterY

                gsap.killTweensOf(text)
                gsap.to(text, { x, y, duration: 0.5, ease: 'power1.out' })

                gsap.killTweensOf(span)
                gsap.to(span, {
                    width: '100%',
                    height: '100%',
                    top: 0,
                    left: 0,
                    borderRadius: '1rem', // rounded-2xl ≈ 1rem (16px)
                    duration: 0.5,
                    ease: 'power1.out'
                })
            }

            const handleLeave = () => {
                gsap.killTweensOf(text)
                gsap.to(text, { x: 0, y: 0, duration: 0.3, ease: 'power1.in' })

                gsap.killTweensOf(span)
                gsap.to(span, {
                    width: '3rem',   // w-12 = 3rem
                    height: '3.5rem', // h-14 = 3.5rem
                    top: '1rem',    // top-4 = 1rem
                    left: '1.25rem', // left-5 = 1.25rem
                    borderRadius: 0,
                    duration: 0.3,
                    ease: 'power1.in'
                })
            }

            container.addEventListener('mouseenter', handleEnter)
            container.addEventListener('mouseleave', handleLeave)

            return () => {
                container.removeEventListener('mouseenter', handleEnter)
                container.removeEventListener('mouseleave', handleLeave)
            }
        })
    }, [listCollection])




    return (
        <div className='section-padding'>
            <h2 className='text-secondary text-4xl font-bold text-center uppercase'>
                NEW COLLECTIONS
            </h2>
            <p className='text-primary text-lg text-center font-semibold'>
                Award winning design 2026
            </p>

            <div className="
                            grid 
                            grid-cols-1 sm:grid-cols-2 xl:grid-cols-12 
                            auto-rows-[150px] sm:auto-rows-[200px] xl:grid-rows-2
                            gap-4 sm:gap-6 xl:gap-8
                            xl:h-[600px] mt-5 sm:mt-6 xl:mt-8
                        "
            >
                {listCollection.map((item, idx) => {
                    return (
                        <div
                            key={item.id}
                            ref={(el) => {
                                if (el) containerRefs.current[idx] = el
                            }}
                            className={` bg-gray-200 h-full relative rounded-2xl`}
                            style={{
                                gridColumnEnd: `span ${item.col}`,
                                gridRowEnd: `span ${item.row}`,
                            }}
                        >
                            <Image
                                src={item.image}
                                height={600}
                                width={400}
                                alt={item.name}
                                className='object-cover absolute w-full h-full top-0 z-0 rounded-2xl'
                            />
                            <div className='collection-details z-10 p-6'>
                                <h3 className='text-white uppercase text-4xl font-bold absolute top-7 left-7 z-10'>
                                    {item.name}
                                </h3>
                                <span className={`absolute w-12 h-14 top-4 left-5 z-0 opacity-70`} style={{ backgroundColor: item.color }}></span>
                            </div>
                        </div>

                    )
                })}
            </div>
        </div>
    )
}

export default Collection
