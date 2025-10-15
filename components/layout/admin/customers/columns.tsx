"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye } from "lucide-react"
import Link from "next/link"
import { Customer } from "@/types/user"


export const customerColumns: ColumnDef<Customer>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => {
            return (
                <div>#{row.original.user_code}</div>
            )
        }
    },
    {
        accessorKey: "name",
        header: "NAME",
        cell: ({ row }) => {
            return (
                <div>{row.original.first_name} {row.original.last_name}</div>
            )
        }
    },
    {
        accessorKey: "email",
        header: () => (
            <div className="text-start w-full">EMAIL</div>
        ),
    },
    {
        accessorKey: "created_at",
        header: () => (
            <div className="text-center w-full">CREATED</div>
        ),
        cell: ({ row }) => {
            const isoString = row.original.created_at
            const date = new Date(isoString)

            const time = date.toLocaleString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false, // bỏ AM/PM nếu muốn
            })

            const day = date.toLocaleString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            })

            return (
                <div className="flex flex-col items-center text-xs text-[#4D4D4D]">
                    <span>{time}</span>
                    <span>{day}</span>
                </div>
            )
        }
    },
    // {
    //     id: "actions",
    //     header: "ACTION",
    //     cell: ({ row }) => {
    //         return (
    //             <div className="flex justify-center">
    //                 <Link href={`/admin/orders/${row.original.id}`}>
    //                     <Button variant="ghost" size="icon">
    //                         <Eye className="w-4 h-4" stroke="#F7941D" />
    //                     </Button>
    //                 </Link>
    //             </div>

    //         )
    //     }
    // },
]
