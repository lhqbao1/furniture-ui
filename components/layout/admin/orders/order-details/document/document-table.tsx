import React, { useMemo } from 'react'
import { documentColumns, DocumentRow } from './document-columns'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { CheckOut, CheckOutMain } from '@/types/checkout'
import { formatDateTime } from '@/lib/date-formated'

interface DocumentTableProps {
    order?: CheckOutMain
    invoiceCode?: string
}

const DocumentTable = ({ order, invoiceCode }: DocumentTableProps) => {
    const data = useMemo<DocumentRow[]>(() => [
        {
            document: "Invoice",
            code: invoiceCode ?? '',
            dateSent: formatDateTime(order?.created_at ? new Date(order.created_at) : new Date()),
            viewType: 'invoice',
            checkOutId: order?.id
        },
        {
            document: "Package Slip",
            code: "AR-12365489",
            dateSent: formatDateTime(order?.created_at ? new Date(order.created_at) : new Date()),
            viewType: 'package',
            checkOutId: order?.id
        },
    ], [order])

    const table = useReactTable({
        data,
        columns: documentColumns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="overflow-hidden rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id} className='bg-gray-200'>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={documentColumns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

export default DocumentTable