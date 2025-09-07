'use client'
import ProductForm from '@/components/layout/admin/products/products-form/add-product-form'
import { Button } from '@/components/ui/button'
import { useAddProduct } from '@/features/products/hook'
import { Products } from '@/lib/schema/product'
import React from 'react'
import { toast } from 'sonner'

const ProductAddClient = () => {
    const addProduct = useAddProduct()

    const handleAddProduct = async (values: Products) => {
        addProduct.mutate(values, {
            onSuccess: () => {
                toast.success("Product added successfully!")
            },
            onError: () => {
                toast.error("Failed to add product")
            },
        })
    }


    return (
        <ProductForm
            onSubmit={handleAddProduct}
            isPending={addProduct.isPending}
        />
    )
}

export default ProductAddClient