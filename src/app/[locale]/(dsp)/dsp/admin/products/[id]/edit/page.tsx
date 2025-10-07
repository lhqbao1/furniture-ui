'use client'
import ProductFormSkeleton from "@/components/layout/admin/products/products-form/product-form-skeleton"
import React from "react"
import { useRouter } from "@/src/i18n/navigation"
import { ProductInput } from "@/lib/schema/product"
import { toast } from "sonner"
import { useLocale } from "next-intl"
import { useEditProductDSP, useGetProductByIdDSP } from "@/features/dsp/products/hook"
import dynamic from "next/dynamic";

const ProductFormDSP = dynamic(
    () => import("@/components/layout/dsp/admin/products/add/product-add-or-edit"),
    {
        ssr: false, // chỉ load ở client
        loading: () => <ProductFormSkeleton />
    }
);
const EditProductDSPPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = React.use(params)
    const router = useRouter()
    const locale = useLocale()
    const editProductDSPMutation = useEditProductDSP()

    const { data, isLoading, isError } = useGetProductByIdDSP(id)
    if (isError) return <div>Error</div>
    if (isLoading || !data) return <ProductFormSkeleton />

    const handleEdit = (values: ProductInput) => {
        editProductDSPMutation.mutate(
            { product_id: data.id ?? "", input: values },
            {
                onSuccess: () => {
                    toast.success("Product updated successfully")
                    router.push("/dsp/admin/products/list", { locale })
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
            <ProductFormDSP productValues={data} onSubmit={handleEdit} isPending={editProductDSPMutation.isPending} />
        </div>
    )
}

export default EditProductDSPPage
