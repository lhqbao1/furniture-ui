'use client'
import Image from 'next/image'
import React, { useEffect, useRef } from 'react'
import ListReviewButton from './list-review-buttons'
import gsap from 'gsap'
import { ProductItem } from '@/types/products'
import { useMediaQuery } from 'react-responsive'
import { useAddViewedProduct } from '@/features/viewed/hook'
import { useTranslations } from 'next-intl'
import { Link } from '@/src/i18n/navigation'
import { Star } from 'lucide-react'


interface ProductsGridLayoutProps {
    hasBadge?: boolean
    hasPagination?: boolean
    data: ProductItem[]
}


const ProductsGridLayout = ({ hasBadge, hasPagination = false, data }: ProductsGridLayoutProps) => {
    const cardRefs = useRef<HTMLDivElement[]>([])
    const isMobile = useMediaQuery({ maxWidth: 650 })
    const addProductToViewMutation = useAddViewedProduct()
    const t = useTranslations()

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
                    const formatName = (name: string) => name.trim().toLowerCase().replace(/\s+/g, '-')

                    const level1 = categories.find(c => c.level === 1)
                    const level2 = categories.filter(c => c.level === 2)[0] // level 2 đầu tiên

                    const categoryHref = level1 && level2
                        ? `/${formatName(level1.name)}/${formatName(level2.name)}/${product.id}`
                        : level1
                            ? `/${formatName(level1.name)}/${product.id}`
                            : level2
                                ? `/${formatName(level2.name)}/${product.id}`
                                : `/${product.id}`
                    return (
                        <div key={product.id} className='relative overflow-hidden' ref={el => { if (el) cardRefs.current[idx] = el }} onClick={() => handleAddProductToViewed(product.id)}>
                            <Link href={`/product${categoryHref}`} passHref>
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

                                    <div className='product-details py-2 mt-0 md:mt-5 xl:mt-8 flex flex-col gap-1 lg:px-4 px-2'>
                                        <div className='uppercase font-bold text-black'>
                                            {product.categories.length > 0
                                                ? product.categories[0].children && product.categories[0].children.length > 0
                                                    ? product.categories[0].children[0].name
                                                    : product.categories[0].name
                                                : t('general')}
                                        </div>
                                        <h3 className='text-lg text-black text-left line-clamp-2 lg:min-h-[64px] min-h-[52px]'>
                                            {product.name}
                                        </h3>

                                        {product.price ? (
                                            <div className='flex gap-2 flex-col'>
                                                <div className="inline-flex items-end justify-start w-fit gap-6 font-bold text-gray-900 relative">
                                                    <div className='text-4xl'>{Math.floor(product.final_price)}</div>
                                                    <div className="text-base font-bold text-gray-700 absolute top-0 right-2.5">
                                                        .{(product.final_price % 1).toFixed(2).split(".")[1]}
                                                    </div>
                                                    <div className="text-base font-semibold text-black">€</div>
                                                </div>

                                                <p className='text-base mb-1'>
                                                    Vorher: €{product.price.toFixed(2)}
                                                </p>
                                                <div className='space-x-2 flex items-end'>
                                                    <div className='flex gap-0.5'>
                                                        {[1, 2, 3, 4, 5].map(item => {
                                                            return (
                                                                <div key={item}>
                                                                    <Star size={18} />
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                    <p className='leading-4 text-base font-semibold'>(0)</p>
                                                </div>
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