import { ProductItem } from '@/types/products'
import { useTranslations } from 'next-intl'
import React from 'react'

interface ProductDetailsPropertiesProps {
    product: ProductItem
}

const ProductDetailsProperties = ({ product }: ProductDetailsPropertiesProps) => {
    const t = useTranslations()
    return (
        <div className='space-y-6'>
            <h4>{t('properties')}</h4>
            <div className='space-y-4'>
                <div className='rounded-md bg-gray-100 font-bold'>{t('dimensions_weight')}</div>
                {product.length ?
                    <div className='grid grid-cols-2'>
                        <div>{t('length')}:</div>
                        <div>{product.length}</div>
                    </div>
                    : ""}
                {product.width ?
                    <div className='grid grid-cols-2'>
                        <div>{t('width')}:</div>
                        <div>{product.width}</div>
                    </div>
                    : ""}
                {product.height ?
                    <div className='grid grid-cols-2'>
                        <div>{t('height')}:</div>
                        <div>{product.height}</div>
                    </div>
                    : ""}
                {product.weight ?
                    <div className='grid grid-cols-2'>
                        <div>{t('weight')}:</div>
                        <div>{product.weight}</div>
                    </div>
                    : ""}
            </div>

            <div className='space-y-4'>
                <div className='rounded-md bg-gray-100 font-bold'>{t('product_details')}</div>
                {product.materials ?
                    <div className='grid grid-cols-2'>
                        <div>{t('materials')}:</div>
                        <div>{product.materials}</div>
                    </div>
                    : ""}
                {product.color ?
                    <div className='grid grid-cols-2'>
                        <div>{t('color')}:</div>
                        <div>{product.color}</div>
                    </div>
                    : ""}
            </div>

        </div>
    )
}

export default ProductDetailsProperties