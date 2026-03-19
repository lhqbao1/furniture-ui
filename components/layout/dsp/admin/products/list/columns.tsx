"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductItem } from "@/types/products";

import { useLocale } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { getProductByIdDSP } from "@/features/dsp/products/api";
import { calculateAvailableStock } from "@/hooks/calculate_available_stock";
import { getCarrierLogo } from "@/lib/getCarrierImage";

function ActionsCell({ product }: { product: ProductItem }) {
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleClick = async (id: string) => {
    try {
      await queryClient.prefetchQuery({
        queryKey: ["dsp-product", id],
        queryFn: () => getProductByIdDSP(id),
      });
      router.push(`/dsp/admin/products/${id}/edit`, { locale });
    } catch (err) {
      console.error("Prefetch failed:", err);
      // router.push(`/dsp/admin/products/${id}/edit`, { locale });
    }
  };

  return (
    <div className="flex gap-2">
      {/* <Link href={`/admin/products/${product.id}/edit`}> */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => handleClick(product.id)}
      >
        <Pencil className="w-4 h-4 text-primary" />
      </Button>
      {/* </Link> */}
      {/* <DeleteDialogDSP product={product} /> */}
    </div>
  );
}

export const productColumnsDSP: ColumnDef<ProductItem>[] = [
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
    accessorKey: "static_files",
    header: "ICON",
    cell: ({ row }) => {
      const image = row.original.static_files?.[0]?.url;
      return (
        <div className="w-12 h-12 relative">
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
            <div className="w-12 h-12 bg-gray-200 rounded-md" />
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "name",
    header: "NAME",
    // cell: ({ row }) => <EditableNameCell product={row.original} />,
    cell: ({ row }) => (
      <div className="w-60 text-wrap">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "sku",
    header: ({}) => <div className="text-center">SKU</div>,
    // cell: ({ row }) => <EditableNameCell product={row.original} />,
    cell: ({ row }) => (
      <div className="text-center">{row.original.sku ?? "-"}</div>
    ),
  },
  {
    accessorKey: "ean",
    header: ({}) => <div className="text-center">EAN</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original.ean ?? "-"}</div>
    ),
  },
  {
    accessorKey: "stock",
    header: "STOCK",
    cell: ({ row }) => (
      <div className="text-center">
        {calculateAvailableStock(row.original)} pcs.
      </div>
    ),
  },
  {
    accessorKey: "is_active",
    header: "STATUS",
    cell: ({ row }) => (
      <span
        className={`px-2 py-1 rounded-md text-xs ${
          row.original.is_active
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {row.original.is_active ? "active" : "inactive"}
      </span>
      // <ToogleProductStatus product={row.original} />
    ),
  },
  {
    accessorKey: "cost",
    header: () => <div className="text-right">COST</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.cost ? (
          <span>€{row.original.cost.toFixed(2)}</span>
        ) : (
          "updating"
        )}
      </div>
    ),
  },
  {
    accessorKey: "shipping_cost",
    header: () => <div className="text-right">DELIVERY COST</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {row.original.delivery_cost ? (
          <>€{row.original.delivery_cost?.toFixed(2)}</>
        ) : (
          "-"
        )}
      </div>
    ),
  },
  {
    accessorKey: "delivery_time",
    header: () => <div className="text-center">DELIVERY TIME</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row.original.delivery_time ? (
          <>{row.original.delivery_time} Werktage</>
        ) : (
          "-"
        )}
      </div>
    ),
  },

  {
    id: "carrier",
    header: () => <div className="text-center">CARRIER</div>,
    cell: ({ row }) => {
      const carrier = row.original.carrier?.toLowerCase();
      const normalizedCarrier =
        carrier === "spedition" ? "amm" : (carrier ?? "");
      const logo = normalizedCarrier ? getCarrierLogo(normalizedCarrier) : null;

      if (!logo) {
        return <span className="text-muted-foreground">—</span>;
      }

      return (
        <Image
          src={logo}
          alt={normalizedCarrier}
          width={60}
          height={40}
          unoptimized
          className="object-contain"
        />
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-start">ACTION</div>,
    cell: ({ row }) => <ActionsCell product={row.original} />,
  },
];
