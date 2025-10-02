'use client'
import AddBrandDialog from '@/components/layout/admin/products/brand/add-brand-dialog'
import AddBrandForm from '@/components/layout/admin/products/brand/add-brand-form'
import { brandColumns } from '@/components/layout/admin/products/brand/columns'
import { ProductTable } from '@/components/layout/admin/products/products-list/product-table'
import ProductTableSkeleton from '@/components/shared/table-skeleton'
import { Button } from '@/components/ui/button'
import { useGetBrands } from '@/features/brand/hook'
import React, { useState } from 'react'

const BrandListPage = () => {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const { data, isLoading, isError } = useGetBrands()

    if (isError) return <div>No data</div>

    return (
        <div className='space-y-12'>
            <div className='section-header'>Product Brands</div>
            <div>
                <div className='flex justify-end'>
                    <AddBrandDialog />
                </div>
                {/* <TableToolbar
                pageSize={pageSize}
                setPageSize={setPageSize} // đảm bảo type đúng
                addButtonText='Add Brand'
                addButtonUrl='/admin/products/add'
            /> */}
                {isLoading || !data ? <ProductTableSkeleton /> :
                    <ProductTable
                        data={data ? data : []}
                        columns={brandColumns}
                        page={page}
                        pageSize={pageSize}
                        setPage={setPage}
                        setPageSize={setPageSize}
                        totalItems={data.length}
                        totalPages={data.length / pageSize}
                        addButtonText='Add Brand'
                        isAddButtonModal
                        addButtonModalContent={<AddBrandForm />}
                    />
                }
            </div>
        </div>
    )
}

export default BrandListPage