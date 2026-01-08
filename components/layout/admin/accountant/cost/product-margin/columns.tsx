import { ProviderItem } from "@/types/checkout";
import { ColumnDef } from "@tanstack/react-table";

interface ProviderColumnsProps {
  data: ProviderItem[];
  onOpenDrawer: (id: string) => void;
}

export const productMarginColumns = ({
  data,
  onOpenDrawer,
}: ProviderColumnsProps): ColumnDef<ProviderItem>[] => {
  return [
    {
      accessorKey: "id_provider",
      size: 100,
      header: () => <div className="text-center font-medium">Article ID</div>,
      cell: ({ row }) => {
        const id = row.original.id_provider;
        return (
          <div
            onClick={() => onOpenDrawer(id)}
            className="text-center cursor-pointer underline"
          >
            {id}
          </div>
        );
      },
    },

    {
      accessorKey: "total_quantity",
      size: 120,
      header: () => <div className="text-center font-medium">Units sold</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.original.total_quantity}</div>
      ),
    },

    {
      accessorKey: "sell_price",
      size: 120,
      header: () => (
        <div className="text-center font-medium">Total revenue</div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.total_amount.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },

    {
      accessorKey: "landed_price",
      size: 120,
      header: () => <div className="text-center font-medium">Landed</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.cost.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },

    {
      accessorKey: "shipping_cost",
      size: 120,
      header: () => (
        <div className="text-center font-medium">Shipping Cost</div>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.delivery_cost.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },

    {
      accessorKey: "total_cost",
      size: 120,
      header: () => <div className="text-center font-medium">Total cost</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.total_cost.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },

    {
      accessorKey: "total_sold",
      size: 160,
      header: () => <div className="text-center font-medium">Total Profit</div>,
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.original.total_profit.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },

    {
      accessorKey: "margin",
      size: 160,
      header: () => <div className="text-center font-medium">Margin</div>,
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {(row.original.product_margin * 100).toFixed(2)}%
        </div>
      ),
    },
  ];
};
