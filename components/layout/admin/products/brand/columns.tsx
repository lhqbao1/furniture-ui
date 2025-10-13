"use client"
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BrandResponse } from "@/types/brand";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import Image from "next/image";
import AddOrEditBrandForm from "./add-brand-form";
import { useState } from "react";
import DeleteDialog from "./delete-dialog";



const EditBrandCell = ({ brand }: { brand: BrandResponse }) => {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Pencil className="w-4 h-4 text-primary" />
                </Button>
            </DialogTrigger>
            <DialogContent className="w-1/3">
                <DialogHeader>
                    <DialogTitle>Edit Brand</DialogTitle>
                </DialogHeader>
                <AddOrEditBrandForm brandValues={brand} onClose={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}


export const brandColumns: ColumnDef<BrandResponse>[] = [
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
        cell: ({ row }) => <div>{row.original.code}</div>
    },
    {
        accessorKey: "img_url",
        header: "IMAGE",
        cell: ({ row }) => {
            const image = row.original.img_url

            return (
                <div className="w-12 h-12 relative flex items-center justify-center">
                    {image ? (
                        <Image
                            src={image}
                            alt="icon"
                            fill
                            className="object-cover rounded-md"
                            sizes="60px"
                            unoptimized
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                    )}
                </div>
            )
        },
    },
    {
        accessorKey: "name",
        header: "NAME",
        cell: ({ row }) => <div>{row.original.name}</div>
    },
    {
        accessorKey: "company_name",
        header: "COMPANY NAME",
        cell: ({ row }) => <div>{row.original.company_name}</div>
    },
    {
        accessorKey: "company_email",
        header: "COMPANY EMAIl",
        cell: ({ row }) => <div>{row.original.company_email}</div>
    },
    {
        accessorKey: "company_address",
        header: "COMPANY ADDRESS",
        cell: ({ row }) => <div>{row.original.company_address}</div>
    },
    {
        id: "actions",
        header: "ACTION",
        cell: ({ row }) => {
            return (
                <div className="flex gap-1">
                    <EditBrandCell brand={row.original} />
                    <DeleteDialog brandId={row.original.id} />
                </div>
            )
        }
    },
]