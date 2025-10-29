'use client'

import React, { Suspense } from "react"
import { useRouter } from "@/src/i18n/navigation"
import { useLocale } from "next-intl"
import { toast } from "sonner"

import ProductFormSkeleton from "@/components/layout/admin/products/products-form/product-form-skeleton"
import { ProductInput } from "@/lib/schema/product"
import { useEditProduct, useGetProductById } from "@/features/products/hook"

// ✅ Lazy load form đúng cách
const ProductForm = React.lazy(() =>
    import("@/components/layout/admin/products/products-form/add-product-form")
)

const EditProductPage = ({ params }: { params: { id: string } }) => {
    const { id } = params
    const router = useRouter()
    const locale = useLocale()
    const editProduct = useEditProduct()

    const { data, isError, isFetching } = useGetProductById(id)

    // ✅ Khi lỗi
    if (isError) return <div className="p-6">No data</div>

    // ✅ Skeleton chỉ hiển thị khi data lần đầu load (not suspense)
    if (isFetching && !data) return <ProductFormSkeleton />

    const handleEdit = (values: ProductInput) => {
        editProduct.mutate(
            { id: data?.id ?? "", input: values },
            {
                onSuccess: () => {
                    toast.success("Product updated successfully")
                    router.push("/admin/products/list", { locale })
                },
                onError: () => toast.error("Failed to update product"),
            }
        )
    }

    return (
        <div className="lg:p-6 p-2 mt-6 lg:mt-0">
            <h1 className="text-xl font-bold mb-4">Edit Product</h1>

            {/* ✅ Suspense chỉ bao ProductForm, data luôn render sẵn */}
            <Suspense fallback={<ProductFormSkeleton />}>
                {data && (
                    <ProductForm
                        productValues={data}
                        onSubmit={handleEdit}
                        isPending={editProduct.isPending}
                    />
                )}
            </Suspense>
        </div>
    )
}

export default EditProductPage
