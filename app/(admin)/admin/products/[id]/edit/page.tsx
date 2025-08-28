'use client'
import { EditProductFormClient } from "./product-edit-client"
import { useGetProductById } from "@/features/products/hook"
import React from "react"

const EditProductPage = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = React.use(params) // unwrap Promise

    const { data, isLoading, isError } = useGetProductById(id)
    if (isError) return <div>No data</div>
    if (isLoading) return <div>Loading</div>

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Edit Product</h1>
            <EditProductFormClient product={data} />
        </div>
    )
}

export default EditProductPage
