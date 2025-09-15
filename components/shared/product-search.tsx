"use client"

import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "../ui/input"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useGetProductsSelect } from "@/features/product-group/hook"
import { ProductItem } from "@/types/products"
import Image from "next/image"
import { useTranslations } from "next-intl"
import {
    Command,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
} from "@/components/ui/command"
import { createPortal } from "react-dom"

export default function ProductSearch({ height }: { height?: boolean }) {
    const t = useTranslations()
    const [query, setQuery] = React.useState("")
    const [debouncedQuery, setDebouncedQuery] = React.useState("")
    const [open, setOpen] = React.useState(false)
    const router = useRouter()
    const containerRef = React.useRef<HTMLDivElement>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)

    // debounce query
    React.useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedQuery(query)
        }, 400)
        return () => clearTimeout(timeout)
    }, [query])

    // Đóng khi click ra ngoài
    React.useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const { data: products, isLoading } = useGetProductsSelect(debouncedQuery)
    const results = products ?? []

    // Tính toán vị trí dropdown
    const [dropdownStyle, setDropdownStyle] = React.useState<React.CSSProperties>({})
    React.useEffect(() => {
        if (open && inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect()
            setDropdownStyle({
                position: "fixed",
                top: rect.bottom + 4, // 4px cách input
                left: rect.left,
                width: rect.width,
                zIndex: 9999,
            })
        }
    }, [open, query])

    return (
        <div ref={containerRef} className="flex justify-center items-center gap-2 relative">
            <div className={cn("w-3/4 relative flex flex-col", height ? "mr-0" : "")} ref={inputRef}>
                <div className="relative flex">
                    <Input
                        type="text"
                        placeholder={`${t("search")}...`}
                        className="w-full xl:h-12 h-10 pl-4 rounded-full border bg-white ring-0"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value)
                        }}
                        onFocus={() => setOpen(true)}
                    />
                    <Search
                        size={24}
                        className="absolute right-4 xl:top-3 top-2"
                        stroke="black"
                    />
                </div>
            </div>

            {/* Dropdown render ra body */}
            {open && query &&
                createPortal(
                    <div style={dropdownStyle} className="bg-white shadow rounded-md">
                        <Command shouldFilter={false} className="max-h-[300px] overflow-y-scroll">
                            <CommandList>
                                <CommandEmpty>
                                    {isLoading ? "Loading..." : "No results found."}
                                </CommandEmpty>
                                {results.length > 0 && (
                                    <CommandGroup>
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
                                                            src={product.static_files.length > 0 ? product.static_files[0].url : "/1.png"}
                                                            height={50}
                                                            width={50}
                                                            alt=""
                                                            className="h-12 w-12"
                                                            unoptimized
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
                    </div>,
                    document.body
                )
            }
        </div>
    )
}
