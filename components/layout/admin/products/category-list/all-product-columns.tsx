import { Checkbox } from "@/components/ui/checkbox";
import { NewProductItem } from "@/types/products";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const productsColumn: ColumnDef<NewProductItem>[] = [
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
        accessorKey: "image",
        header: () => (
            <div className="text-start w-full">Image</div>
        ),
        cell: ({ row }) => {
            return (
                <div className="flex justify-start">
                    <Image
                        src={row.original.static_files.length > 0 ? row.original.static_files[0].url : '/1.png'}
                        width={40}
                        height={40}
                        alt=""
                        unoptimized
                    />
                </div>
            )
        }
    },
    {
        accessorKey: "name",
        header: () => (
            <div className="text-start w-full">Name</div>
        ),
    },
    {
        accessorKey: "id",
        header: () => (
            <div className="text-start w-full">ID</div>
        ),
        cell: ({ row }) => {
            return (
                <div className="flex items-center justify-start gap-2">
                    <div>{row.original.id?.slice(0, 7)}</div>
                    <Link href={`/admin/products/${row.original.id}/edit`}>
                        <Eye size={20} stroke="#00B159" />
                    </Link>
                </div>
            )
        }
    },
]