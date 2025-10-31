'use client'
import { useGetProductsSelect } from '@/features/product-group/hook'
import React, { useEffect, useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ProductItem } from '@/types/products';
import Link from 'next/link';
import { Eye, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useGetAllProducts } from '@/features/products/hook';

type SelectedProduct = {
    product: ProductItem;
    amount: number;
};

interface SelectBundleComponentProps {
    currentProduct?: Partial<ProductItem>
}

const SelectBundleComponent = ({ currentProduct }: SelectBundleComponentProps) => {
    const form = useFormContext()
    const { setValue } = form
    const [listProducts, setListProducts] = useState<SelectedProduct[]>([])
    const [queryParams, setQueryParams] = useState('')
    const [open, setOpen] = useState(false)

    const { data: products, isLoading, isError } = useGetAllProducts({ search: queryParams, all_products: true, page_size: 100 })

    const handleSelectProduct = (product: ProductItem) => {
        setListProducts((prev) => {
            if (prev.some((p) => p.product.id === product.id)) return prev
            return [...prev, { product, amount: 1 }]
        })
    }

    const handleAmountChange = (id: string, value: number) => {
        setListProducts((prev) =>
            prev.map((item) =>
                item.product.id === id ? { ...item, amount: value } : item
            )
        )
    }

    const filteredProducts = useMemo(() => {
        if (!products?.items) return []
        return products.items
            .filter(p => p.id !== currentProduct?.id)
            .filter((p: ProductItem) =>
                !listProducts.some((lp) => lp.product.id === p.id)
            )
    }, [products?.items, listProducts])

    const maxParentStock = useMemo(() => {
        if (listProducts.length === 0) return 0

        // Tính số lượng tối đa có thể tạo cho từng bundle item
        const possibleCounts = listProducts.map(({ product, amount }) => {
            if (!product.stock || amount <= 0) return 0
            return Math.floor(product.stock / amount)
        })

        // Lấy giá trị nhỏ nhất làm giới hạn chung
        return Math.min(...possibleCounts)
    }, [listProducts])

    const handleRemoveBundleItem = (product: ProductItem) => {
        setListProducts((prev) =>
            prev.filter((p) => p.product.id !== product.id)
        )
    }


    // ✅ Khởi tạo listProducts từ currentProduct.bundles (nếu có)
    useEffect(() => {
        if (currentProduct?.bundles?.length) {
            const initialBundles: SelectedProduct[] = currentProduct.bundles.map((b) => ({
                product: b.bundle_item,
                amount: b.quantity,
            }))
            setListProducts(initialBundles)
        }
    }, [currentProduct])


    // ✅ Cập nhật vào form mỗi khi listProducts thay đổi
    useEffect(() => {
        const bundles = listProducts.map((item) => ({
            product_id: item.product.id,
            quantity: item.amount,
        }))
        setValue("bundles", bundles)
    }, [listProducts, setValue])

    useEffect(() => {
        if (maxParentStock > 0) {
            setValue("stock", maxParentStock)
        }
    }, [maxParentStock, setValue])


    return (
        <div className='space-y-6'>
            <div className="col-span-2 flex gap-2 items-center">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild >
                        <Button
                            variant="outline"
                            role="combobox"
                            className="flex-1 justify-between py-1 h-12"
                        >
                            Select Products
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-[600px] p-0">
                        <Command shouldFilter={false}>
                            <CommandInput
                                placeholder="Search product..."
                                value={queryParams}
                                onValueChange={(value) => setQueryParams(value)}
                            />
                            <CommandEmpty>No product found.</CommandEmpty>
                            <CommandGroup className="h-[400px] overflow-y-scroll">
                                {isLoading || !products && <CommandItem disabled>Loading...</CommandItem>}
                                {isError && <CommandItem disabled>Error loading products</CommandItem>}
                                {filteredProducts.length === 0 && !isLoading && (
                                    <CommandItem disabled>All products added</CommandItem>
                                )}

                                {filteredProducts
                                    ?.map((product) => (
                                        <CommandItem
                                            key={product.id}
                                            value={product.id ?? ""}
                                            onSelect={() => handleSelectProduct(product)}
                                            className="flex w-full justify-between"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Image
                                                    src={
                                                        product.static_files.length > 0
                                                            ? product.static_files[0].url
                                                            : "/product-placeholder.png"
                                                    }
                                                    height={25}
                                                    width={25}
                                                    alt=""
                                                    className="rounded-"
                                                    unoptimized
                                                />
                                                <span>{product.name}</span>
                                            </div>
                                            <span>#{product.id_provider}</span>
                                        </CommandItem>
                                    ))}

                            </CommandGroup>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {/* Danh sách sản phẩm đã chọn */}
            <div className='flex flex-col gap-3'>
                {listProducts.length > 0 && (
                    <div className="space-y-2">
                        <div className='grid grid-cols-4 gap-3'>
                            <h3 className="text-sm font-medium text-muted-foreground col-span-3">
                                Selected products
                            </h3>
                            <h3 className="text-sm font-medium text-muted-foreground col-span-1">
                                Amount
                            </h3>
                        </div>
                        <div className="flex flex-col gap-4">
                            {listProducts.map(({ product, amount }) => (
                                <div className='flex gap-3 items-center justify-between' key={product.id}>
                                    <div key={product.id} className='grid grid-cols-4 gap-3 flex-1'>
                                        <div
                                            className="flex col-span-3 items-center gap-3 border rounded-md p-2 hover:bg-accent/40 transition"
                                        >
                                            <Image
                                                src={product.static_files?.[0]?.url ?? "/product-placeholder.png"}
                                                width={50}
                                                height={50}
                                                alt=""
                                                className="rounded-sm !h-[40px] object-cover"
                                                unoptimized
                                            />
                                            <div className="flex flex-col flex-1">
                                                <span className="font-medium">{product.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    #{product.id_provider}
                                                </span>
                                            </div>
                                            <Link href={`/product/${product.url_key}`} target="_blank">
                                                <Eye className="text-secondary cursor-pointer" size={18} />
                                            </Link>
                                        </div>

                                        <Input
                                            type='number'
                                            min={1}
                                            value={amount}
                                            onChange={(e) => handleAmountChange(product.id, Number(e.target.value))}
                                            className='h-full'
                                        />
                                    </div>
                                    <Button variant={'ghost'} onClick={() => handleRemoveBundleItem(product)}>
                                        <X className='text-red-400' />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SelectBundleComponent