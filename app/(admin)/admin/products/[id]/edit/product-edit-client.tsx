"use client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ProductItem } from "@/types/products"
import { useEditProduct } from "@/features/products/hook"
import ProductForm from "@/components/layout/admin/products/products-form/add-product-form"

export function EditProductFormClient({ product }: { product: ProductItem }) {
    const router = useRouter()
    const editProduct = useEditProduct()

    const handleEdit = (values: ProductItem) => {
        editProduct.mutate(
            { id: product.id ?? "", input: values },
            {
                onSuccess: () => {
                    toast.success("Product updated successfully")
                    router.push("/admin/products/list")
                },
                onError: () => {
                    toast.error("Failed to update product")
                },
            }
        )
    }

    return <ProductForm productValues={product} onSubmit={handleEdit} isPending={editProduct.isPending} />
}
