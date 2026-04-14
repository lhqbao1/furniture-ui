"use client";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAllCheckOutMain, getCheckOutRefundOrders } from "@/features/checkout/api";
import { getStatusStyle } from "./status-styles";
import { CheckOutMain } from "@/types/checkout";
import { formatDateDDMMYYYY } from "@/lib/date-formated";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { useEffect, useMemo, useState } from "react";
import { CHANEL_OPTIONS } from "./filter/filter-order-chanel";
import { STATUS_OPTIONS } from "@/data/data";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface ExportOrderExcelButtonProps {
  presetStatuses?: string[];
  lockStatusSelection?: boolean;
  expandByProductRefund?: boolean;
}

function getPrimaryCheckout(p: CheckOutMain) {
  if (!Array.isArray(p.checkouts)) return undefined;

  return p.checkouts.find((c) => c.invoice_address) ?? p.checkouts[0];
}

export default function ExportOrderExcelButton({
  presetStatuses,
  lockStatusSelection = false,
  expandByProductRefund = false,
}: ExportOrderExcelButtonProps) {
  const sortedChannelOptions = useMemo(
    () =>
      [...CHANEL_OPTIONS].sort((a, b) =>
        a.label.localeCompare(b.label, "de", { sensitivity: "base" }),
      ),
    [],
  );
  const channelOptions = useMemo(
    () => [{ key: "", label: "All" }, ...sortedChannelOptions],
    [sortedChannelOptions],
  );
  const [openChannel, setOpenChannel] = useState(false);
  const normalizedPresetStatuses = useMemo(
    () => Array.from(new Set((presetStatuses ?? []).map((status) => status.trim()))),
    [presetStatuses],
  );
  const baseStatuses = useMemo(
    () => (lockStatusSelection ? normalizedPresetStatuses : []),
    [lockStatusSelection, normalizedPresetStatuses],
  );
  const [marketplace, setMarketplace] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string[]>(baseStatuses);

  useEffect(() => {
    setSelectedStatus(baseStatuses);
  }, [baseStatuses]);

  const hasFilters = useMemo(() => {
    if (marketplace !== "") return true;

    const current = [...selectedStatus].sort().join(",");
    const initial = [...baseStatuses].sort().join(",");
    return current !== initial;
  }, [baseStatuses, marketplace, selectedStatus]);
  const selectedChannelLabel = useMemo(
    () => channelOptions.find((item) => item.key === marketplace)?.label ?? "All",
    [channelOptions, marketplace],
  );

  const { isFetching, refetch } = useQuery({
    queryKey: [
      "checkout-main-all",
      marketplace,
      selectedStatus.join(","),
      expandByProductRefund,
    ],
    queryFn: async () => {
      if (expandByProductRefund) {
        const response = await getCheckOutRefundOrders({
          page: 1,
          page_size: 5000,
          ...(marketplace ? { channel: [marketplace] } : {}),
        });
        return response.items;
      }

      return getAllCheckOutMain(marketplace, selectedStatus);
    },
    enabled: false, // ❌ không auto call
  });

  const toggleStatus = (item: (typeof STATUS_OPTIONS)[number]) => {
    if (lockStatusSelection) return;

    const backendStatuses = item.statuses ?? [item.key];
    const isSelected = backendStatuses.every((status) =>
      selectedStatus.includes(status),
    );

    if (isSelected) {
      setSelectedStatus((prev) =>
        prev.filter((status) => !backendStatuses.includes(status)),
      );
      return;
    }

    setSelectedStatus((prev) =>
      Array.from(new Set([...prev, ...backendStatuses])),
    );
  };

  const getExportFileName = (marketplace: string) => {
    if (!marketplace) return "order_export.xlsx";

    return `order_export_${marketplace}.xlsx`;
  };

  const handleExport = async () => {
    const res = await refetch(); // 🔥 gọi API tại đây
    const data = res.data;

    if (!data || data.length === 0) return;

    // Hàm xử lý giá trị null / undefined / "None"
    const clean = (val: unknown) =>
      val === null || val === undefined || val === "None" ? "" : val;

    const exportData = data.flatMap((p) => {
      const checkout = getPrimaryCheckout(p);
      const invoice = checkout?.invoice_address;
      const shipping = checkout?.shipping_address;
      const user = checkout?.user;
      const allItems = p.checkouts?.flatMap((c) => c.cart?.items ?? []) ?? [];

      const buyerAddressRow = {
        // -------- Invoice --------
        invoice_name: clean(invoice?.recipient_name ?? ""),
        invoice_company_name: clean(user?.company_name ?? ""),
        invoice_tax_number: clean(user?.tax_id ?? ""),
        invoice_phone_number: clean(invoice?.phone_number ?? ""),
        invoice_address: clean(invoice?.address_line ?? ""),
        invoice_additional_address: clean(
          invoice?.additional_address_line ?? "",
        ),
        invoice_city: clean(invoice?.city ?? ""),
        invoice_postal_code: clean(invoice?.postal_code ?? ""),
        invoice_country: clean(invoice?.country ?? ""),

        // -------- Shipping --------
        recipient_name: clean(shipping?.recipient_name ?? ""),
        recipient_phone_number: clean(shipping?.phone_number ?? ""),
        shipping_address: clean(shipping?.address_line ?? ""),
        shipping_additional_address: clean(
          shipping?.additional_address_line ?? "",
        ),
        shipping_city: clean(shipping?.city ?? ""),
        shipping_postal_code: clean(shipping?.postal_code ?? ""),
        shipping_country: clean(shipping?.country ?? ""),
      };

      const baseRow = {
        code: clean(p.checkout_code),
        marketplace: clean(p.from_marketplace ?? "Prestige Home"),
        marketplace_order_id: clean(p.marketplace_order_id),
        date: clean(formatDateDDMMYYYY(p.created_at)),
        status: clean(getStatusStyle(p.status).text),
        payment_method: clean(p.payment_method),
        note: clean(p.note ?? ""),
        product_id: clean(
          allItems
            .map((i) => i.products.id_provider)
            .filter(Boolean)
            .join(" | "),
        ),
        product_names: clean(
          allItems
            .map((i) => i.products.name)
            .filter(Boolean)
            .join(" | "),
        ),
        total_quantity: allItems.reduce((sum, i) => sum + (i.quantity ?? 0), 0),
        shipping_cost: clean(p.total_shipping),
        discount_amout: clean(p.voucher_amount),
        total_amount: clean(p.total_amount),
        ...(expandByProductRefund ? {} : buyerAddressRow),

        carrier: clean(
          checkout?.shipment ? checkout.shipment.shipping_carrier : "",
        ),
        suppliers: clean(
          allItems
            .map((i) =>
              i.products.owner && i.products.owner.business_name
                ? i.products.owner.business_name
                : "Prestige Home",
            )
            .filter(Boolean)
            .join(" | "),
        ),
        shipping_date: clean(
          checkout?.shipment
            ? formatDateDDMMYYYY(checkout.shipment.shipper_date)
            : "",
        ),
        tracking_number: clean(
          checkout?.shipment && checkout.shipment.tracking_number
            ? checkout.shipment.tracking_number
            : "",
        ),
        shipping_code: clean(
          checkout?.shipment && checkout.shipment.ship_code
            ? checkout.shipment.ship_code
            : "",
        ),
        // delivery_order_id: clean(
        //  checkout.
        // ),
      };

      if (!expandByProductRefund) {
        return [baseRow];
      }

      const refundItems = Array.isArray(p.product_refund) ? p.product_refund : [];

      if (refundItems.length === 0) {
        return [
          {
            ...baseRow,
            refund_item_name: "",
            refund_item_sku: "",
            refund_item_quantity: "",
            refund_item_id_provider: "",
            refund_item_unit_price: "",
            refund_item_refund_amount: "",
            refund_item_reason: "",
            refund_item_type: "",
            refund_item_files_url: "",
            refund_item_files_id: "",
            refund_item_files_created_at: "",
            refund_item_files_updated_at: "",
          },
        ];
      }

      return refundItems.map((refundItem) => ({
        ...baseRow,
        refund_item_name: clean(refundItem.name),
        refund_item_sku: clean(refundItem.sku),
        refund_item_quantity: clean(refundItem.quantity),
        refund_item_id_provider: clean(refundItem.id_provider),
        refund_item_unit_price: clean(refundItem.unit_price),
        refund_item_refund_amount: clean(refundItem.refund_amount),
        refund_item_reason: clean(refundItem.reason),
        refund_item_type: clean(refundItem.type),
        refund_item_files_url: clean(
          (refundItem.files ?? []).map((file) => file.url).filter(Boolean).join(" | "),
        ),
        refund_item_files_id: clean(
          (refundItem.files ?? []).map((file) => file.id).filter(Boolean).join(" | "),
        ),
        refund_item_files_created_at: clean(
          (refundItem.files ?? [])
            .map((file) => file.created_at)
            .filter(Boolean)
            .join(" | "),
        ),
        refund_item_files_updated_at: clean(
          (refundItem.files ?? [])
            .map((file) => file.updated_at)
            .filter(Boolean)
            .join(" | "),
        ),
      }));
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Ép TEXT cho các cột đã chốt
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, getExportFileName(marketplace));
  };

  const handleResetFilters = () => {
    setMarketplace("");
    setSelectedStatus(baseStatuses);
  };

  const lockedStatusLabel = useMemo(() => {
    if (!lockStatusSelection || normalizedPresetStatuses.length === 0) return "";

    const labels = normalizedPresetStatuses.map((status) => {
      const matched = STATUS_OPTIONS.find(
        (option) =>
          option.key === status || option.statuses?.some((item) => item === status),
      );
      return matched?.label ?? status;
    });

    return labels.join(", ");
  }, [lockStatusSelection, normalizedPresetStatuses]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 rounded-lg border-secondary/20 bg-white px-4 font-medium shadow-sm hover:bg-muted/30"
        >
          Export Orders
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-[350px] rounded-xl border border-secondary/15 p-0 shadow-xl"
      >
        <div className="space-y-4 p-4">
          <div className="border-b border-secondary/10 pb-3">
            <h3 className="text-base font-semibold leading-none text-foreground">
              Export Orders
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Filter your data before exporting.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Channel
            </Label>

            <Popover open={openChannel} onOpenChange={setOpenChannel}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  className="h-11 w-full justify-between border bg-white font-normal"
                >
                  {selectedChannelLabel}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                usePortal={false}
                className="z-[120] w-[var(--radix-popover-trigger-width)] p-0 pointer-events-auto"
              >
                <Command>
                  <CommandInput placeholder="Search channel..." />
                  <CommandList>
                    <CommandEmpty>No channel found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-y-auto">
                      {channelOptions.map((item) => (
                        <CommandItem
                          key={item.key || "all"}
                          value={`${item.label} ${item.key}`}
                          onSelect={() => {
                            setMarketplace(item.key);
                            setOpenChannel(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              marketplace === item.key ? "opacity-100" : "opacity-0",
                            )}
                          />
                          {item.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </Label>
            <Select>
              <SelectTrigger
                className="h-11 border bg-white"
                disabled={lockStatusSelection}
              >
                <SelectValue
                  placeholder={
                    lockStatusSelection && lockedStatusLabel
                      ? lockedStatusLabel
                      : "Choose status"
                  }
                />
              </SelectTrigger>
              <SelectContent className="max-h-96">
                {STATUS_OPTIONS.map((item) => (
                  <div
                    key={item.key}
                    className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 hover:bg-accent"
                    onClick={() => toggleStatus(item)}
                  >
                    <Checkbox
                      checked={
                        item.statuses
                          ? item.statuses.every((status) =>
                              selectedStatus.includes(status),
                            )
                          : selectedStatus.includes(item.key)
                      }
                    />
                    <span>{item.label}</span>
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              disabled={!hasFilters || isFetching}
              className="h-11 flex-1"
            >
              Reset Filters
            </Button>

            <Button
              onClick={handleExport}
              disabled={isFetching}
              className="h-11 flex-1"
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Export Excel"
              )}
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
