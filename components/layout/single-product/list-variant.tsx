'use client'

import { CartFormValues } from '@/lib/schema/cart'
import { ProductGroupDetailResponse } from '@/types/product-group'
import { ProductItem } from '@/types/products'
import { VariantOptionsResponse } from '@/types/variant'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

interface ListVariantProps {
    variant: VariantOptionsResponse[]
    currentProduct: ProductItem
    parentProduct: ProductGroupDetailResponse
}

const ListVariant = ({ variant, currentProduct }: ListVariantProps) => {
    const { control, setValue } = useFormContext<CartFormValues>()
    const [selectedOptions, setSelectedOptions] = useState<string[]>([])

    // Khi vào trang, auto chọn các option trong currentProduct
    useEffect(() => {
        if (currentProduct?.options) {
            const ids = currentProduct.options.map((o) => o.id)
            setSelectedOptions(ids)
            setValue('option_id', ids)
        }
    }, [currentProduct, setValue])

    // Khi user chọn option (1 option/variant)
    const handleSelect = (variantId: string, optionId: string) => {
        setSelectedOptions((prev) => {
            // Xóa option cũ cùng variant
            const otherOptions = prev.filter((id) => {
                const isSameVariant = variant.some((g) =>
                    g.options.some((o) => o.id === id && g.variant.id == variantId)
                )
                return !isSameVariant
            })

            const newSelected = [...otherOptions, optionId]
            setValue('option_id', newSelected)
            return newSelected
        })
    }

    return (
        <Controller
            control={control}
            name="option_id"
            render={() => (
                <div className="flex flex-col gap-4">
                    {variant.map((group) => (
                        <div key={group.variant.id} className="flex flex-col gap-2">
                            <span className="font-semibold text-gray-700">
                                {group.variant.name}
                            </span>

                            <div className="flex gap-2 flex-wrap">
                                {group.options.map((option) => {
                                    const isSelected = selectedOptions.includes(option.id)

                                    return (
                                        <div
                                            key={option.id}
                                            className={`cursor-pointer ${isSelected ? 'border-2 border-primary rounded-sm' : 'border border-gray-300 rounded-sm'
                                                }`}
                                            onClick={() => handleSelect(group.variant.id, option.id)}
                                        >
                                            {option.image_url ? (
                                                <div className='shadow-sm bg-white rounded-sm border border-gray-300 p-2'>
                                                    <Image
                                                        src={option.image_url}
                                                        width={50}
                                                        height={50}
                                                        alt={option.label || group.variant.name}
                                                        className=""
                                                        unoptimized
                                                    />
                                                    {option.img_description}
                                                </div>
                                            ) : (
                                                <div
                                                    className={`px-3 py-1 rounded-md text-sm font-semibold`}
                                                >
                                                    {option.label}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        />
    )
}

export default ListVariant
