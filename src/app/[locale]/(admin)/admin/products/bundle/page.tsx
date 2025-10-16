'use client'
import ProductBundleForm from '@/components/layout/admin/products/bundle/product-bundle-form'
import ProductForm from '@/components/layout/admin/products/products-form/add-product-form'
import AdminBackButton from '@/components/shared/admin-back-button'
import { useAddProduct } from '@/features/products/hook'
import { ProductInput } from '@/lib/schema/product'
import React from 'react'
import { toast } from 'sonner'

const ProductBundle = () => {
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
    return (
        <div className='space-y-6'>
            <AdminBackButton />
            <ProductBundleForm
                onSubmit={handleAddProduct}
                isPending={addProduct.isPending}
            />
        </div>
    )
}

export default ProductBundle