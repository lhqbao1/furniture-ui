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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

type Props = { data: CartItem[] }

export function CartTable({ data: initial }: Props) {
    const [voucher, setVoucher] = React.useState("")

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
        <div className="w-full container">
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
            <div className="sticky  bottom-0 lg:mt-12 bg-secondary w-[1104px] text-white p-4 rounded-lg">
                <div className="grid grid-cols-12 gap-4 bg-secondary text-white rounded-lg">
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

                            <Select value={voucher} onValueChange={setVoucher}>
                                <SelectTrigger className="xl:h-8 h-6 text-black bg-white rounded px-3 py-1 w-full" placeholderColor="black">
                                    <SelectValue placeholder="Select Voucher" className="text-black" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SALE10">SALE10</SelectItem>
                                    <SelectItem value="SALE20">SALE20</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex gap-2 items-center">
                                <ArrowLeft size={20} />
                                <span className="text-sm">Continue Shopping</span>
                            </div>
                            <Input
                                type="text"
                                placeholder="< apply code >"
                                className="text-black rounded px-3 py-1 bg-white h-9"
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
        </div>
    )
}
