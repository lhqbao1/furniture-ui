'use client'
// Import Skeleton for the fallback
import ProductFormSkeleton from "@/components/layout/admin/products/products-form/product-form-skeleton"
import { useEditProduct, useGetProductById } from "@/features/products/hook"
import React, { useEffect } from "react"
import { useRouter } from "@/src/i18n/navigation"
import { ProductInput } from "@/lib/schema/product"
import { toast } from "sonner"
// Import ProductForm is no longer needed here
import { useLocale } from "next-intl"
import AdminBackButton from "@/components/shared/admin-back-button"

// 1. Lazy load the heavy component
const ProductForm = React.lazy(
    () => import("@/components/layout/admin/products/products-form/add-product-form")
);

const EditProductPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = React.use(params)
    const router = useRouter()
    const locale = useLocale()
    const editProduct = useEditProduct()

    // The manual prefetch is now less critical but still useful as a progressive enhancement
    // for users on slower connections, helping to load the bundle even before the component mounts.
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
        <div>
            <AdminBackButton />
            <div className="lg:p-6 p-2 mt-6 lg:mt-0">
                <h1 className="text-xl font-bold mb-4">Edit Product</h1>
                {/* 2. Wrap the lazy-loaded component with Suspense */}
                <React.Suspense fallback={<ProductFormSkeleton />}>
                    <ProductForm
                        productValues={data}
                        onSubmit={handleEdit}
                        isPending={editProduct.isPending}
                    />
                </React.Suspense>
            </div>
        </div>
    )
}

export default EditProductPage