"use client";

import { CheckOutMain } from "@/types/checkout";
import React, { useEffect, useMemo, useState } from "react";
import OrderStatusSelector from "./order-status-selector";
import OrderTagSelector from "./order-tag-selector";
import {
  Check,
  ChevronsUpDown,
  Hash,
  Loader2,
  Pencil,
  ReceiptText,
  Store,
  WalletCards,
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CHANEL_OPTIONS } from "../order-list/filter/filter-order-chanel";
import { useUpdateMainCheckout } from "@/features/checkout/hook";
import { cn } from "@/lib/utils";

interface OrderDetailOverViewProps {
  created_at: string;
  updated_at: string;
  status: string;
  order: CheckOutMain;
}

type MarketplaceInvoicePreset = {
  company_name: string;
  tax_id: string;
  invoice_address: string;
  invoice_city: string;
  invoice_postal_code: string;
  invoice_country: string;
};

type EditableOrderField = "ext_id" | "ext_reference";

const EDITABLE_ORDER_FIELD_CONFIG: Record<
  EditableOrderField,
  { label: string; description: string }
> = {
  ext_id: {
    label: "Ext order",
    description: "Update the external order ID for this order.",
  },
  ext_reference: {
    label: "External Reference",
    description: "Update the external reference for this order.",
  },
};

const PRESET_BY_MARKETPLACE: Record<string, MarketplaceInvoicePreset> = {
  netto: {
    company_name: "NeS GmbH",
    tax_id: "DE811205180",
    invoice_address: "Industriepark Ponholz 1",
    invoice_city: "Maxhütte-Haidhof",
    invoice_postal_code: "93142",
    invoice_country: "DE",
  },
  freakout: {
    company_name: "FREAK-OUT GmbH",
    tax_id: "ATU80855139",
    invoice_address: "Steingasse 6a",
    invoice_city: "Linz",
    invoice_postal_code: "4020",
    invoice_country: "AT",
  },
  inprodius: {
    company_name: "Inprodius Solutions GmbH",
    tax_id: "DE815533652",
    invoice_address: "Lange Wende 41-43",
    invoice_city: "Soest",
    invoice_postal_code: "59494",
    invoice_country: "DE",
  },
  norma: {
    company_name: "NORMA24 Online-Shop GmbH & Co.KG",
    tax_id: "DE281146018",
    invoice_address: "Manfred-Roth-Straße 7",
    invoice_city: "Fürth",
    invoice_postal_code: "90766",
    invoice_country: "DE",
  },
  forstinger: {
    company_name: "Forstinger eCom GmbH",
    tax_id: "ATU81672717",
    invoice_address: "Königstetter Straße 128-134",
    invoice_city: "Tulln",
    invoice_postal_code: "3430",
    invoice_country: "AT",
  },
  "euro-tops": {
    company_name: "Eurotops Versand GmbH",
    tax_id: "DE121393328",
    invoice_address: "Elisabeth-Selbert-Str. 3",
    invoice_city: "Langenfeld",
    invoice_postal_code: "40764",
    invoice_country: "DE",
  },
  bauhaus: {
    company_name: "BAHAG Baus Handelsgesellschaft AG",
    tax_id: "DE143872368",
    invoice_address: "Gutenbergstr. 21",
    invoice_city: "Mannheim",
    invoice_postal_code: "68167",
    invoice_country: "DE",
  },
  bader: {
    company_name: "BRUNO BADER GmbH + Co. KG",
    tax_id: "DE 144173081",
    invoice_address: "Maximilianstr. 48",
    invoice_city: "Pforzheim",
    invoice_postal_code: "75172",
    invoice_country: "DE",
  },
  XXXLUTZ: {
    company_name: "XXXLutz KG",
    tax_id: "ATU65296645",
    invoice_address: "Römerstrasse 39",
    invoice_city: "Wels",
    invoice_postal_code: "4600",
    invoice_country: "AT",
  },
  moebelix: {
    company_name: "XXXLutz KG",
    tax_id: "ATU65296645",
    invoice_address: "Römerstrasse 39",
    invoice_city: "Wels",
    invoice_postal_code: "4600",
    invoice_country: "AT",
  },
  otto: {
    company_name: "Otto GmbH & Co. KGaA",
    tax_id: "DE340596305",
    invoice_address: "Werner-Otto-Straße 1-7",
    invoice_city: "Hamburg",
    invoice_postal_code: "22179",
    invoice_country: "DE",
  },
};

const normalizeChannelValue = (value?: string | null) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");

const getChannelOption = (value?: string | null) => {
  const normalized = normalizeChannelValue(value);

  return CHANEL_OPTIONS.find((item) => {
    const normalizedKey = normalizeChannelValue(item.key);
    const normalizedLabel = normalizeChannelValue(item.label);
    return normalizedKey === normalized || normalizedLabel === normalized;
  });
};

const getMarketplacePreset = (value?: string | null) => {
  const normalized = normalizeChannelValue(value);

  return Object.entries(PRESET_BY_MARKETPLACE).find(
    ([key]) => normalizeChannelValue(key) === normalized,
  )?.[1];
};

const mapPresetToInvoiceAddressPayload = (preset: MarketplaceInvoicePreset) => ({
  address_line: preset.invoice_address,
  city: preset.invoice_city,
  country: preset.invoice_country,
  postal_code: preset.invoice_postal_code,
  company_name: preset.company_name,
  tax_id: preset.tax_id,
});

const OrderDetailOverView = ({
  created_at,
  updated_at,
  status,
  order,
}: OrderDetailOverViewProps) => {
  const rawChannel = order.from_marketplace?.trim();
  const currentChannelOption = useMemo(
    () => getChannelOption(rawChannel) ?? getChannelOption("prestige_home"),
    [rawChannel],
  );
  const currentChannelKey = currentChannelOption?.key ?? "prestige_home";
  const channelLabel =
    currentChannelOption?.label ??
    (rawChannel ? rawChannel.toUpperCase() : "Prestige Home");

  const updateMainCheckoutMutation = useUpdateMainCheckout();
  const [channelDialogOpen, setChannelDialogOpen] = useState(false);
  const [channelPopoverOpen, setChannelPopoverOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(currentChannelKey);
  const [editableOrderField, setEditableOrderField] =
    useState<EditableOrderField | null>(null);
  const [editableOrderFieldValue, setEditableOrderFieldValue] = useState("");

  const selectedChannelOption = useMemo(
    () => getChannelOption(selectedChannel),
    [selectedChannel],
  );
  const selectedMarketplacePreset = useMemo(
    () => getMarketplacePreset(selectedChannel),
    [selectedChannel],
  );

  useEffect(() => {
    if (!channelDialogOpen) return;
    setSelectedChannel(currentChannelKey);
    setChannelPopoverOpen(false);
  }, [channelDialogOpen, currentChannelKey]);

  const handleUpdateChannel = async () => {
    if (!selectedChannel) {
      toast.error("Please select channel");
      return;
    }

    if (selectedChannel === currentChannelKey) {
      setChannelDialogOpen(false);
      return;
    }

    try {
      const invoiceAddressPayload = selectedMarketplacePreset
        ? mapPresetToInvoiceAddressPayload(selectedMarketplacePreset)
        : undefined;

      await updateMainCheckoutMutation.mutateAsync({
        main_checkout_id: order.id,
        payload: {
          channel: selectedChannel,
          ...(invoiceAddressPayload
            ? { invoice_address: invoiceAddressPayload }
            : {}),
        },
      });
      toast.success("Channel updated successfully");
      setChannelDialogOpen(false);
    } catch {
      toast.error("Failed to update channel");
    }
  };

  const openOrderFieldDialog = (
    field: EditableOrderField,
    currentValue?: string | null,
  ) => {
    setEditableOrderFieldValue(currentValue ?? "");
    setEditableOrderField(field);
  };

  const handleOrderFieldDialogOpenChange = (open: boolean) => {
    if (open) return;
    setEditableOrderField(null);
    setEditableOrderFieldValue("");
  };

  const handleUpdateOrderField = async () => {
    if (!editableOrderField) return;

    const nextValue = editableOrderFieldValue.trim();
    const payload =
      editableOrderField === "ext_id"
        ? { ext_id: nextValue }
        : { ext_reference: nextValue };

    try {
      await updateMainCheckoutMutation.mutateAsync({
        main_checkout_id: order.id,
        payload,
      });
      toast.success(
        `${EDITABLE_ORDER_FIELD_CONFIG[editableOrderField].label} updated successfully`,
      );
      handleOrderFieldDialogOpenChange(false);
    } catch {
      toast.error(
        `Failed to update ${EDITABLE_ORDER_FIELD_CONFIG[editableOrderField].label.toLowerCase()}`,
      );
    }
  };

  const currentEditableOrderFieldValue =
    editableOrderField === "ext_id"
      ? (order.marketplace_order_id ?? "")
      : (order.netto_buyer_id ?? "");
  const isOrderFieldValueUnchanged =
    editableOrderFieldValue.trim() === currentEditableOrderFieldValue.trim();

  return (
    <div className="col-span-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">
          Order Overview
        </h3>
        <Store className="size-4 text-slate-500" />
      </div>

      <div className="space-y-2.5 text-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="text-slate-500">Channel</div>
          <div className="flex items-center gap-1.5">
            <div className="font-semibold text-slate-900">{channelLabel}</div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Edit channel"
              className="size-7 text-primary hover:bg-primary/10 hover:text-primary"
              onClick={() => setChannelDialogOpen(true)}
            >
              <Pencil className="size-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 text-slate-500">
            <Hash className="size-3.5" />
            <span>Order ID</span>
          </div>
          <div className="font-semibold text-slate-900">
            {order.checkout_code}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 text-slate-500">
            <ReceiptText className="size-3.5" />
            <span>Ext order</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="font-medium text-slate-700">
              {order.marketplace_order_id ? order.marketplace_order_id : "-"}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Edit ext order"
              className="size-7 text-primary hover:bg-primary/10 hover:text-primary"
              onClick={() =>
                openOrderFieldDialog("ext_id", order.marketplace_order_id)
              }
            >
              <Pencil className="size-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 text-slate-500">
            <ReceiptText className="size-3.5" />
            <span>External Reference</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="font-medium text-slate-700">
              {order.netto_buyer_id ? order.netto_buyer_id : "-"}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Edit external reference"
              className="size-7 text-primary hover:bg-primary/10 hover:text-primary"
              onClick={() =>
                openOrderFieldDialog(
                  "ext_reference",
                  order.netto_buyer_id,
                )
              }
            >
              <Pencil className="size-3.5" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="text-slate-500">Created</div>
          <div className="text-slate-700">{created_at}</div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="text-slate-500">Last update</div>
          <div className="text-slate-700">{updated_at}</div>
        </div>
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex items-center gap-1 text-slate-500">
            <WalletCards className="size-3.5 mt-0.5" />
            <span>Payment Method</span>
          </div>
          <div translate="no" className="text-right capitalize text-slate-700">
            {order.from_marketplace &&
            order.from_marketplace.toLowerCase() !== "econelo"
              ? `${order.from_marketplace} Managed Payments`
              : order.payment_method}
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <OrderStatusSelector order={order} status={status} />
        <OrderTagSelector order={order} />
      </div>

      <Dialog open={channelDialogOpen} onOpenChange={setChannelDialogOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Channel</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-900">Channel</div>
            <Popover
              open={channelPopoverOpen}
              onOpenChange={setChannelPopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between border bg-white font-normal text-black"
                >
                  <span className="truncate">
                    {selectedChannelOption?.label ?? "Choose channel"}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>

              <PopoverContent
                usePortal={false}
                className="z-[120] w-[var(--radix-popover-trigger-width)] p-0 pointer-events-auto"
              >
                <Command>
                  <CommandInput placeholder="Search channel..." />
                  <CommandList className="max-h-80">
                    <CommandEmpty>No channel found.</CommandEmpty>
                    <CommandGroup>
                      {CHANEL_OPTIONS.map((item) => {
                        const isSelected = selectedChannel === item.key;

                        return (
                          <CommandItem
                            key={item.key}
                            value={`${item.label} ${item.key}`}
                            onSelect={() => {
                              setSelectedChannel(item.key);
                              setChannelPopoverOpen(false);
                            }}
                            className="cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "h-4 w-4",
                                isSelected ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {item.icon ? (
                              <Image
                                src={`/${item.icon}`}
                                alt={item.label}
                                width={18}
                                height={18}
                                className="shrink-0"
                              />
                            ) : null}
                            <span className="truncate">{item.label}</span>
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedMarketplacePreset ? (
            <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-3">
              <div className="mb-2 text-sm font-semibold text-slate-900">
                Invoice address preset
              </div>
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <div className="text-xs text-slate-500">Company</div>
                  <div className="font-medium text-slate-900">
                    {selectedMarketplacePreset.company_name}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Tax ID</div>
                  <div className="font-medium text-slate-900">
                    {selectedMarketplacePreset.tax_id}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-xs text-slate-500">Address</div>
                  <div className="font-medium text-slate-900">
                    {selectedMarketplacePreset.invoice_address}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Postal code</div>
                  <div className="font-medium text-slate-900">
                    {selectedMarketplacePreset.invoice_postal_code}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">City</div>
                  <div className="font-medium text-slate-900">
                    {selectedMarketplacePreset.invoice_city}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Country</div>
                  <div className="font-medium text-slate-900">
                    {selectedMarketplacePreset.invoice_country}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
              This channel does not have an invoice address preset. Only the
              channel field will be updated.
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setChannelDialogOpen(false)}
              disabled={updateMainCheckoutMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdateChannel}
              disabled={
                updateMainCheckoutMutation.isPending ||
                selectedChannel === currentChannelKey
              }
            >
              {updateMainCheckoutMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editableOrderField !== null}
        onOpenChange={handleOrderFieldDialogOpenChange}
      >
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md">
          <DialogHeader>
            <DialogTitle>
              Edit{" "}
              {editableOrderField
                ? EDITABLE_ORDER_FIELD_CONFIG[editableOrderField].label
                : "order field"}
            </DialogTitle>
            <DialogDescription>
              {editableOrderField
                ? EDITABLE_ORDER_FIELD_CONFIG[editableOrderField].description
                : ""}
            </DialogDescription>
          </DialogHeader>

          <Input
            value={editableOrderFieldValue}
            onChange={(event) =>
              setEditableOrderFieldValue(event.target.value)
            }
            placeholder={
              editableOrderField
                ? EDITABLE_ORDER_FIELD_CONFIG[editableOrderField].label
                : ""
            }
            autoFocus
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !isOrderFieldValueUnchanged &&
                !updateMainCheckoutMutation.isPending
              ) {
                event.preventDefault();
                void handleUpdateOrderField();
              }
            }}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOrderFieldDialogOpenChange(false)}
              disabled={updateMainCheckoutMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdateOrderField}
              disabled={
                updateMainCheckoutMutation.isPending ||
                isOrderFieldValueUnchanged
              }
            >
              {updateMainCheckoutMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderDetailOverView;
