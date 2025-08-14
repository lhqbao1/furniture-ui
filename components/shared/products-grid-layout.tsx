'use client'
import { trendingProducts } from '@/data/data'
import { Star } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useRef } from 'react'
import ListReviewButton from './list-review-buttons'
import gsap from 'gsap'

const ProductsGridLayout = () => {
    const cardRefs = useRef<HTMLDivElement[]>([])

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
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 sm:mt-6 mt-4'>
            {trendingProducts.map((product, idx) => {
                const fullStars = Math.floor(product.rating);
                const partial = product.rating % 1;
                const emptyStars = 5 - fullStars - (partial > 0 ? 1 : 0);

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

                        <div className='product-details py-2 mt-0 md:mt-5 xl:mt-8 flex flex-col gap-1'>
                            <div className="flex items-center gap-1">
                                {/* Full stars */}
                                {[...Array(fullStars)].map((_, i) => (
                                    <Star key={`full-${i}`} className="text-yellow-400" fill="currentColor" size={16} />
                                ))}

                                {/* Partial star */}
                                {partial > 0 && (
                                    <Star
                                        className="text-gray-300 relative"
                                        fill="currentColor"
                                        size={16}
                                    />
                                )}

                                {/* Empty stars */}
                                {[...Array(emptyStars)].map((_, i) => (
                                    <Star key={`empty-${i}`} className="text-gray-300" fill="currentColor" size={16} />
                                ))}
                            </div>
                            <h3 className='text-base text-gray-600 font-semibold sm:mt-2'>{product.name}</h3>
                            {product.salePrice ?
                                <div className='flex flex-row gap-2 items-end'>
                                    <p className=' text-base font-bold mb-1 relative line-through text-gray-400'>${product.price}</p>
                                    <p className=' text-xl font-bold mb-1 relative'>${product.salePrice}</p>
                                </div>
                                :
                                <p className=' text-xl font-bold mb-1'>${product.price}</p>

                            }
                        </div>
                    </div>
                );
            })}
        </div>
    )
}

export default ProductsGridLayout