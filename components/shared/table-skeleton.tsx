'use client'
import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface ProductTableSkeletonProps {
    columnsCount?: number
    rowsCount?: number
}

const ProductTableSkeleton = ({ columnsCount = 6, rowsCount = 5 }: ProductTableSkeletonProps) => {
    return (
        <div className="flex flex-col items-center gap-4">
            <div className="rounded-md border w-full overflow-x-scroll">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {Array.from({ length: columnsCount }).map((_, colIndex) => (
                                <TableHead key={colIndex}>
                                    <div className="h-4 w-24 bg-gray-300 rounded animate-pulse" />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: rowsCount }).map((_, rowIndex) => (
                            <TableRow key={rowIndex} className={rowIndex % 2 === 1 ? "bg-secondary/10" : ""}>
                                {Array.from({ length: columnsCount }).map((_, colIndex) => (
                                    <TableCell key={colIndex}>
                                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Skeleton pagination */}
            <div className="flex gap-2 mt-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-8 w-8 bg-gray-300 rounded animate-pulse" />
                ))}
            </div>
        </div>
    )
}

export default ProductTableSkeleton
