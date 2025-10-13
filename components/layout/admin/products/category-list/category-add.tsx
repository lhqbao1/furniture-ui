'use client'

import { BannerInput } from '@/components/shared/banner-input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Loader2, Mic, Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { productsColumn } from './all-product-columns'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { selectedCategoryAtom, selectedCategoryNameAtom } from '@/store/category'
import { useAtom } from 'jotai'
import { useQuery } from '@tanstack/react-query'
import { getCategoryById } from '@/features/category/api'
import SkeletonTable from './table-skeleton'
import { useAddProductToCategory, useRemoveProductFromCategory } from '@/features/category/hook'
import { AddOrRemoveProductToCategoryInput } from '@/types/categories'
import { toast } from 'sonner'

const CategoryAdd = () => {
    const [searchTerm, setSearchTerm] = useState("")

    const [selectedCategory] = useAtom(selectedCategoryAtom)
    const [selectedCategoryName, setSelectedCategoryName] = useAtom(selectedCategoryNameAtom)

    const [productsSelection, setProductsSelection] = useState({});
    const [categorySelection, setCategorySelection] = useState({});

    const addProductToCategoryMutation = useAddProductToCategory()
    const removeProductToCategoryMutation = useRemoveProductFromCategory()


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

    const filteredProductsData = React.useMemo(() => {
        if (!searchTerm) return productsData
        return productsData.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.id_provider.toString().includes(searchTerm)
        )
    }, [productsData, searchTerm])



    //Create table not in category
    const productsTable = useReactTable({
        data: filteredProductsData,
        columns,
        state: {
            rowSelection: productsSelection,
        },
        onRowSelectionChange: setProductsSelection,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
    });

    //Create table in category
    const categoryProductsTable = useReactTable({
        data: categoryData,
        columns,
        state: {
            rowSelection: categorySelection,
        },
        onRowSelectionChange: setCategorySelection,
        getCoreRowModel: getCoreRowModel(),
        enableRowSelection: true,
    });

    // Check row selection for button disable
    const hasSelectedProducts = productsTable.getSelectedRowModel().rows.length > 0
    const hasSelectedCategoryProducts = categoryProductsTable.getSelectedRowModel().rows.length > 0

    // reset selection khi data thay đổi
    useEffect(() => {
        setProductsSelection({});
    }, [productsData]);

    useEffect(() => {
        setCategorySelection({});
    }, [categoryData]);

    // xử lý Add
    const handleAdd = () => {
        const selectedRows = productsTable.getSelectedRowModel().rows.map(r => r.original);

        // Lấy ra mảng id
        const data: AddOrRemoveProductToCategoryInput = {
            products: selectedRows.map(product => product.id),
        };

        if (data.products.length <= 0) {
            toast.error("You need to choose at least one product")
        } else {
            addProductToCategoryMutation.mutate({ input: data, categoryId: selectedCategory }, {
                onSuccess(data, variables, context) {
                    toast.success("Add products to category successful")
                },
                onError(error, variables, context) {
                    toast.success("Add products to category fail")
                },
            })
        }
    };

    const handleRemove = () => {
        const selectedRows = categoryProductsTable.getSelectedRowModel().rows.map(r => r.original)

        // Lấy ra mảng id
        const data: AddOrRemoveProductToCategoryInput = {
            products: selectedRows.map(product => product.id),
        };

        if (data.products.length <= 0) {
            toast.error("You need to choose at least one product")
        } else {
            removeProductToCategoryMutation.mutate({ input: data, categoryId: selectedCategory }, {
                onSuccess(data, variables, context) {
                    toast.success("Remove products from category successful")
                },
                onError(error, variables, context) {
                    toast.success("Remove products from category fail")
                },
            })
        }

    }

    return (
        <div className='gap-6 w-full space-y-6'>
            {/* Tables */}
            <div className='space-y-4 w-full grid grid-cols-12 gap-6'>
                <div className='col-span-12 grid grid-cols-12'>
                    {/* Search */}
                    <div className="flex justify-start items-center gap-2 relative pt-6 w-full col-span-5">
                        <div className={cn('w-full relative flex')}>
                            <BannerInput
                                type="email"
                                placeholder=""
                                className='w-full h-10 pl-10'
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button type="submit" variant="default" className='absolute right-0 rounded-full bg-primary text-white xl:text-lg text-sm px-8 text-center h-10'>
                                Search
                            </Button>
                            <Search size={24} className='absolute left-3 top-2' stroke='gray' />
                        </div>
                    </div>
                </div>

                <div className='space-y-6 col-span-5'>
                    <h2 className='text-[#666666] text-2xl font-semibold text-center'>All products</h2>
                    {/* Not in category */}
                    <div className="overflow-hidden rounded-md border flex-1 space-y-4">
                        {categoryProductsLoading ? (
                            <SkeletonTable columns={productsColumn.length} rows={5} />
                        ) : (
                            <div className='max-h-[850px] overflow-y-scroll'>
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
                            </div>
                        )}
                    </div>
                </div>

                {/* Add / Remove Buttons */}
                <div className='flex flex-col gap-8 justify-center col-span-2'>
                    <Button
                        onClick={handleAdd}
                        disabled={!hasSelectedProducts || addProductToCategoryMutation.isPending}
                    >
                        {addProductToCategoryMutation.isPending ?
                            <Loader2 className='animate-spin' />
                            : 'Add →'}
                    </Button>

                    <Button
                        onClick={handleRemove}
                        variant={'secondary'}
                        disabled={!hasSelectedCategoryProducts || removeProductToCategoryMutation.isPending}
                    >
                        {removeProductToCategoryMutation.isPending ?
                            <Loader2 className='animate-spin' />
                            : '← Remove'}
                    </Button>
                </div>


                {/* In category */}
                <div className='col-span-5 space-y-6'>
                    <h2 className='text-[#666666] text-2xl font-semibold text-center'>{selectedCategoryName}</h2>

                    <div className="overflow-hidden rounded-md border">
                        {categoryProductsLoading ? (
                            <SkeletonTable columns={productsColumn.length} rows={5} />
                        ) : (
                            <div className='max-h-[600px] overflow-y-scroll'>
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
                            </div>
                        )}


                    </div>
                </div>
            </div>
        </div>
    )
}

export default CategoryAdd
