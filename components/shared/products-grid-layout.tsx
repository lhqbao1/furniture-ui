'use client'
import { trendingProducts } from '@/data/data'
import Image from 'next/image'
import React, { useEffect, useRef } from 'react'
import ListReviewButton from './list-review-buttons'
import gsap from 'gsap'
import { CustomPagination } from './custom-pagination'
import { Product } from '@/types/products'
import Link from 'next/link'
import TagBadge from './tab-badge'
import { useMediaQuery } from 'react-responsive'


interface ProductsGridLayoutProps {
    hasBadge?: boolean
    hasPagination?: boolean
    data: Product[]
}


const ProductsGridLayout = ({ hasBadge, hasPagination = false, data }: ProductsGridLayoutProps) => {
    const cardRefs = useRef<HTMLDivElement[]>([])
    const isMobile = useMediaQuery({ maxWidth: 430 }); // ví dụ mobile breakpoint

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
        <div>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-0 sm:gap-0 sm:mt-6 mt-4'>
                {data.map((product, idx) => {
                    return (
                        <Link href={`/product/indoor/chair/${product.id}`} key={product.id} passHref>

                            <div
                                className="bg-white p-0 relative overflow-hidden group py-4 cursor-pointer"
                                style={{
                                    borderTop: isMobile
                                        ? undefined
                                        : idx < 4
                                            ? ""
                                            : "1px solid #e0e0e0",
                                    borderRight: isMobile
                                        ? undefined
                                        : idx === 3 || idx === 7
                                            ? ""
                                            : "1px solid #e0e0e0",
                                }}

                                ref={el => { if (el) cardRefs.current[idx] = el }}
                            >
                                <Image
                                    width={200}
                                    height={200}
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-48 object-contain mb-2 rounded"
                                />

                                <div className="absolute bottom-18 right-0 list-review-btn">
                                    <ListReviewButton />
                                </div>

                                <div className='product-details py-2 mt-0 md:mt-5 xl:mt-8 flex flex-col gap-1'>
                                    <h3 className='text-2xl text-gray-600 font-black sm:mt-2 text-center'>
                                        {product.name}
                                    </h3>
                                    {product.salePrice ? (
                                        <div className='flex flex-row gap-2 items-end justify-center'>
                                            <p className='text-xl font-light mb-1 relative line-through text-gray-400'>
                                                €{product.price}
                                            </p>
                                            <p className='text-3xl font-bold mb-1 relative text-primary'>
                                                €{product.salePrice}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className='text-xl font-bold mb-1 text-primary'>€{product.price}</p>
                                    )}
                                </div>

                                {hasBadge && (
                                    <TagBadge color={product.tag.color} name={product.tag.name} />
                                )}

                                {/* Four lines starting from center of each edge */}
                                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-orange-500 scale-x-0 origin-center transition-transform duration-300 group-hover:scale-x-100"></span>
                                <span className="absolute top-0 left-0 h-full w-[1px] bg-orange-500 scale-y-0 origin-center transition-transform duration-300  group-hover:scale-y-100"></span>
                                <span className="absolute top-0 right-0 w-full h-[1px] bg-orange-500 scale-x-0 origin-center transition-transform duration-300  group-hover:scale-x-100"></span>
                                <span className="absolute bottom-0 right-0 h-full w-[1px] bg-orange-500 scale-y-0 origin-center transition-transform duration-300  group-hover:scale-y-100"></span>
                            </div>
                        </Link>
                    );
                })}
            </div>
            {hasPagination &&
                <div className='pt-8'>
                    {/* <CustomPagination /> */}
                </div>
            }
        </div>
    )
}

export default ProductsGridLayout