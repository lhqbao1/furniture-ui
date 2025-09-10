import React from 'react'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Payment, paymentColumns } from './payment-columns'

const paymentData: Payment[] = [
    {
        payment_terms: "100% prepaid",
        payment_id: "6546313",
        gateway: "Paypal",
        mop_id: "1921",
        status: "approved",
        amount: 899,
        received_on: "Aug 31, 2025 22:05",
    },
    {
        payment_terms: "50% deposit",
        payment_id: "7458291",
        gateway: "Stripe",
        mop_id: "1933",
        status: "pending",
        amount: 450,
        received_on: "Sep 1, 2025 10:15",
    },
    {
        payment_terms: "Net 30",
        payment_id: "9823645",
        gateway: "Bank Transfer",
        mop_id: "2001",
        status: "failed",
        amount: 1200,
        received_on: "Sep 2, 2025 16:40",
    },
]


const PaymentTable = () => {
    const table = useReactTable({
        data: paymentData,
        columns: paymentColumns,
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
                            <TableCell colSpan={paymentColumns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

export default PaymentTable