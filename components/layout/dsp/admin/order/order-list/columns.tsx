import CancelExchangeDialog from "@/components/layout/admin/orders/order-details/dialog/cancel-exchange-dialog";
import { getShippingStatusStyle } from "@/components/layout/admin/orders/order-list/status-styles";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import { cartSupplierColumn } from "@/components/layout/cart/columns";
import ViewFileChildDialog from "@/components/layout/packaging-dialog/packaging-dialog-chil";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "@/src/i18n/navigation";
import { CartItem } from "@/types/cart";
import { CheckOut } from "@/types/checkout";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronRight, Eye } from "lucide-react";
import { useLocale } from "next-intl";

const ActionCellChild = ({
  items,
  checkoutId,
  isSupplier = false,
  expandedRowId,
  setExpandedRowId,
  currentRowId,
  status,
}: {
  items: CartItem[];
  checkoutId: string;
  isSupplier?: boolean;
  expandedRowId?: string | null;
  setExpandedRowId?: (id: string | null) => void;
  currentRowId?: string;
  status?: string;
}) => {
  const isExpanded = expandedRowId === currentRowId;
  const router = useRouter();
  const locale = useLocale();
  return (
    <div className="flex justify-center items-center gap-2">
      {/* Eye Icon */}
      {!isSupplier && (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-amber-50"
            >
              <Eye className="w-4 h-4 text-amber-500" />
            </Button>
          </DialogTrigger>
          <DialogContent className="lg:w-[800px]">
            <ProductTable
              data={items}
              columns={cartSupplierColumn}
              page={1}
              pageSize={1}
              setPage={() => {}}
              setPageSize={() => {}}
              hasPagination={false}
              totalItems={items.length}
              totalPages={1}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-amber-50"
        onClick={() =>
          router.push(`/dsp/admin/orders/${checkoutId}`, { locale })
        }
      >
        <Eye className="w-4 h-4 text-amber-500" />
      </Button>

      <ViewFileChildDialog
        checkoutId={checkoutId}
        data={items}
      />

      {status?.toLowerCase() === "exchange" && (
        <CancelExchangeDialog
          id={checkoutId}
          main_checkout_id={checkoutId}
        />
      )}

      {/* Expand button */}
      {/* <Button
        variant={"ghost"}
        type="button"
        onClick={() =>
          setExpandedRowId?.(isExpanded ? null : currentRowId ?? null)
        }
        className="p-1"
      >
        {isExpanded ? (
          <ChevronDown className="size-4 text-gray-600" />
        ) : (
          <ChevronRight className="size-4 text-gray-600" />
        )}
      </Button> */}
    </div>
  );
};

export const orderChildSupplierColumns: ColumnDef<CheckOut>[] = [
  {
    accessorKey: "id",
    header: "DELIVERY ORDER ID",
    cell: ({ row }) => {
      return <div>#{row.original.checkout_code}</div>;
    },
  },
  {
    accessorKey: "created_at",
    header: () => <div className="text-center w-full">DATE CREATED</div>,
    cell: ({ row }) => {
      let iso = row.original.created_at.toString();

      // 👉 Nếu backend không gửi Z, mình thêm vào để JS parse đúng UTC
      if (!iso.endsWith("Z")) {
        iso += "Z";
      }

      const date = new Date(iso);

      const time = date.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Europe/Berlin", // giờ Berlin
      });

      const day = date.toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Europe/Berlin",
      });

      return (
        <div className="flex flex-col items-center text-xs text-[#4D4D4D]">
          <span>{day}</span>
          <span>{time}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "customer",
    header: () => <div className="text-center">SHIP TO NAME</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          <div>
            {row.original.user.company_name
              ? row.original.user.company_name
              : row.original.shipping_address.recipient_name}
          </div>
          <div>
            {row.original.user.email !== "guest" ? row.original.user.email : ""}{" "}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "customer_country",
    header: () => <div className="text-center">SHIP TO COUNTRY</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.original.shipping_address.country}
        </div>
      );
    },
  },
  {
    accessorKey: "customer_postal",
    header: () => <div className="text-center">SHIP TO POSTAL CODE</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.original.shipping_address.postal_code}
        </div>
      );
    },
  },
  {
    accessorKey: "customer_city",
    header: () => <div className="text-center">SHIP TO CITY</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">{row.original.shipping_address.city}</div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center w-full">STATUS</div>,
    cell: ({ row }) => {
      const raw = row.original.status?.toLowerCase() ?? "";
      const { text, bg, color } = getShippingStatusStyle(raw);

      return (
        <div
          className={`mx-auto px-4 py-1 rounded-full text-sm font-medium capitalize ${bg} ${color}`}
          style={{ width: "fit-content" }}
        >
          {text}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center w-full">ACTIONS</div>,
    cell: ({ row }) => (
      <ActionCellChild
        checkoutId={row.original.id}
        items={row.original.cart.items}
        isSupplier
      />
    ),
  },
];
