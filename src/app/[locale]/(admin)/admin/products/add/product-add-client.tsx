'use client'
import ProductForm from '@/components/layout/admin/products/products-form/add-product-form'
// import ProductForm from '@/components/layout/admin/products/products-form/add-product-form'
import { useAddProduct } from '@/features/products/hook'
import { ProductInput } from '@/lib/schema/product'
import dynamic from 'next/dynamic'
import React, { useEffect } from 'react'
import { toast } from 'sonner'



const ProductAddClient = () => {
    const addProduct = useAddProduct()
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

    useEffect(() => {
        // Prefetch form khi rảnh
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                import('@/components/layout/admin/products/products-form/add-product-form')
            })
        } else {
            setTimeout(() => {
                import('@/components/layout/admin/products/products-form/add-product-form')
            }, 2000)
        }
    }, [])

    return (
        <ProductForm
            onSubmit={handleAddProduct}
            isPending={addProduct.isPending}
        />
    )
}

export default ProductAddClient