"use client"

import { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckOut, CheckOutMain } from "@/types/checkout"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown, ChevronRight, Eye, File } from "lucide-react"
import ViewFileDialog from "./view-file"
import { listChanel, paymentOptions } from "@/data/data"
import { useRouter } from "@/src/i18n/navigation"
import { useLocale } from "next-intl"
import { Product } from "@/types/products"
import { CartItem, CartResponseItem } from "@/types/cart"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog'
import { use, useState } from "react"
import { ProductTable } from "../../products/products-list/product-table"
import { cartSupplierColumn, GetCartColumns } from "@/components/layout/cart/columns"
import CartTable from "@/components/layout/cart/cart-table"
import ViewFileChildDialog from "@/components/layout/packaging-dialog/packaging-dialog-chil"

const ActionCell = ({ id }: { id: string }) => {
    const router = useRouter()
    const locale = useLocale()

    return (
        <div className="flex justify-center">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/admin/orders/${id}`, { locale })}
            >
                <Eye className="w-4 h-4" stroke="#F7941D" />
            </Button>
        </div>
    )
}

const ActionCellChild = ({
    items,
    checkoutId,
    isSupplier = false,
    expandedRowId,
    setExpandedRowId,
    currentRowId,
}: {
    items: CartItem[]
    checkoutId: string
    isSupplier?: boolean
    expandedRowId?: string | null
    setExpandedRowId?: (id: string | null) => void
    currentRowId?: string
}) => {
    const isExpanded = expandedRowId === currentRowId

    return (
        <div className="flex justify-center items-center gap-2">
            {/* Eye Icon */}
            {!isSupplier && (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4" stroke="#F7941D" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className='lg:w-[800px]'>
                        <ProductTable
                            data={items}
                            columns={cartSupplierColumn}
                            page={1}
                            pageSize={1}
                            setPage={() => { }}
                            setPageSize={() => { }}
                            hasPagination={false}
                            totalItems={items.length}
                            totalPages={1}
                        />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="secondary">Close</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            <ViewFileChildDialog checkoutId={checkoutId} data={items} />

            {/* Expand button */}
            <Button
                variant={'ghost'}
                type="button"
                onClick={() =>
                    setExpandedRowId?.(isExpanded ? null : currentRowId ?? null)
                }
                className="p-1"
            >
                {isExpanded ? (
                    <ChevronDown className="size-4 text-gray-600" />
                ) : (
                    <ChevronRight className="size-4 text-gray-600" />
                )}
            </Button>
        </div>
    )
}

export const orderColumns: ColumnDef<CheckOutMain>[] = [
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
                <div>#{row.original.checkout_code}</div>
            )
        }
    },
    {
        accessorKey: "external_id",
        header: "EXTERNAL ID",
        cell: ({ row }) => {
            return (
                <div>{row.original.marketplace_order_id}</div>
            )
        }
    },
    {
        accessorKey: "customer",
        header: "CUSTOMER",
        cell: ({ row }) => {
            return (
                <div>
                    <div>{row.original.checkouts[0].user.first_name} {row.original.checkouts[0].user.last_name}</div>
                    <div>{row.original.checkouts[0].user.email}</div>
                </div>
            )
        }
    },
    {
        accessorKey: "channel",
        header: () => (
            <div className="text-center w-full">CHANNEL</div>
        ),
        cell: ({ row }) => {
            const currentChanel = row.original.from_marketplace
            const channelLogo = listChanel.find(ch => ch.name === currentChanel)?.icon || 'new-logo.svg'
            return (
                <div className="h-12 relative">
                    <Image src={`/${channelLogo}`} alt="icon" fill className="object-contain p-2" unoptimized />
                </div>
                // <div className="text-center capitalize font-semibold">{row.original.from_marketplace ? row.original.from_marketplace : 'Prestige Home'}</div>
            )
        },
    },
    {
        accessorKey: "created_at",
        header: () => (
            <div className="text-center w-full">DATE CREATED</div>
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
    //     accessorKey: "customer",
    //     header: () => (
    //         <div className="text-center w-full">CUSTOMER</div>
    //     ),
    //     cell: ({ row }) => {
    //         const user = row.original.user
    //         const initials = `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
    //         return (
    //             <div className="flex gap-2 items-center justify-center">
    //                 <Avatar>
    //                     <AvatarImage src={`${user.avatar_url}`} alt={user.first_name} />
    //                     <AvatarFallback>{initials}</AvatarFallback>
    //                 </Avatar>
    //                 <div className="flex flex-col">
    //                     <div className="text-[#4D4D4D] font-semibold">{user.first_name} {user.last_name}</div>
    //                     <div className="text-xs text-[#4D4D4D]">{user.phone_number}</div>
    //                 </div>
    //             </div>
    //         )
    //     }
    // },
    // {
    //     accessorKey: "payment",
    //     header: () => <div className="text-center w-full">PAYMENT</div>,
    //     cell: ({ row }) => {
    //         const method = row.original.payment_method;
    //         const option = paymentOptions.find((opt) => opt.id === method);
    //         const logo = option?.logo || "/ebay.png"; // default Paypal

    //         return (
    //             <div className="h-12 relative">
    //                 <Image
    //                     src={logo}
    //                     alt={option?.label || "PayPal"}
    //                     fill
    //                     className="object-contain p-2"
    //                     unoptimized
    //                 />
    //             </div>
    //         );
    //     },
    // },
    {
        accessorKey: "status",
        header: () => (
            <div className="text-center w-full">STATUS</div>
        ),
        cell: ({ row }) => <div className="text-center lowercase">{row.original.status}</div>,
    },
    // {
    //     accessorKey: "shipping",
    //     header: () => (
    //         <div className="text-center w-full">CARRIER</div>
    //     ),
    //     cell: ({ row }) => {
    //         const shippingCost = row.original.total_shipping
    //         return (
    //             <div className="w-full flex justify-center">
    //                 <div className="h-20 w-20 relative">
    //                     {shippingCost === 5.95 ?
    //                         <Image src={'/dpd.jpeg'} alt="icon" fill className="object-contain px-2" unoptimized />
    //                         : <Image src={'/amm.jpeg'} alt="icon" fill className="object-contain px-2" unoptimized />}
    //                 </div>
    //             </div>
    //         )
    //     }
    // },
    {
        accessorKey: "value",
        header: () => (
            <div className="text-center w-full">INVOICE</div>
        ),
        cell: ({ row }) => {
            return (
                <div className="flex gap-1 items-center justify-end">
                    <div className={`${row.original.total_amount < 0 ? 'text-red-500' : 'text-[#4D4D4D]'}`}>€{row.original.total_amount.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    {row.original.status === "Pending" ? "" : <ViewFileDialog checkoutId={row.original.id} type="invoice" />}
                </div>
            )
        }
    },
    {
        id: "actions",
        header: () => (
            <div className="text-center w-full">ACTIONS</div>
        ),
        cell: ({ row }) => <ActionCell id={row.original.id} />,
    },
]

export const orderChildColumns: ColumnDef<CheckOut>[] = [
    {
        accessorKey: "id",
        header: "DELIVERY ORDER ID",
        cell: ({ row }) => {
            return (
                <div>#{row.original.checkout_code}</div>
            )
        }
    },
    {
        accessorKey: "owner",
        header: ({ }) => <div className="text-center">SUPPLIER</div>,
        cell: ({ row }) => {
            return (
                <div className="text-center">{row.original?.supplier?.business_name ? row.original?.supplier?.business_name : "Prestige Home"}</div>
            )
        }
    },
    {
        accessorKey: "channel",
        header: () => (
            <div className="text-center w-full">CHANNEL</div>
        ),
        cell: ({ row }) => {
            const currentChanel = row.original.from_marketplace
            const channelLogo = listChanel.find(ch => ch.name === currentChanel)?.icon || 'new-logo.svg'
            return (
                <div className="h-12 relative">
                    <Image src={`/${channelLogo}`} alt="icon" fill className="object-contain p-2" unoptimized />
                </div>
                // <div className="text-center capitalize font-semibold">{row.original.from_marketplace ? row.original.from_marketplace : 'Prestige Home'}</div>
            )
        },
    },
    {
        accessorKey: "created_at",
        header: () => (
            <div className="text-center w-full">DATE CREATED</div>
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
        accessorKey: "tracking_number",
        header: ({ }) => <div className="text-center">TRACKING NUMBER</div>,
        cell: ({ row }) => {
            return (
                <div className="text-center">{row.original?.shipment ? row.original?.shipment?.tracking_number : ""}</div>
            )
        }
    },
    {
        accessorKey: "carrier",
        header: () => (
            <div className="text-center w-full">CARRIER</div>
        ),
        cell: ({ row }) => <div className="text-center uppercase">{row.original.shipment ? row.original.shipment.shipping_carrier : row.original.carrier}</div>,
    },
    {
        accessorKey: "status",
        header: () => (
            <div className="text-center w-full">STATUS</div>
        ),
        cell: ({ row }) => <div className="text-center lowercase">{row.original.shipment ? row.original.shipment.status : "pending"}</div>,
    },
    {
        id: "actions",
        header: () => (
            <div className="text-center w-full">ACTIONS</div>
        ),
        cell: ({ row, table }) => (
            <ActionCellChild
                checkoutId={row.original.id}
                items={row.original.cart.items}
                expandedRowId={table.options.meta?.expandedRowId || null}
                setExpandedRowId={table.options.meta?.setExpandedRowId || (() => { })}
                currentRowId={row.id}
            />
        ),
    },
]

export const orderChildSupplierColumns: ColumnDef<CheckOut>[] = [
    {
        accessorKey: "id",
        header: "DELIVERY ORDER ID",
        cell: ({ row }) => {
            return (
                <div>#{row.original.checkout_code}</div>
            )
        }
    },
    {
        accessorKey: "customer",
        header: "CUSTOMER",
        cell: ({ row }) => {
            return (
                <div>
                    <div>{row.original.user.first_name} {row.original.user.last_name}</div>
                    <div>{row.original.user.email}</div>
                </div>
            )
        }
    },
    {
        accessorKey: "channel",
        header: () => (
            <div className="text-center w-full">CHANNEL</div>
        ),
        cell: ({ row }) => {
            const currentChanel = row.original.from_marketplace
            const channelLogo = listChanel.find(ch => ch.name === currentChanel)?.icon || 'new-logo.svg'
            return (
                <div className="h-12 relative">
                    <Image src={`/${channelLogo}`} alt="icon" fill className="object-contain p-2" unoptimized />
                </div>
                // <div className="text-center capitalize font-semibold">{row.original.from_marketplace ? row.original.from_marketplace : 'Prestige Home'}</div>
            )
        },
    },
    {
        accessorKey: "created_at",
        header: () => (
            <div className="text-center w-full">DATE CREATED</div>
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
        accessorKey: "status",
        header: () => (
            <div className="text-center w-full">STATUS</div>
        ),
        cell: ({ row }) => <div className="text-center lowercase">{row.original.status}</div>,
    },
    {
        id: "actions",
        header: () => (
            <div className="text-center w-full">ACTIONS</div>
        ),
        cell: ({ row }) => <ActionCellChild checkoutId={row.original.id} items={row.original.cart.items} isSupplier />,
    },
]
