'use client'

import { CartFormValues } from '@/lib/schema/cart'
import { Variant } from '@/types/products'
import Image from 'next/image'
import React from 'react'
import { Controller, useFormContext } from 'react-hook-form'

interface ListVariantProps {
    variant: Variant[]
}

const ListVariant = ({ variant }: ListVariantProps) => {
    const { control } = useFormContext<CartFormValues>()

    return (
        <Controller
            control={control}
            name="option_id"
            render={({ field }) => (
                <div className="flex gap-2">
                    {variant[0].options.map((option) => {
                        const isSelected = field.value === option.id
                        return (
                            <div
                                key={option.id}
                                className={`cursor-pointer`}
                                onClick={() => field.onChange(option.id)} // ✅ lưu option.id vào form values
                            >
                                {option.image_url ? (
                                    <Image
                                        src={option.image_url}
                                        width={50}
                                        height={50}
                                        alt={option.label}
                                        className="shadow-sm bg-white rounded-sm"
                                    />
                                ) : (
                                    <div className={`px-2 py-1 rounded-md  text-sm font-semibold ${isSelected ? " border border-primary" : "border border-gray-300"}`}>
                                        {option.label}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        />
    )
}

export default ListVariant
