import { ProviderItem } from "@/types/checkout";
import { ColumnDef } from "@tanstack/react-table";
import { marketplaceColumn } from "./marketplace-column";

interface ProviderColumnsProps {
  data: ProviderItem[];
  onOpenDrawer: (id: string) => void;
}

function extractMarketplaces(data: ProviderItem[]) {
  const set = new Set<string>();

  data.forEach((item) => {
    Object.keys(item.by_marketplace ?? {}).forEach((key) => set.add(key));
  });

  return Array.from(set);
}

export const providerColumns = ({
  data,
  onOpenDrawer,
}: ProviderColumnsProps): ColumnDef<ProviderItem>[] => {
  const marketplaces = extractMarketplaces(data);

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
      header: () => <div className="text-center font-medium">Total Qty</div>,
      cell: ({ row }) => (
        <div className="text-center">{row.original.total_quantity}</div>
      ),
    },

    {
      accessorKey: "total_amount",
      size: 160,
      header: () => <div className="text-center font-medium">Total Amount</div>,
      cell: ({ row }) => (
        <div className="text-center font-medium">
          €{" "}
          {row.original.total_amount.toLocaleString("de-DE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ),
    },

    // 🔥 AUTO-GENERATED MARKETPLACE COLUMNS
    ...marketplaces.map((key) =>
      marketplaceColumn(key, key.charAt(0).toUpperCase() + key.slice(1)),
    ),
  ];
};
