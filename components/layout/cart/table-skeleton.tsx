// components/cart/cart-table-skeleton.tsx
"use client"

import { TableRow, TableCell } from "@/components/ui/table"

export default function CartTableSkeleton({ rows = 3 }: { rows?: number }) {
    return (
        <>
            {[...Array(rows)].map((_, idx) => (
                <TableRow key={idx}>
                    <TableCell className="xl:py-10 py-3">
                        <div className="flex items-center gap-3">
                            <div className="w-[60px] h-[60px] bg-gray-200 rounded animate-pulse" />
                            <div>
                                <div className="w-32 h-4 bg-gray-200 rounded mb-2 animate-pulse" />
                                <div className="w-20 h-3 bg-gray-200 rounded mb-1 animate-pulse" />
                                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
                            <div className="w-6 h-4 bg-gray-200 rounded animate-pulse" />
                            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="w-10 h-4 bg-gray-200 rounded animate-pulse" />
                    </TableCell>
                    <TableCell>
                        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
                    </TableCell>
                </TableRow>
            ))}
        </>
    )
}
