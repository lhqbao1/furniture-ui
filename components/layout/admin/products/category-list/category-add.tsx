'use client'

import { BannerInput } from '@/components/shared/banner-input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { Loader2, Search } from 'lucide-react'
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
  const [selectedCategoryName] = useAtom(selectedCategoryNameAtom)

  const [productsSelection, setProductsSelection] = useState({})
  const [categorySelection, setCategorySelection] = useState({})

  const addProductToCategoryMutation = useAddProductToCategory()
  const removeProductToCategoryMutation = useRemoveProductFromCategory()

  const { data: categoryProducts, isLoading: categoryProductsLoading } = useQuery({
    queryKey: ["category", selectedCategory],
    queryFn: () => getCategoryById(selectedCategory),
    enabled: !!selectedCategory,
    retry: false,
  })

  const productsData = React.useMemo(() => categoryProducts?.not_in_category ?? [], [categoryProducts])
  const categoryData = React.useMemo(() => categoryProducts?.in_category ?? [], [categoryProducts])
  const columns = React.useMemo(() => productsColumn, [])

  const filteredProductsData = React.useMemo(() => {
    if (!searchTerm) return productsData
    return productsData.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id_provider.toString().includes(searchTerm),
    )
  }, [productsData, searchTerm])

  const productsTable = useReactTable({
    data: filteredProductsData,
    columns,
    state: {
      rowSelection: productsSelection,
    },
    onRowSelectionChange: setProductsSelection,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
  })

  const categoryProductsTable = useReactTable({
    data: categoryData,
    columns,
    state: {
      rowSelection: categorySelection,
    },
    onRowSelectionChange: setCategorySelection,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
  })

  const hasSelectedProducts = productsTable.getSelectedRowModel().rows.length > 0
  const hasSelectedCategoryProducts = categoryProductsTable.getSelectedRowModel().rows.length > 0

  useEffect(() => {
    setProductsSelection({})
  }, [productsData])

  useEffect(() => {
    setCategorySelection({})
  }, [categoryData])

  const handleAdd = () => {
    if (!selectedCategory) {
      toast.error("Please select a category first")
      return
    }

    const selectedRows = productsTable.getSelectedRowModel().rows.map((r) => r.original)

    const data: AddOrRemoveProductToCategoryInput = {
      products: selectedRows.map((product) => product.id),
    }

    if (data.products.length <= 0) {
      toast.error("You need to choose at least one product")
      return
    }

    addProductToCategoryMutation.mutate(
      { input: data, categoryId: selectedCategory },
      {
        onSuccess() {
          toast.success("Add products to category successful")
        },
        onError() {
          toast.error("Add products to category fail")
        },
      },
    )
  }

  const handleRemove = () => {
    if (!selectedCategory) {
      toast.error("Please select a category first")
      return
    }

    const selectedRows = categoryProductsTable.getSelectedRowModel().rows.map((r) => r.original)

    const data: AddOrRemoveProductToCategoryInput = {
      products: selectedRows.map((product) => product.id),
    }

    if (data.products.length <= 0) {
      toast.error("You need to choose at least one product")
      return
    }

    removeProductToCategoryMutation.mutate(
      { input: data, categoryId: selectedCategory },
      {
        onSuccess() {
          toast.success("Remove products from category successful")
        },
        onError() {
          toast.error("Remove products from category fail")
        },
      },
    )
  }

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-2xl">
          <div className={cn("relative flex w-full")}>
            <BannerInput
              type="text"
              placeholder="Search product by name or provider ID..."
              className="h-11 w-full pl-10 pr-28"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button
              type="button"
              variant="default"
              className="absolute right-1.5 top-1.5 h-8 rounded-full px-6 text-sm"
            >
              Search
            </Button>
            <Search
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />
          </div>
        </div>

        <div className="rounded-lg border border-[#d8ebde] bg-[#f5fbf7] px-3 py-2 text-sm text-[#355c43]">
          Selected category:{" "}
          <span className="font-semibold">
            {selectedCategoryName || "Not selected"}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_220px_minmax(0,1fr)]">
        <div className="order-1 min-w-0 rounded-xl border border-gray-200 bg-[#fcfdfc] p-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#334155] sm:text-lg">All products</h2>
            <span className="rounded-full bg-[#e8f7ee] px-2 py-1 text-xs font-medium text-[#1f7a44]">
              {filteredProductsData.length} items
            </span>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            {categoryProductsLoading ? (
              <SkeletonTable columns={productsColumn.length} rows={5} />
            ) : (
              <div className="max-h-[520px] overflow-auto">
                <div className="min-w-[540px]">
                  <Table>
                    <TableHeader>
                      {productsTable.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {productsTable.getRowModel().rows.length ? (
                        productsTable.getRowModel().rows.map((row) => (
                          <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                            {row.getVisibleCells().map((cell) => (
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
              </div>
            )}
          </div>
        </div>

        <div className="order-3 flex flex-col justify-center gap-3 xl:order-2">
          <Button
            onClick={handleAdd}
            disabled={!selectedCategory || !hasSelectedProducts || addProductToCategoryMutation.isPending}
            className="h-11"
          >
            {addProductToCategoryMutation.isPending ? <Loader2 className="animate-spin" /> : 'Add →'}
          </Button>

          <Button
            onClick={handleRemove}
            variant={'secondary'}
            disabled={!selectedCategory || !hasSelectedCategoryProducts || removeProductToCategoryMutation.isPending}
            className="h-11"
          >
            {removeProductToCategoryMutation.isPending ? <Loader2 className="animate-spin" /> : '← Remove'}
          </Button>
        </div>

        <div className="order-2 min-w-0 rounded-xl border border-gray-200 bg-[#fcfdfc] p-3 xl:order-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#334155] sm:text-lg">
              {selectedCategoryName || "Category products"}
            </h2>
            <span className="rounded-full bg-[#fff3e6] px-2 py-1 text-xs font-medium text-[#b86a0f]">
              {categoryData.length} items
            </span>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200">
            {categoryProductsLoading ? (
              <SkeletonTable columns={productsColumn.length} rows={5} />
            ) : (
              <div className="max-h-[520px] overflow-auto">
                <div className="min-w-[540px]">
                  <Table>
                    <TableHeader>
                      {categoryProductsTable.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id}>
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {categoryProductsTable.getRowModel().rows.length ? (
                        categoryProductsTable.getRowModel().rows.map((row) => (
                          <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                            {row.getVisibleCells().map((cell) => (
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryAdd
