import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Mic, ChevronDown } from "lucide-react"
import FilterForm from "./toolbar/filter"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select"

interface TableToolbarProps {
    pageSize: number
    setPageSize: React.Dispatch<React.SetStateAction<number>>
}

export default function TableToolbar({ pageSize, setPageSize }: TableToolbarProps) {
    // Ví dụ: xóa tất cả lựa chọn

    return (
        <div className="flex items-center justify-between gap-4 p-2">
            {/* Left group */}
            <div className="flex items-center gap-4">
                {/* Group Action */}
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

                {/* Export / Import */}
                <div className="flex gap-2 text-sm font-medium">
                    <button className="hover:underline">Export</button>
                    <button className="hover:underline">Import</button>
                </div>
            </div>

            {/* Search */}
            <div className="flex items-center w-[300px] relative">
                <Input placeholder="Search" className="pr-20" />
                <Button className="absolute right-0 rounded-l-none bg-orange-400 hover:bg-orange-500 text-white">
                    <Mic className="h-4 w-4 mr-1" /> Search
                </Button>
            </div>

            {/* Right group */}
            <div className="flex items-center gap-4">
                {/* Row selector */}
                <Select
                    value={String(pageSize)}
                    onValueChange={(value) => setPageSize(Number(value))}
                >
                    <SelectTrigger className="border text-black cursor-pointer">
                        <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">1 rows</SelectItem>
                        <SelectItem value="20">20 rows</SelectItem>
                        <SelectItem value="50">50 rows</SelectItem>
                    </SelectContent>
                </Select>

                {/* Filter */}
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

                {/* View */}
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

                {/* Columns */}
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
            </div>
        </div>
    )
}
