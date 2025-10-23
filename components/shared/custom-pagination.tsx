'use client'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

interface CustomPaginationProps {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
}

export function CustomPagination({ page, totalPages, onPageChange }: CustomPaginationProps) {
    const [goPage, setGoPage] = useState("")

    const getPageNumbers = () => {
        const delta = 2
        const pages: (number | string)[] = []
        const left = Math.max(2, page - delta)
        const right = Math.min(totalPages - 1, page + delta)

        pages.push(1)
        if (left > 2) pages.push("...")

        for (let i = left; i <= right; i++) {
            pages.push(i)
        }

        if (right < totalPages - 1) pages.push("...")
        if (totalPages > 1) pages.push(totalPages)

        return pages
    }

    return (
        <div className="flex flex-wrap items-center gap-4 w-full justify-center">
            <Pagination className="flex flex-wrap justify-center gap-2">
                <PaginationContent>
                    {/* First */}
                    <PaginationItem>
                        <PaginationLink
                            href="#"
                            onClick={(e) => { e.preventDefault(); onPageChange(1) }}
                        >
                            ⏮
                        </PaginationLink>
                    </PaginationItem>

                    {/* Prev */}
                    <PaginationItem>
                        <PaginationPrevious
                            href="#"
                            onClick={(e) => { e.preventDefault(); if (page > 1) onPageChange(page - 1) }}
                        />
                    </PaginationItem>

                    {/* Page numbers */}
                    {getPageNumbers().map((p, i) => (
                        <PaginationItem key={i}>
                            {p === "..." ? (
                                <PaginationEllipsis />
                            ) : (
                                <PaginationLink
                                    href="#"
                                    isActive={page === p}
                                    onClick={(e) => { e.preventDefault(); onPageChange(Number(p)) }}
                                >
                                    {p}
                                </PaginationLink>
                            )}
                        </PaginationItem>
                    ))}

                    {/* Next */}
                    <PaginationItem>
                        <PaginationNext
                            href="#"
                            onClick={(e) => { e.preventDefault(); if (page < totalPages) onPageChange(page + 1) }}
                        />
                    </PaginationItem>

                    {/* Last */}
                    <PaginationItem>
                        <PaginationLink
                            href="#"
                            onClick={(e) => { e.preventDefault(); onPageChange(totalPages) }}
                        >
                            ⏭
                        </PaginationLink>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>

            {/* Go to page */}
            <div className="flex flex-wrap gap-2 justify-center w-full sm:w-auto">
                <div className="text-sm self-center">Go to</div>
                <Input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={goPage}
                    onChange={(e) => setGoPage(e.target.value)}
                    className="w-16"
                />
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        const num = Number(goPage)
                        if (num >= 1 && num <= totalPages) {
                            onPageChange(num)
                            setGoPage("")
                        }
                    }}
                >
                    Page
                </Button>
            </div>
        </div>

    )
}
