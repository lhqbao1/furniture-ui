'use client'
import ProductFormSkeleton from "@/components/layout/admin/products/products-form/product-form-skeleton"
import { useAddProduct, useEditProduct, useGetProductById } from "@/features/products/hook"
import React from "react"
import { useRouter } from "@/src/i18n/navigation"
import { ProductInput } from "@/lib/schema/product"
import { toast } from "sonner"
import ProductForm from "@/components/layout/admin/products/products-form/add-product-form"
import { useLocale } from "next-intl"

const CloneProductPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = React.use(params) // unwrap Promise
    const router = useRouter()
    const locale = useLocale()
    const createProductMutation = useAddProduct()

    const { data, isLoading, isError } = useGetProductById(id)
    if (isError) return <div>No data</div>
    if (isLoading || !data) return <ProductFormSkeleton />

    const handleCreate = (values: ProductInput) => {
        createProductMutation.mutate(values, {
            onSuccess: () => {
                toast.success("Product added successfully!")
                router.push("/admin/products/list", { locale })
            },
            onError: (error) => {
                toast.error(`Failed to add product ${error}`)
            },
        })
    }

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Clone Product</h1>
            <ProductForm productValuesClone={data} onSubmit={handleCreate} isPending={createProductMutation.isPending} />
        </div>
    )
}

export default CloneProductPage
