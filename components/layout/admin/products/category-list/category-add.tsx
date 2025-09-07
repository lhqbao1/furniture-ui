'use client'

import { BannerInput } from '@/components/shared/banner-input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Mic, Search } from 'lucide-react'
import React from 'react'
import { productsColumn } from './all-product-columns'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { selectedCategoryAtom } from '@/store/category'
import { useAtom } from 'jotai'
import { useQuery } from '@tanstack/react-query'
import { getCategoryById } from '@/features/category/api'
import SkeletonTable from './table-skeleton'

const CategoryAdd = () => {
    const [selectedCategory] = useAtom(selectedCategoryAtom)

    // Lấy dữ liệu category
    const { data: categoryProducts, isLoading: categoryProductsLoading } = useQuery({
        queryKey: ["category", selectedCategory],
        queryFn: () => getCategoryById(selectedCategory),
        enabled: !!selectedCategory,
        retry: false,
    })

    // Memo hóa dữ liệu và columns để table không reset
    const productsData = React.useMemo(() => categoryProducts?.not_in_category ?? [], [categoryProducts])
    const categoryData = React.useMemo(() => categoryProducts?.in_category ?? [], [categoryProducts])
    const columns = React.useMemo(() => productsColumn, [])

    // Table instance
    const productsTable = useReactTable({
        data: productsData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
    })

    const categoryProductsTable = useReactTable({
        data: categoryData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
    })

    // Xử lý Add / Remove
    const handleAdd = () => {
        const selectedRows = productsTable.getSelectedRowModel().rows.map(r => r.original)
        console.log("Add products:", selectedRows)
        // TODO: gọi API thêm sản phẩm vào category
    }

    const handleRemove = () => {
        const selectedRows = categoryProductsTable.getSelectedRowModel().rows.map(r => r.original)
        console.log("Remove products:", selectedRows)
        // TODO: gọi API xóa sản phẩm khỏi category
    }

    return (
        <div className='gap-6 w-full space-y-6'>
            {/* Search */}
            <div className="flex justify-start items-center gap-2 relative pt-6">
                <div className={cn('xl:w-1/2 w-3/4 relative flex')}>
                    <BannerInput type="email" placeholder="" className='w-full xl:h-12 h-10' />
                    <Button type="submit" variant="default" className='absolute right-0 rounded-full bg-primary text-white xl:text-lg text-sm px-0 pl-1 xl:pr-12 xl:h-12 pr-4 h-10'>
                        <Mic stroke='white' size={24} className='xl:bg-secondary xl:size-3 size-5 xl:h-11 xl:w-11 rounded-full' />
                        Search
                    </Button>
                    <Search size={24} className='absolute left-3 xl:top-3 top-2' stroke='gray' />
                </div>
            </div>

            {/* Tables */}
            <div className='space-y-4 w-full flex gap-4 justify-between'>
                {/* Not in category */}
                <div className="overflow-hidden rounded-md border flex-1">
                    {categoryProductsLoading ? (
                        <SkeletonTable columns={productsColumn.length} rows={5} />
                    ) : (
                        <Table>
                            <TableHeader>
                                {productsTable.getHeaderGroups().map(headerGroup => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {productsTable.getRowModel().rows.length ? (
                                    productsTable.getRowModel().rows.map(row => (
                                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                            {row.getVisibleCells().map(cell => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={productsColumn.length} className="h-24 text-center">
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>

                {/* Add / Remove Buttons */}
                <div className='flex flex-col gap-8 justify-center'>
                    <Button onClick={handleAdd}>Add →</Button>
                    <Button onClick={handleRemove}>← Remove</Button>
                </div>

                {/* In category */}
                <div className="overflow-hidden rounded-md border flex-1">
                    {categoryProductsLoading ? (
                        <SkeletonTable columns={productsColumn.length} rows={5} />
                    ) : (
                        <Table>
                            <TableHeader>
                                {categoryProductsTable.getHeaderGroups().map(headerGroup => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {categoryProductsTable.getRowModel().rows.length ? (
                                    categoryProductsTable.getRowModel().rows.map(row => (
                                        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                            {row.getVisibleCells().map(cell => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={productsColumn.length} className="h-24 text-center">
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CategoryAdd
