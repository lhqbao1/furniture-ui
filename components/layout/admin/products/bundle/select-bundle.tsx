'use client'
import { useGetProductsSelect } from '@/features/product-group/hook'
import React, { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ProductItem } from '@/types/products';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useGetAllProducts } from '@/features/products/hook';

type SelectedProduct = {
    product: ProductItem;
    amount: number;
};

const SelectBundleComponent = () => {
    const form = useFormContext()
    const { setValue } = form
    const [listProducts, setListProducts] = useState<SelectedProduct[]>([])
    const [queryParams, setQueryParams] = useState('')
    const [open, setOpen] = useState(false)

    const { data: products, isLoading, isError } = useGetAllProducts({ search: queryParams, all_products: true })

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

    const filteredProducts =
        products?.items?.filter((p: ProductItem) => !listProducts.some((lp) => lp.product.id === p.id)) ?? []


    // ✅ Mỗi khi listProducts thay đổi → cập nhật vào form
    useEffect(() => {
        const bundles = listProducts.map((item) => ({
            product_id: item.product.id,
            quantity: item.amount,
        }))
        setValue("bundles", bundles)
    }, [listProducts, setValue])

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
                            <div className="flex gap-4">
                                {/* {selectedAction[idx]
                                    ?
                                    <div className="flex gap-2 items-center overflow-x-scroll">
                                        <Image
                                            src={listProducts?.find((p) => p.id === selectedAction[idx])?.static_files[0].url ?? '/1.png'}
                                            width={40}
                                            height={40}
                                            alt=""
                                            className="h-10 rounded-sm"
                                            unoptimized
                                        />
                                        <div className="text-base">{listProducts?.find((p) => p.id === selectedAction[idx])?.name}</div>
                                        <Link href={`/product/${listProducts?.find((p) => p.id === selectedAction[idx])?.id}`}>
                                            <Eye className="text-secondary cursor-pointer" size={20} />
                                        </Link>
                                    </div>
                                    : "Select product"} */}
                            </div>
                            {/* <ChevronRight /> */}
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
                                                            : "/1.png"
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
                                <div key={product.id} className='grid grid-cols-4 gap-3'>
                                    <div
                                        className="flex col-span-3 items-center gap-3 border rounded-md p-2 hover:bg-accent/40 transition"
                                    >
                                        <Image
                                            src={product.static_files?.[0]?.url ?? "/1.png"}
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
                                        <Link href={`/product/${product.id}`} target="_blank">
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
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SelectBundleComponent