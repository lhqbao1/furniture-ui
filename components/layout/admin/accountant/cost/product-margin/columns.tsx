import { ProviderItem } from "@/types/checkout";
import { ColumnDef } from "@tanstack/react-table";

interface ProviderColumnsProps {
  data: ProviderItem[];
  onOpenDrawer: (id: string) => void;
  variable_cost: number;
}

export const productMarginColumns = ({
  data,
  onOpenDrawer,
  variable_cost,
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
      accessorKey: "variable_cost",
      size: 120,
      header: () => (
        <div className="text-center font-medium">Variable Cost</div>
      ),
      cell: ({ row }) => {
        const revenue = row.original.total_amount;
        const totalRevenue = data.reduce(
          (sum, item) => sum + item.total_amount,
          0,
        );

        const share = totalRevenue > 0 ? revenue / totalRevenue : 0;
        const allocated = share * variable_cost;

        return (
          <div className="text-center">
            {allocated.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            €
          </div>
        );
      },
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
      cell: ({ row }) => {
        const revenue = row.original.total_amount;
        const totalRevenue = data.reduce(
          (sum, item) => sum + item.total_amount,
          0,
        );
        const landed_cost = row.original.cost;
        const delivery_cost = row.original.delivery_cost;
        const share = totalRevenue > 0 ? revenue / totalRevenue : 0;
        const allocated = share * variable_cost;
        const total_cost = landed_cost + delivery_cost + allocated;
        const profit = revenue - total_cost;

        return (
          <div className="text-center font-medium">
            {profit.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        );
      },
    },

    {
      accessorKey: "margin",
      size: 160,
      header: () => <div className="text-center font-medium">Margin</div>,
      cell: ({ row }) => {
        const revenue = row.original.total_amount;
        const totalRevenue = data.reduce(
          (sum, item) => sum + item.total_amount,
          0,
        );
        const landed_cost = row.original.cost;
        const delivery_cost = row.original.delivery_cost;
        const share = totalRevenue > 0 ? revenue / totalRevenue : 0;
        const allocated = share * variable_cost;
        const total_cost = landed_cost + delivery_cost + allocated;
        const margin = ((revenue - total_cost) / revenue) * 100;
        return (
          <div className="text-center font-medium">{margin.toFixed(2)}%</div>
        );
      },
    },
  ];
};
