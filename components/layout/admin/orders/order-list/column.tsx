"use client"

import { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckOut } from "@/types/checkout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye } from "lucide-react"
import Link from "next/link"
import ViewFileDialog from "./view-file"


export const orderColumns: ColumnDef<CheckOut>[] = [
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
        header: "ORDER ID",
        cell: ({ row }) => {
            return (
                <div>#{row.original.id.slice(0, 7)}</div>
            )
        }
    },
    {
        accessorKey: "external_id",
        header: "EXTERNAL ID",
        cell: ({ row }) => {
            return (
                <div>21-13452-00796</div>
            )
        }
    },
    {
        accessorKey: "channel",
        header: () => (
            <div className="text-center w-full">CHANNEL</div>
        ),
        cell: ({ row }) => {
            return (
                <div className="h-8 relative">
                    <Image src={'/new-logo.svg'} alt="icon" fill className="object-contain px-4" unoptimized />
                </div>
            )
        },
    },
    {
        accessorKey: "created_at",
        header: () => (
            <div className="text-center w-full">DATE</div>
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
    {
        accessorKey: "customer",
        header: () => (
            <div className="text-center w-full">CUSTOMER</div>
        ),
        cell: ({ row }) => {
            const user = row.original.user
            const initials = `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
            return (
                <div className="flex gap-2 items-center justify-center">
                    <Avatar>
                        <AvatarImage src={`${user.avatar_url}`} alt={user.first_name} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <div className="text-[#4D4D4D] font-semibold">{user.first_name} {user.last_name}</div>
                        <div className="text-xs text-[#4D4D4D]">{user.phone_number}</div>
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "payment",
        header: () => (
            <div className="text-center w-full">PAYMENT</div>
        ),
        cell: ({ row }) => (
            <div className="h-12 relative">
                <Image src={'/paypal.svg'} alt="icon" fill className="object-contain p-2" unoptimized />
            </div>
        ),
    },
    {
        accessorKey: "status",
        header: () => (
            <div className="text-center w-full">STATUS</div>
        ),
        cell: ({ row }) => <div className="text-center">{row.original.status}</div>,
    },
    {
        accessorKey: "shipping",
        header: () => (
            <div className="text-center w-full">CARRIER</div>
        ),
        cell: ({ row }) => {
            return (
                <div className="w-full flex justify-center">
                    <div className="h-20 w-20 relative">
                        <Image src={'/amm.jpeg'} alt="icon" fill className="object-contain px-2" unoptimized />
                    </div>
                </div>
            )
        }
    },
    {
        accessorKey: "value",
        header: () => (
            <div className="text-center w-full">INVOICE</div>
        ),
        cell: ({ row }) => {
            return (
                <div className="flex gap-1 items-center justify-end">
                    <div className={`${row.original.total_amount < 0 ? 'text-red-500' : 'text-[#4D4D4D]'}`}>€{row.original.total_amount.toFixed(2)}</div>
                    <ViewFileDialog checkoutId={row.original.id} />
                </div>
            )
        }
    },
    {
        id: "actions",
        header: "ACTION",
        cell: ({ row }) => {
            return (
                <div className="flex justify-center">
                    <Link href={`/admin/orders/${row.original.id}`}>
                        <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" stroke="#F7941D" />
                        </Button>
                    </Link>
                </div>

            )
        }
    },
]
