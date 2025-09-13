"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import {
    Command,
    CommandInput,
    CommandItem,
    CommandList,
    CommandEmpty,
    CommandGroup,
} from "@/components/ui/command"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useGetProductsSelect } from "@/features/product-group/hook"
import { ProductItem } from "@/types/products"
import Image from "next/image"

export default function MobileProductSearch() {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [debouncedQuery, setDebouncedQuery] = React.useState("")
    const router = useRouter()

    // debounce query
    React.useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedQuery(query)
        }, 400)
        return () => clearTimeout(timeout)
    }, [query])

    const { data: products, isLoading } = useGetProductsSelect(debouncedQuery)
    const results = products ?? []

    return (
        <div className="block md:hidden">
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Search className="text-[#00B159]" size={30} />
                </DialogTrigger>
                <DialogContent className="p-1.5 w-3/4 h-3/4">
                    <Command className="h-full" shouldFilter={false}>
                        <div className="p-2 border-b">
                            <CommandInput
                                placeholder="Search products..."
                                value={query}
                                onValueChange={setQuery}
                                autoFocus
                            />
                        </div>
                        <CommandList className="flex-1 overflow-auto">
                            {isLoading && <CommandEmpty>Loading...</CommandEmpty>}
                            {!isLoading && results.length === 0 && (
                                <CommandEmpty>No results found.</CommandEmpty>
                            )}
                            {results.length > 0 && (
                                <CommandGroup heading="Products">
                                    {results.map((product: ProductItem) => (
                                        <CommandItem
                                            key={product.id}
                                            value={product.name}
                                            onSelect={() => {
                                                router.push(`/product/${product.id}`)
                                                setQuery("")
                                                setOpen(false)
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex justify-between items-center w-full">
                                                <div className="flex gap-3 flex-1 items-center">
                                                    <Image
                                                        src={
                                                            product.static_files
                                                                ? product.static_files[0].url
                                                                : "/1.png"
                                                        }
                                                        height={50}
                                                        width={50}
                                                        alt=""
                                                        className="h-12 w-12"
                                                        unoptimized
                                                    />
                                                    <div className="font-semibold line-clamp-2">{product.name}</div>
                                                </div>
                                                <div className="text-[#666666]">
                                                    {product.id_provider}
                                                </div>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                    </Command>
                </DialogContent>
            </Dialog>
        </div>
    )
}
