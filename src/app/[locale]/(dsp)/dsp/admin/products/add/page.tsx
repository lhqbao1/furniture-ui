'use client'
import ProductForm from '@/components/layout/admin/products/products-form/add-product-form'
import ProductFormDSP from '@/components/layout/dsp/admin/products/add/product-add-or-edit'
import { useAddProductDSP } from '@/features/dsp/products/hook'
import { ProductInput } from '@/lib/schema/product'
import React from 'react'
import { toast } from 'sonner'

const ProductAddDsp = () => {
    const addProduct = useAddProductDSP()
    const handleAddProduct = async (values: ProductInput) => {
        addProduct.mutate(values, {
            onSuccess: () => {
                toast.success("Product added successfully!")
            },
            onError: (error) => {
                toast.error(`Failed to add product ${error}`)
            },
        })
    }

    return (
        <div className='grid grid-cols-12 gap-6'>
            <div className='col-span-12 flex flex-col gap-6'>
                <ProductFormDSP
                    onSubmit={handleAddProduct}
                    isPending={addProduct.isPending}
                />
            </div>
        </div>
    )
}

export default ProductAddDsp