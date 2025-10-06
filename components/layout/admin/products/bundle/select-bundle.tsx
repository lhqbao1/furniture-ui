import { useGetProductsSelect } from '@/features/product-group/hook'
import React, { useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const SelectBundleComponent = () => {
    const form = useFormContext()
    const [listProducts, setListProducts] = useState([])
    const [queryParams, setQueryParams] = useState('')
    const [open, setOpen] = useState(false)


    const { data: products, isLoading, isError } = useGetProductsSelect(queryParams)

    return (
        <div className='space-y-6'>
            <div className="col-span-2 flex gap-2 items-center">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            className="flex-1 justify-between py-1 h-12"
                        >
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
                                {products
                                    ?.map((product) => (
                                        <CommandItem
                                            key={product.id}
                                            value={product.id ?? ""}
                                            // onSelect={(value) => {
                                            //     setSelectedAction((prev) => ({ ...prev, [idx]: value }))
                                            //     setOpenIdx(null) // 👉 đóng popover sau khi chọn
                                            // }}
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
        </div>
    )
}

export default SelectBundleComponent