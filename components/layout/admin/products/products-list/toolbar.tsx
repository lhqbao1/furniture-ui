"use client"

import React, { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { useDebounce } from "use-debounce"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import FilterForm from "./toolbar/filter"
import ImportDialog from "./toolbar/import"
import { useRouter } from "@/src/i18n/navigation"
import { useLocale } from "next-intl"
import { ProductItem } from "@/types/products"
import ExportExcelButton from "./toolbar/export-button"

interface TableToolbarProps {
    searchQuery?: string
    pageSize: number
    setPageSize: React.Dispatch<React.SetStateAction<number>>
    setSearchQuery?: React.Dispatch<React.SetStateAction<string>>
    addButtonText?: string
    isAddButtonModal?: boolean
    addButtonUrl?: string
    addButtonModalContent?: React.ReactNode
    exportData?: ProductItem[]
}

export default function TableToolbar({
    searchQuery,
    pageSize,
    setPageSize,
    setSearchQuery,
    addButtonText,
    isAddButtonModal,
    addButtonUrl,
    addButtonModalContent,
    exportData
}: TableToolbarProps) {
    const router = useRouter()
    const locale = useLocale()
    const [openAddModal, setOpenAddModal] = useState(false)
    const [inputValue, setInputValue] = useState(searchQuery ?? "")
    const [isImporting, setIsImporting] = useState(false)

    useEffect(() => {
        setInputValue(searchQuery ?? "")
    }, [searchQuery])

    // debounce inputValue
    const [debouncedValue] = useDebounce(inputValue, 400)

    useEffect(() => {
        if (debouncedValue !== searchQuery && setSearchQuery) {
            setSearchQuery(debouncedValue)
        }
    }, [debouncedValue, searchQuery, setSearchQuery])

    return (
        <div className="flex items-center justify-between gap-4 p-2 w-full">
            {/* Left group */}
            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="flex items-center gap-1">
                            Group action <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>Delete Selected</DropdownMenuItem>
                        <DropdownMenuItem>Export Selected</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex gap-2 text-sm font-medium">
                    {/* <Button variant="ghost" className="">Export</Button> */}
                    <ExportExcelButton data={exportData ?? []} />
                    <ImportDialog setIsImporting={setIsImporting} />
                </div>
            </div>

            {/* Search (auto, no button) */}
            <div className="flex items-center w-full flex-1">
                <Input
                    placeholder="Search"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                />
            </div>

            {/* Right group */}
            <div className="flex items-center gap-4">
                <Select
                    value={String(pageSize)}
                    onValueChange={(value) => setPageSize(Number(value))}
                >
                    <SelectTrigger className="border text-black cursor-pointer">
                        <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">1 rows</SelectItem>
                        <SelectItem value="5">5 rows</SelectItem>
                        <SelectItem value="10">10 rows</SelectItem>
                        <SelectItem value="20">20 rows</SelectItem>
                        <SelectItem value="50">50 rows</SelectItem>
                    </SelectContent>
                </Select>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-1">
                            Filter <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <FilterForm />
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-1">
                            View <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>Compact</DropdownMenuItem>
                        <DropdownMenuItem>Comfortable</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-1">
                            Columns <ChevronDown className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>Name</DropdownMenuItem>
                        <DropdownMenuItem>Stock</DropdownMenuItem>
                        <DropdownMenuItem>Price</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {addButtonText && (
                    <Button
                        className="bg-primary hover:bg-primary font-semibold"
                        onClick={() => {
                            if (addButtonUrl) {
                                router.push(addButtonUrl, { locale })
                            } else if (isAddButtonModal) {
                                setOpenAddModal(true)
                            }
                        }}
                    >
                        {addButtonText}
                    </Button>
                )}
            </div>

            {isAddButtonModal && (
                <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
                    <DialogContent className="w-1/3">
                        <DialogHeader>
                            <DialogTitle>{addButtonText}</DialogTitle>
                        </DialogHeader>
                        {addButtonModalContent &&
                            React.cloneElement(
                                addButtonModalContent as React.ReactElement<{ onClose?: () => void }>,
                                { onClose: () => setOpenAddModal(false) }
                            )}
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
