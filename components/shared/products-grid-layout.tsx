'use client'
import Image from 'next/image'
import React, { useEffect, useRef } from 'react'
import ListReviewButton from './list-review-buttons'
import gsap from 'gsap'
import { ProductItem, ProductResponse } from '@/types/products'
import Link from 'next/link'
import { useMediaQuery } from 'react-responsive'
import { useAddViewedProduct } from '@/features/viewed/hook'


interface ProductsGridLayoutProps {
    hasBadge?: boolean
    hasPagination?: boolean
    data: ProductItem[]
}


const ProductsGridLayout = ({ hasBadge, hasPagination = false, data }: ProductsGridLayoutProps) => {
    const cardRefs = useRef<HTMLDivElement[]>([])
    const isMobile = useMediaQuery({ maxWidth: 430 }); // ví dụ mobile breakpoint
    const addProductToViewMutation = useAddViewedProduct()

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

    const handleAddProductToViewed = (productId: string) => {
        addProductToViewMutation.mutate({ productId: productId })
    }

    return (
        <div>
            <div className='grid grid-cols-2 sm:grid-cols-4 gap-0 sm:gap-0 sm:mt-6 mt-4'>
                {data.map((product, idx) => {
                    // Lấy đường dẫn category
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
                        <div key={product.id} className='relative overflow-hidden' ref={el => { if (el) cardRefs.current[idx] = el }} onClick={() => handleAddProductToViewed(product.id)}>
                            <Link href={`/product/${categoryHref}`} passHref>
                                <div
                                    className="bg-white p-0 group py-4 cursor-pointer z-0"
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
                                >
                                    <Image
                                        width={200}
                                        height={200}
                                        src={product.static_files && product.static_files.length > 0 ? product.static_files[0].url : '/1.png'}
                                        alt={product.name}
                                        className="w-full h-48 object-contain mb-2 rounded"
                                    />


                                    <div className='product-details py-2 mt-0 md:mt-5 xl:mt-8 flex flex-col gap-1'>
                                        <h3 className='lg:text-2xl text-base text-gray-600 font-semibold sm:mt-2 text-center line-clamp-2 px-2 lg:px-4 lg:min-h-[64px] min-h-[52px]'>
                                            {product.name}
                                        </h3>

                                        {product.price ? (
                                            <div className='flex flex-row gap-2 items-end justify-center'>
                                                <p className='lg:text-xl text-sm font-light mb-1 relative line-through text-gray-400'>
                                                    €{product.price.toFixed(2)}
                                                </p>
                                                <p className='lg:text-3xl text-xl font-bold mb-1 relative text-primary'>
                                                    €{product.final_price.toFixed(2)}
                                                </p>
                                            </div>
                                        ) : (
                                            <p className='text-xl font-bold mb-1 text-primary'>€{product.final_price}</p>
                                        )}
                                    </div>


                                    {/* Four lines starting from center of each edge */}
                                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-secondary scale-x-0 origin-center transition-transform duration-300 group-hover:scale-x-100"></span>
                                    <span className="absolute top-0 left-0 h-full w-[1px] bg-secondary scale-y-0 origin-center transition-transform duration-300  group-hover:scale-y-100"></span>
                                    <span className="absolute top-0 right-0 w-full h-[1px] bg-secondary scale-x-0 origin-center transition-transform duration-300  group-hover:scale-x-100"></span>
                                    <span className="absolute bottom-0 right-0 h-full w-[1px] bg-secondary scale-y-0 origin-center transition-transform duration-300  group-hover:scale-y-100"></span>
                                </div>
                            </Link>
                            <div className="absolute bottom-18 right-0 list-review-btn">
                                <ListReviewButton currentProduct={product} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}

export default ProductsGridLayout