"use client"

import * as React from "react"
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CartItem, getColumns } from "./column"
import { ArrowLeft, Trash } from "lucide-react"

type Props = { data: CartItem[] }

export function CartTable({ data: initial }: Props) {
    const [data, setData] = React.useState<CartItem[]>(initial)

    const onQtyChange = (id: string, nextQty: number) => {
        setData((prev) =>
            prev.map((it) => (it.id === id ? { ...it, qty: Math.max(1, Math.min(it.stock, nextQty)) } : it))
        )
    }
    const onRemove = (id: string) => setData((prev) => prev.filter((it) => it.id !== id))
    const onBuy = (id: string) => {
        // TODO: add to order flow
        console.log("BUY", id)
    }

    const columns = React.useMemo(() => getColumns({ onQtyChange, onRemove, onBuy }), [])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    // Tính tổng theo các row được chọn; nếu chưa chọn gì, tính tất cả
    const selected = table.getSelectedRowModel().rows.map((r) => r.original)
    const rows = selected.length ? selected : data

    const totalOld = rows.reduce(
        (s, r) => s + (r.oldUnitPrice ?? r.unitPrice) * r.qty,
        0
    )
    const totalNew = rows.reduce((s, r) => s + r.unitPrice * r.qty, 0)
    const saved = totalOld - totalNew
    const totalItems = rows.reduce((s, r) => s + r.qty, 0)

    return (
        <div className="w-full">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((hg) => (
                        <TableRow key={hg.id}>
                            {hg.headers.map((header) => (
                                <TableHead key={header.id} style={{ width: header.getSize() }}>
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Footer action bar */}
            <div className="grid grid-cols-12 flex-wrap gap-4 justify-between items-center bg-secondary text-white p-4 mt-4 rounded-lg">
                <div className="xl:col-span-7 col-span-12 flex justify-between">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            checked={table.getIsAllPageRowsSelected()}
                            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                        />
                        <span className="text-sm">Select all</span>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div
                            onClick={() => setData((prev) => prev.filter((i) => i.stock > 0))}
                            className="text-white flex gap-1 cursor-pointer p-0 items-center text-sm"
                        >
                            <Trash size={20} />
                            Remove out of stock products
                        </div>

                        <select className="text-black rounded px-3 py-1 bg-white h-8">
                            <option>Select Voucher</option>
                            <option>SALE10</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2 items-center">
                            <ArrowLeft size={20} />
                            <span className="text-sm">Continue Shopping</span>
                        </div>
                        <input
                            placeholder="< apply code >"
                            className="text-black rounded px-3 py-1 bg-white h-8"
                        />
                    </div>
                </div>

                <div className="xl:col-span-5 col-span-12 flex gap-6 xl:justify-end justify-center">
                    <div className="text-right">
                        <p>Total saved <span className="font-bold">€{saved}</span></p>
                        <p className="font-semibold text-lg">
                            Total ({totalItems} items) <span className="font-bold">€{totalNew}</span>
                        </p>
                    </div>
                    <Button className="bg-orange-400 hover:bg-orange-500 text-white rounded-full px-6 py-2">
                        CHECK OUT
                    </Button>
                </div>
            </div>
        </div>
    )
}
