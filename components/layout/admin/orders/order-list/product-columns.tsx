import { CartItem } from "@/types/cart";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Link } from "@/src/i18n/navigation";
import { calculateProductVAT } from "@/lib/caculate-vat";

export const orderListExpandColumns = (
  supplier_name: string | null,
  country?: string,
  tax_id?: string,
): ColumnDef<CartItem>[] => [
  {
    accessorKey: "pos",
    header: () => <div className="text-center w-full">POS.</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.index + 1}</div>;
    },
  },
  {
    id: "image",
    header: () => <div className="text-center w-full">Image</div>,
    cell: ({ row }) => {
      const imageUrl = row.original.image_url ?? "/1.png";

      return (
        <div className="flex justify-center">
          <HoverCard openDelay={100} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Image
                src={imageUrl}
                width={32}
                height={32}
                alt={row.original.products?.name ?? "product image"}
                className="w-8 h-8 object-cover rounded-xl cursor-pointer"
              />
            </HoverCardTrigger>

            <HoverCardContent
              side="bottom"
              className="p-2 w-[200px] h-[200px] flex items-center justify-center"
            >
              <Image
                src={imageUrl}
                width={200}
                height={200}
                alt={row.original.products?.name ?? "preview image"}
                className="w-full h-full object-contain rounded-md"
              />
            </HoverCardContent>
          </HoverCard>
        </div>
      );
    },
  },
  {
    accessorKey: "id",
    header: () => <div className="text-center w-full">ID</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">#{row.original.products.id_provider}</div>
      );
    },
  },
  {
    accessorKey: "ean",
    header: () => <div className="text-center w-full">EAN</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.original.products.ean}</div>;
    },
  },
  {
    accessorKey: "product_name",
    header: "NAME",
    cell: ({ row }) => {
      return (
        <Link
          href={`/product/${row.original.products.url_key}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          <div>{row.original.products.name}</div>
        </Link>
      );
    },
  },

  {
    accessorKey: "supplier",
    header: () => <div className="text-center w-full">SUPPLIER</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {supplier_name ? supplier_name : "Prestige Home"}
        </div>
      );
    },
  },

  {
    accessorKey: "tax",
    header: () => <div className="text-center w-full">TAX</div>,
    cell: ({ row }) => {
      console.log(row.original);
      return (
        <div className="text-right">
          €
          {calculateProductVAT(
            row.original.purchased_products
              ? row.original.purchased_products.final_price
              : row.original.products.final_price,
            row.original.products.tax,
            country,
            tax_id,
          ).vat.toFixed(2)}
        </div>
      );
    },
  },
  {
    accessorKey: "invoice_amount",
    header: () => <div className="text-right w-full">UNIT PRICE</div>,
    cell: ({ row }) => {
      return (
        <div className="text-right">
          €
          {(row.original.purchased_products
            ? row.original.purchased_products.final_price
            : row.original.products.final_price
          ).toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "quantity",
    header: () => <div className="text-center w-full">QUANTITY</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.original.quantity}</div>;
    },
  },

  {
    accessorKey: "total_invoice_amount",
    header: () => <div className="text-right w-full">TOTAL AMOUNT</div>,
    cell: ({ row }) => {
      return (
        <div className="text-right">
          €
          {(
            row.original.quantity *
            (row.original.purchased_products
              ? row.original.purchased_products.final_price
              : row.original.products.final_price)
          ).toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      );
    },
  },

  // {
  //   id: "actions",
  //   header: () => <div className="text-center w-full">ACTIONS</div>,
  //   cell: ({ row, table }) => (
  //     <ActionCellChild
  //       checkoutId={row.original.id}
  //       items={row.original.cart.items}
  //       expandedRowId={table.options.meta?.expandedRowId || null}
  //       setExpandedRowId={table.options.meta?.setExpandedRowId || (() => {})}
  //       currentRowId={row.id}
  //     />
  //   ),
  // },
];
