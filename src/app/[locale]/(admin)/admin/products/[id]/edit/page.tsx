'use client'
import ProductFormSkeleton from "@/components/layout/admin/products/products-form/product-form-skeleton"
import { useEditProduct, useGetProductById } from "@/features/products/hook"
import React, { useEffect } from "react"
import { useRouter } from "@/src/i18n/navigation"
import { ProductInput } from "@/lib/schema/product"
import { toast } from "sonner"
import ProductForm from "@/components/layout/admin/products/products-form/add-product-form"
import { useLocale } from "next-intl"


const EditProductPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = React.use(params)
    const router = useRouter()
    const locale = useLocale()
    const editProduct = useEditProduct()

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

    const { data, isLoading, isError } = useGetProductById(id)
    if (isError) return <div>No data</div>
    if (isLoading || !data) return <ProductFormSkeleton />

    const handleEdit = (values: ProductInput) => {
        editProduct.mutate(
            { id: data.id ?? "", input: values },
            {
                onSuccess: () => {
                    toast.success("Product updated successfully")
                    router.push("/admin/products/list", { locale })
                },
                onError: () => {
                    toast.error("Failed to update product")
                },
            }
        )
    }

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Edit Product</h1>
            <ProductForm productValues={data} onSubmit={handleEdit} isPending={editProduct.isPending} />
        </div>
    )
}

export default EditProductPage
