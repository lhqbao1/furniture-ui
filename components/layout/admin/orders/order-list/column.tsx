"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckOut, CheckOutMain } from "@/types/checkout";
import { ChevronDown, ChevronRight, Eye, X } from "lucide-react";
import ViewFileDialog from "./view-file";
import { listChanel } from "@/data/data";
import { useRouter } from "@/src/i18n/navigation";
import { useLocale } from "next-intl";
import { CartItem } from "@/types/cart";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ProductTable } from "../../products/products-list/product-table";
import { cartSupplierColumn } from "@/components/layout/cart/columns";
import ViewFileChildDialog from "@/components/layout/packaging-dialog/packaging-dialog-chil";
import { getStatusStyle } from "./status-styles";
import CancelExchangeDialog from "../order-details/dialog/cancel-exchange-dialog";

const ActionCell = ({
  id,
  expandedRowId,
  setExpandedRowId,
  currentRowId,
  status,
}: {
  id: string;
  expandedRowId?: string | null;
  setExpandedRowId?: (id: string | null) => void;
  currentRowId?: string;
  status: string;
}) => {
  const router = useRouter();
  const locale = useLocale();

  const isExpanded = expandedRowId === currentRowId;

  return (
    <div className="flex justify-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push(`/admin/orders/${id}`, { locale })}
      >
        <Eye
          className="w-4 h-4"
          stroke="#F7941D"
        />
      </Button>

      {/* Expand button */}
      <Button
        variant={"ghost"}
        type="button"
        onClick={() => {
          setExpandedRowId?.(isExpanded ? null : currentRowId ?? null);
        }}
        className="p-1"
      >
        {isExpanded ? (
          <ChevronDown className="size-4 text-gray-600" />
        ) : (
          <ChevronRight className="size-4 text-gray-600" />
        )}
      </Button>
    </div>
  );
};

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
      <Button
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
      </Button>
    </div>
  );
};

export const orderColumns: ColumnDef<CheckOutMain>[] = [
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
    accessorKey: "id",
    header: "ORDER ID",
    cell: ({ row }) => {
      return <div>#{row.original.checkout_code}</div>;
    },
  },
  {
    accessorKey: "external_id",
    header: "EXTERNAL ID",
    cell: ({ row }) => {
      return <div>{row.original.marketplace_order_id}</div>;
    },
  },
  {
    accessorKey: "customer",
    header: "CUSTOMER",
    cell: ({ row }) => {
      return (
        <div>
          {row.original.checkouts[0].user.is_real ? (
            <>
              <div>
                {row.original.checkouts[0]?.user?.first_name}{" "}
                {row.original.checkouts[0]?.user?.last_name}
              </div>
              <div>{row.original.checkouts[0]?.user?.email ?? ""}</div>
            </>
          ) : (
            <>
              <div>
                {row.original.from_marketplace === "ebay"
                  ? "Ebay Customer"
                  : row.original.checkouts[0].invoice_address.recipient_name ??
                    ""}
              </div>
              <div>
                {row.original.checkouts[0]?.invoice_address?.email ?? ""}
              </div>
            </>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "channel",
    header: () => <div className="text-center w-full">CHANNEL</div>,
    cell: ({ row }) => {
      const currentChanel = row.original.from_marketplace;
      const channelLogo =
        listChanel.find((ch) => ch.name === currentChanel)?.icon ||
        "new-logo.svg";
      return (
        <div className="h-12 relative">
          <Image
            src={`/${channelLogo}`}
            alt="icon"
            fill
            className="object-contain p-2"
            unoptimized
          />
        </div>
      );
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
    accessorKey: "status",
    header: () => <div className="text-center w-full">STATUS</div>,
    cell: ({ row }) => {
      const raw = row.original.status?.toLowerCase() ?? "";
      const { text, bg, color } = getStatusStyle(raw);

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
    accessorKey: "value",
    header: () => <div className="text-center w-full">INVOICE</div>,
    cell: ({ row }) => {
      return (
        <div className="flex gap-1 items-center justify-end">
          <div
            className={`${
              row.original.total_amount < 0 ? "text-red-500" : "text-[#4D4D4D]"
            }`}
          >
            €
            {row.original.total_amount.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <ViewFileDialog
            checkoutId={row.original.id}
            type="invoice"
          />
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center w-full">ACTIONS</div>,
    cell: ({ row, table }) => (
      <ActionCell
        id={row.original.id}
        expandedRowId={table.options.meta?.expandedRowId || null}
        setExpandedRowId={table.options.meta?.setExpandedRowId || (() => {})}
        currentRowId={row.id}
        status={row.original.status}
      />
    ),
  },
];

export const customerOrderColumns: ColumnDef<CheckOutMain>[] = [
  {
    accessorKey: "id",
    header: "ORDER ID",
    cell: ({ row }) => {
      return <div>#{row.original.checkout_code}</div>;
    },
  },
  {
    accessorKey: "external_id",
    header: "EXTERNAL ID",
    cell: ({ row }) => {
      return <div>{row.original.marketplace_order_id}</div>;
    },
  },
  {
    accessorKey: "customer",
    header: "CUSTOMER",
    cell: ({ row }) => {
      return (
        <div>
          <div className="capitalize">
            {row.original.checkouts[0].user.first_name}{" "}
            {row.original.checkouts[0].user.last_name}
          </div>
          <div>{row.original.checkouts[0].user.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "channel",
    header: () => <div className="text-center w-full">CHANNEL</div>,
    cell: ({ row }) => {
      const currentChanel = row.original.from_marketplace;
      const channelLogo =
        listChanel.find((ch) => ch.name === currentChanel)?.icon ||
        "new-logo.svg";
      return (
        <div className="h-12 relative">
          <Image
            src={`/${channelLogo}`}
            alt="icon"
            fill
            className="object-contain p-2"
            unoptimized
          />
        </div>
        // <div className="text-center capitalize font-semibold">{row.original.from_marketplace ? row.original.from_marketplace : 'Prestige Home'}</div>
      );
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
    accessorKey: "status",
    header: () => <div className="text-center w-full">STATUS</div>,
    cell: ({ row }) => {
      const raw = row.original.status?.toLowerCase() ?? "";
      const { text, bg, color } = getStatusStyle(raw);

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
    accessorKey: "value",
    header: () => <div className="text-center w-full">INVOICE</div>,
    cell: ({ row }) => {
      return (
        <div className="flex gap-1 items-center justify-end">
          <div
            className={`${
              row.original.total_amount < 0 ? "text-red-500" : "text-[#4D4D4D]"
            }`}
          >
            €
            {row.original.total_amount.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          {row.original.status === "Pending" ? (
            ""
          ) : (
            <ViewFileDialog
              checkoutId={row.original.id}
              type="invoice"
            />
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center w-full">ACTIONS</div>,
    cell: ({ row, table }) => (
      <ActionCell
        id={row.original.id}
        expandedRowId={table.options.meta?.expandedRowId || null}
        setExpandedRowId={table.options.meta?.setExpandedRowId || (() => {})}
        currentRowId={row.id}
        status={row.original.status}
      />
    ),
  },
];

export const orderChildColumns: ColumnDef<CheckOut>[] = [
  {
    accessorKey: "id",
    header: "DELIVERY ORDER ID",
    cell: ({ row }) => {
      return <div>#{row.original.checkout_code}</div>;
    },
  },
  {
    accessorKey: "owner",
    header: ({}) => <div className="text-center">SUPPLIER</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.original?.supplier?.business_name
            ? row.original?.supplier?.business_name
            : "Prestige Home"}
        </div>
      );
    },
  },
  {
    accessorKey: "channel",
    header: () => <div className="text-center w-full">CHANNEL</div>,
    cell: ({ row }) => {
      const currentChanel = row.original.from_marketplace;
      const channelLogo =
        listChanel.find((ch) => ch.name === currentChanel)?.icon ||
        "new-logo.svg";
      return (
        <div className="h-12 relative">
          <Image
            src={`/${channelLogo}`}
            alt="icon"
            fill
            className="object-contain p-2"
            unoptimized
          />
        </div>
        // <div className="text-center capitalize font-semibold">{row.original.from_marketplace ? row.original.from_marketplace : 'Prestige Home'}</div>
      );
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
    accessorKey: "tracking_number",
    header: ({}) => <div className="text-center">TRACKING NUMBER</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.original?.shipment
            ? row.original?.shipment?.tracking_number
            : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "ship_code",
    header: ({}) => <div className="text-center">SHIPPING CODE</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.original?.shipment ? row.original?.shipment?.ship_code : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "carrier",
    header: () => <div className="text-center w-full">CARRIER</div>,
    cell: ({ row }) => (
      <div className="text-center uppercase">
        {row.original.shipment
          ? row.original.shipment.shipping_carrier
          : row.original.carrier}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center w-full">STATUS</div>,
    cell: ({ row }) => {
      const status = row.original.status?.toLowerCase();
      const shipmentStatus = row.original.shipment?.status;

      let displayStatus = "pending";

      if (status === "cancel_exchange") {
        displayStatus = "cancel exchange";
      } else if (row.original.shipment) {
        displayStatus = shipmentStatus;
      }

      return <div className="text-center lowercase">{displayStatus}</div>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center w-full">ACTIONS</div>,
    cell: ({ row, table }) => (
      <ActionCellChild
        checkoutId={row.original.id}
        items={row.original.cart.items}
        expandedRowId={table.options.meta?.expandedRowId || null}
        setExpandedRowId={table.options.meta?.setExpandedRowId || (() => {})}
        currentRowId={row.id}
        status={row.original.status}
      />
    ),
  },
];

export const orderChildSupplierColumns: ColumnDef<CheckOut>[] = [
  {
    accessorKey: "id",
    header: "DELIVERY ORDER ID",
    cell: ({ row }) => {
      return <div>#{row.original.checkout_code}</div>;
    },
  },
  {
    accessorKey: "customer",
    header: "CUSTOMER",
    cell: ({ row }) => {
      return (
        <div>
          <div>
            {row.original.user.first_name} {row.original.user.last_name}
          </div>
          <div>{row.original.user.email}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "channel",
    header: () => <div className="text-center w-full">CHANNEL</div>,
    cell: ({ row }) => {
      const currentChanel = row.original.from_marketplace;
      const channelLogo =
        listChanel.find((ch) => ch.name === currentChanel)?.icon ||
        "new-logo.svg";
      return (
        <div className="h-12 relative">
          <Image
            src={`/${channelLogo}`}
            alt="icon"
            fill
            className="object-contain p-2"
            unoptimized
          />
        </div>
        // <div className="text-center capitalize font-semibold">{row.original.from_marketplace ? row.original.from_marketplace : 'Prestige Home'}</div>
      );
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
    accessorKey: "status",
    header: () => <div className="text-center w-full">STATUS</div>,
    cell: ({ row }) => (
      <div className="text-center lowercase">{row.original.status}</div>
    ),
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
