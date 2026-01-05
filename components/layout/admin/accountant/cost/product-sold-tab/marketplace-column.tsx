// table/marketplace-columns.tsx
import { ProviderItem } from "@/types/checkout";
import { ColumnDef } from "@tanstack/react-table";

export function marketplaceColumn(
  key: string,
  label: string,
): ColumnDef<ProviderItem> {
  return {
    id: key, // 🔥 BẮT BUỘC
    header: () => (
      <div className="flex justify-center items-center w-full font-medium">
        {label.toLowerCase() !== "null" ? label : "Prestige Home"}
      </div>
    ),
    columns: [
      {
        id: `${key}_amount`,
        size: 140,
        header: () => (
          <div className="text-center text-xs text-muted-foreground">
            Amount
          </div>
        ),
        cell: ({ row }) => {
          const mp = row.original.by_marketplace?.[key];
          return (
            <div className="text-center">
              {mp
                ? `€ ${mp.total_amount.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : "—"}
            </div>
          );
        },
      },
      {
        id: `${key}_qty`,
        size: 80,
        header: () => (
          <div className="text-center text-xs text-muted-foreground">Qty</div>
        ),
        cell: ({ row }) => {
          const mp = row.original.by_marketplace?.[key];
          return (
            <div className="text-center">{mp ? mp.total_quantity : "—"}</div>
          );
        },
      },
    ],
  };
}
