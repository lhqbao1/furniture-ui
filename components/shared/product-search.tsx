"use client"

import * as React from "react"
import { Mic, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { Input } from "../ui/input"
import { useGetProductsSelect } from "@/features/product-group/hook"
import { NewProductItem } from "@/types/products"
import Image from "next/image"

export default function ProductSearch({ height }: { height?: boolean }) {
    const [query, setQuery] = React.useState("")
    const [debouncedQuery, setDebouncedQuery] = React.useState("")
    const router = useRouter()

    // debounce query để tránh gọi API liên tục
    React.useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedQuery(query)
        }, 400)
        return () => clearTimeout(timeout)
    }, [query])

    // gọi API với param search
    const { data: products, isLoading, isError } = useGetProductsSelect(debouncedQuery)

    const results = products ?? []

    return (
        <div className="flex justify-center items-center gap-2 relative pt-6">
            <div
                className={cn(
                    "xl:w-1/2 w-3/4 relative flex flex-col",
                    height ? "mr-0" : "xl:mr-56"
                )}
            >
                {/* Thanh search gốc */}
                <div className="relative flex">
                    <Input
                        type="text"
                        placeholder="Search..."
                        className="w-full xl:h-12 h-10 pl-10 pr-28 rounded-full border bg-white ring-0"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Button
                        type="button"
                        variant="default"
                        className="absolute right-0 rounded-full bg-primary text-white xl:text-lg text-sm px-0 pl-1 xl:pr-12 xl:h-12 pr-4 h-10"
                    >
                        <Mic
                            stroke="white"
                            size={24}
                            className="xl:bg-secondary xl:size-3 size-5 xl:h-11 xl:w-11 rounded-full"
                        />
                        Search
                    </Button>
                    <Search
                        size={24}
                        className="absolute left-3 xl:top-3 top-2"
                        stroke="gray"
                    />
                </div>

                {/* Dropdown */}
                {query && (
                    <Command shouldFilter={false} className="max-h-[300px] overflow-y-scroll mt-1">
                        <CommandList>
                            <CommandEmpty>
                                {isLoading ? "Loading..." : "No results found."}
                            </CommandEmpty>
                            {results.length > 0 && (
                                <CommandGroup>
                                    {results.map((product: NewProductItem) => (
                                        <CommandItem
                                            key={product.id}
                                            value={product.name}
                                            onSelect={() => router.push(`/${product.id}`)}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex justify-between items-center w-full">
                                                <div className="flex gap-3 flex-1 items-center">
                                                    <Image
                                                        src={product.static_files ? product.static_files[0].url : '/1.png'}
                                                        height={50}
                                                        width={50}
                                                        alt=""
                                                        className="h-12 w-12"
                                                    />
                                                    <div className="font-semibold">{product.name}</div>
                                                </div>
                                                <div className="text-[#666666]">{product.id_provider}</div>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                    </Command>
                )}
            </div>
        </div>
    )
}
