import { ProductItem } from '@/types/products'
import { useTranslations } from 'next-intl'
import React from 'react'

interface ProductDetailsPropertiesProps {
    product: ProductItem
}

const ProductDetailsProperties = ({ product }: ProductDetailsPropertiesProps) => {
    const t = useTranslations()
    return (
        <div className='space-y-6 lg:w-1/3 w-full'>
            <h4>{t('properties')}</h4>
            <div className='space-y-4'>
                <div className='rounded-md bg-gray-100 font-semibold px-4 py-4 text-lg'>{t('dimensions_weight')}</div>
                <div className='px-4'>
                    {product.length ?
                        <div className='grid grid-cols-2 lg:w-1/2 w-full'>
                            <div>{t('length')}:</div>
                            <div>{product.length} cm</div>
                        </div>
                        : ""}
                    {product.width ?
                        <div className='grid grid-cols-2 lg:w-1/2 w-full'>
                            <div>{t('width')}:</div>
                            <div>{product.width} cm</div>
                        </div>
                        : ""}
                    {product.height ?
                        <div className='grid grid-cols-2 lg:w-1/2 w-full'>
                            <div>{t('height')}:</div>
                            <div>{product.height} cm</div>
                        </div>
                        : ""}
                    {product.weight ?
                        <div className='grid grid-cols-2 lg:w-1/2 w-full'>
                            <div>{t('weight')}:</div>
                            <div>{product.weight} kg</div>
                        </div>
                        : ""}
                </div>
            </div>

            <div className='space-y-4'>
                <div className='rounded-md bg-gray-100 font-semibold px-4 py-4 text-lg'>{t('product_details')}</div>
                <div className='px-4'>
                    {product.materials ?
                        <div className='grid grid-cols-2 lg:w-1/2 w-full'>
                            <div>{t('materials')}:</div>
                            <div>{product.materials}</div>
                        </div>
                        : ""}
                    {product.color ?
                        <div className='grid grid-cols-2 lg:w-1/2 w-full'>
                            <div>{t('color')}:</div>
                            <div>{product.color}</div>
                        </div>
                        : ""}
                </div>
            </div>

        </div>
    )
}

export default ProductDetailsProperties