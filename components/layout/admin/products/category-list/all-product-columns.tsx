import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "@/src/i18n/navigation";
import { ProductItem } from "@/types/products";
import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { useLocale } from "next-intl";
import Image from "next/image";

const ProductActionCell = ({ id }: { id: string }) => {
  const router = useRouter();
  const locale = useLocale();

  return (
    <div className="flex items-center justify-start gap-2">
      <div>{id?.slice(0, 7)}</div>
      <Eye
        size={20}
        stroke="#00B159"
        className="cursor-pointer"
        onClick={() => router.push(`/admin/products/${id}/edit`, { locale })}
      />
    </div>
  );
};

export const productsColumn: ColumnDef<ProductItem>[] = [
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
    header: () => <div className="text-start w-full">Image</div>,
    cell: ({ row }) => {
      return (
        <div className="flex justify-start">
          <Image
            src={
              row.original.static_files.length > 0
                ? row.original.static_files[0].url
                : "/placeholder-product.webp"
            }
            width={40}
            height={40}
            alt=""
            unoptimized
          />
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: () => <div className="text-start w-full">Name</div>,
  },
  {
    accessorKey: "id",
    header: () => <div className="text-start w-full">ID</div>,
    cell: ({ row }) => <ProductActionCell id={row.original.id} />,
  },
];
