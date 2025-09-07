// SkeletonTable.tsx
'use client'
import React from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface SkeletonTableProps {
    columns: number
    rows?: number
}

const SkeletonTable: React.FC<SkeletonTableProps> = ({ columns, rows = 5 }) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    {Array.from({ length: columns }).map((_, idx) => (
                        <TableHead key={idx}>
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({ length: rows }).map((_, rowIdx) => (
                    <TableRow key={rowIdx}>
                        {Array.from({ length: columns }).map((_, colIdx) => (
                            <TableCell key={colIdx}>
                                <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default SkeletonTable
