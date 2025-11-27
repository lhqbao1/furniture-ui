import { CartItem } from "@/types/cart";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";

export const orderDetailColumn: ColumnDef<CartItem>[] = [
  {
    accessorKey: "pos",
    header: () => <div className="text-center w-full">POS.</div>,
    cell: ({ row }) => {
      return <div className="text-center">{row.index + 1}</div>;
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
        <div className="flex gap-2 items-center">
          {/* <Image
            src={
              row.original.products.static_files
                ? row.original.products.static_files[0].url
                : ""
            }
            height={40}
            width={40}
            alt=""
          /> */}
          {row.original.products.name}
        </div>
      );
    },
  },

  {
    accessorKey: "tax",
    header: () => <div className="text-center w-full">TAX</div>,
    cell: ({ row }) => {
      return (
        <div className="text-right">
          €
          {(row.original.final_price - row.original.price_whithout_tax).toFixed(
            2,
          )}
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
          {row.original.item_price.toLocaleString("de-DE", {
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
          {row.original.final_price.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "ware_house",
    header: () => <div className="text-center w-full">WAREHOUSE</div>,
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          <Image
            src={"/amm.jpeg"}
            height={40}
            width={40}
            alt=""
            className="w-12 h-12 object-contain"
          />
        </div>
      );
    },
  },
];
