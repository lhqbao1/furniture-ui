"use client";

import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import { Check, ChevronsUpDown, File } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { createManualCheckOut } from "@/features/checkout/api";
import { ManualCreateOrderFormValues } from "@/lib/schema/manual-checkout";
import ExportExampleOrderExcelButton from "./export-example-button";
import { cn } from "@/lib/utils";

type MarketplacePreset = {
  company_name: string;
  tax_id: string;
  invoice_address: string;
  invoice_city: string;
  invoice_postal_code: string;
  invoice_country: string;
};

type RawOrderRow = Record<string, unknown>;

type NormalizedOrder = {
  email: string | null;
  tax_id: string | null;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  address: string;
  additional_address: string | null;
  recipient_name: string | null;
  city: string;
  country: string;
  phone: string | null;
  postal_code: string;
  email_shipping: string | null;
  invoice_address: string;
  invoice_recipient_name: string | null;
  invoice_phone: string | null;
  email_invoice: string | null;
  invoice_city: string;
  invoice_postal_code: string;
  invoice_country: string;
  from_marketplace: string | null;
  marketplace_order_id: string | null;
  netto_buyer_id: string | null;
  id_provider: string | null;
  quantity: number;
  title: string | null;
  sku: string | null;
  final_price: number;
  tax: number;
  status: string;
  payment_term: number | null;
  total_shipping: number;
  vat: number;
  carrier: string | null;
};

type GroupedOrder = ManualCreateOrderFormValues;

const CHANNEL_OPTIONS = [
  { value: "amazon", label: "Amazon" },
  { value: "inprodius", label: "Inprodius" },
  { value: "netto", label: "Netto" },
  { value: "freakout", label: "FreakOut" },
  { value: "praktiker", label: "Praktiker" },
  { value: "norma", label: "Norma24" },
  { value: "check24", label: "Check24" },
  { value: "channel21", label: "Channel21" },
  { value: "hornbach", label: "Hornbach" },
  { value: "forstinger", label: "Forstinger" },
  { value: "neckermann", label: "Neckermann" },
  { value: "bauhaus", label: "Bauhaus" },
  { value: "bader", label: "Bader" },
  { value: "euro-tops", label: "Euro Tops" },
  { value: "XXXLUTZ", label: "XXXLUTZ" },
  { value: "prestige", label: "Prestige Home" },
] as const;

const PRESET_BY_MARKETPLACE: Record<string, MarketplacePreset | null> = {
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
  // thêm sau nếu cần:
  praktiker: null,
  check24: null,
  amazon: null,
  prestige: null,
  channel21: null,
  hornbach: null,
  neckermann: null,
};

const toStringOrNull = (value: unknown): string | null =>
  value == null ? null : String(value);

const toTrimmedStringOrNull = (value: unknown): string | null => {
  const str = toStringOrNull(value);
  return str === null ? null : str.trim();
};

const toNumberOrDefault = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toVatMultiplier = (value: unknown): number => {
  if (value == null) return 1;

  const normalized = String(value).trim().replace(",", ".");
  if (!normalized) return 1;

  const hasPercentSuffix = normalized.includes("%");
  const numeric = Number(normalized.replace("%", ""));

  if (!Number.isFinite(numeric)) return 1;
  if (numeric <= 0) return 1;

  if (hasPercentSuffix) return 1 + numeric / 100;

  // Excel/CSV may store VAT as rate (0.19), percentage (19), or multiplier (1.19).
  if (numeric > 1 && numeric < 2) return numeric; // already multiplier
  if (numeric <= 1) return 1 + numeric; // rate
  if (numeric <= 100) return 1 + numeric / 100; // percentage
  return numeric;
};

const toNumberOrNull = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toRequiredString = (value: unknown, fallback = ""): string =>
  toTrimmedStringOrNull(value) ?? fallback;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getOrderGroupKey = (row: NormalizedOrder, rowIndex: number): string => {
  const marketplaceOrderId = row.marketplace_order_id?.trim();
  // If marketplace_order_id exists, rows with same id are treated as one order
  // and merged into the same items array.
  if (marketplaceOrderId) return marketplaceOrderId;
  // Fallback for malformed rows: avoid accidentally merging unrelated orders.
  return `__row_${rowIndex}`;
};

const normalize = (
  row: RawOrderRow,
  preset: MarketplacePreset | null,
  channel: string,
): NormalizedOrder => {
  const hasCompany = preset?.company_name ?? row["company_name"];
  const computedTax =
    row["country"] === "DE"
      ? 19
      : row["country"] === "AT"
        ? hasCompany
          ? 0
          : 20
        : null;

  return {
    email: toTrimmedStringOrNull(row["email"]) ?? "guest",
    tax_id: preset?.tax_id ?? toStringOrNull(row["tax_id"]),
    first_name: toStringOrNull(row["first_name"]),
    last_name: toTrimmedStringOrNull(row["last_name"]),
    company_name: preset?.company_name
      ? preset.company_name
      : toStringOrNull(row["company_name"]) || null,

    address: toRequiredString(row["address"]),
    additional_address: toTrimmedStringOrNull(row["additional_address"]),
    recipient_name: toStringOrNull(row["recipient_name"]),
    city: toRequiredString(row["city"]),
    country: toRequiredString(row["country"], "DE"),
    phone: toStringOrNull(row["phone"]),
    postal_code: toRequiredString(row["postal_code"]),
    email_shipping: toStringOrNull(row["email_shipping"]),

    invoice_address: toRequiredString(
      preset?.invoice_address ?? row["invoice_address"],
    ),
    invoice_recipient_name:
      [row["first_name"], row["last_name"]].filter(Boolean).join(" ") || null,
    invoice_phone: toStringOrNull(row["invoice_phone"]),
    email_invoice: toTrimmedStringOrNull(row["email"]),
    invoice_city: toRequiredString(preset?.invoice_city ?? row["invoice_city"]),
    invoice_postal_code: toRequiredString(
      preset?.invoice_postal_code ?? row["invoice_postal_code"],
    ),
    invoice_country: toRequiredString(
      preset?.invoice_country ?? row["invoice_country"],
      "DE",
    ),

    from_marketplace: channel.toLowerCase().trim(),
    marketplace_order_id: toTrimmedStringOrNull(row["marketplace_order_id"]),
    netto_buyer_id: toTrimmedStringOrNull(row["netto_buyer"]),

    id_provider: toTrimmedStringOrNull(row["id_provider"]),
    quantity: Number(row["quantity"] ?? 1),
    title: toTrimmedStringOrNull(row["title"]),
    sku: toStringOrNull(row["sku"]),
    final_price: Number(row["final_price"] ?? 1),
    tax: computedTax ?? 0,
    status: toStringOrNull(row["status"]) ?? "PAID",
    payment_term: toNumberOrNull(row["payment_term"]),
    total_shipping: toNumberOrDefault(row["total_shipping"], 35.95),
    vat: toVatMultiplier(row["vat"]),
    carrier: toStringOrNull(row["carrier"]),
  };
};

const OrderImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [channel, setChannel] = useState<string | null>(null);
  const [orders, setOrders] = useState<GroupedOrder[]>([]);
  const [open, setOpen] = useState(false);
  const [openChannel, setOpenChannel] = useState(false);
  const sortedChannelOptions = useMemo(
    () =>
      [...CHANNEL_OPTIONS].sort((a, b) =>
        a.label.localeCompare(b.label, "de", { sensitivity: "base" }),
      ),
    [],
  );

  const clearFormState = () => {
    setFile(null);
    setOrders([]);
    setOpenChannel(false);
  };

  const onDrop = (files: File[]) => {
    if (!channel) {
      toast.error("Please select marketplace first");
      return;
    }

    const uploaded = files[0];
    setFile(uploaded);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const json = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
      }) as RawOrderRow[];

      const preset = PRESET_BY_MARKETPLACE[channel] ?? null;

      const normalized = json.map((row) => normalize(row, preset, channel));
      const normalizedChannel = channel.toLowerCase().trim();
      const isNettoChannel = normalizedChannel === "netto";
      const isNorma24Channel =
        normalizedChannel === "norma" || normalizedChannel === "norma24";
      const shouldAggregateShippingByRow = isNettoChannel || isNorma24Channel;

      const grouped: Record<string, GroupedOrder> = {};

      normalized.forEach((row, rowIndex) => {
        const groupKey = getOrderGroupKey(row, rowIndex);

        if (!grouped[groupKey]) {
          const {
            sku,
            quantity,
            title,
            id_provider,
            final_price,
            vat,
            ...rest
          } = row;
          grouped[groupKey] = {
            ...rest,
            total_shipping: shouldAggregateShippingByRow
              ? 0
              : rest.total_shipping,
            items: [],
          };
        }

        if (shouldAggregateShippingByRow) {
          const quantity =
            Number.isFinite(row.quantity) && row.quantity > 0
              ? row.quantity
              : 1;
          const shippingPerUnit = Number.isFinite(row.total_shipping)
            ? row.total_shipping
            : 0;
          grouped[groupKey].total_shipping += shippingPerUnit * quantity;
        }

        grouped[groupKey].items.push({
          quantity: row.quantity,
          id_provider: row.id_provider ?? "",
          title: row.title ?? null,
          sku: row.sku ?? "",
          final_price: row.final_price * row.vat,
          carrier: row.carrier ?? "",
        });
      });

      const payload = Object.values(grouped);
      setOrders(payload);
    };

    reader.readAsBinaryString(uploaded);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    disabled: !channel,
  });

  const handleSubmit = async () => {
    if (!orders.length) return toast.error("No parsed data to submit");

    const toastId = toast.loading(`Submitting ${orders.length} orders...`);

    // đóng dialog ngay khi submit
    setOpen(false);

    const failures: {
      index: number;
      error: unknown;
      id?: string | null;
      message?: string;
    }[] = [];
    let successCount = 0;

    for (let index = 0; index < orders.length; index += 1) {
      try {
        await createManualCheckOut(orders[index]);
        successCount += 1;
      } catch (error: unknown) {
        console.error("Failed to create order", { index, error });
        const failedId = (orders[index] as { marketplace_order_id?: string })
          ?.marketplace_order_id;
        const err = error as {
          response?: { data?: { detail?: unknown; message?: unknown } };
          message?: unknown;
        };
        const detail =
          err?.response?.data?.detail ??
          err?.response?.data?.message ??
          err?.message ??
          "Unknown error";
        failures.push({
          index,
          error,
          id: failedId,
          message: typeof detail === "string" ? detail : "Unknown error",
        });
      }

      if (index < orders.length - 1) {
        await sleep(2000);
      }
    }

    if (failures.length === 0) {
      toast.success("All orders created successfully!", { id: toastId });
      clearFormState();
      return;
    }

    const failedDetails = failures
      .map((item) => {
        if (item.id) {
          return `${item.id}: ${item.message ?? "Unknown error"}`;
        }
        return `Row ${item.index + 1}: ${item.message ?? "Unknown error"}`;
      })
      .join("\n");

    toast.error("Some orders failed to create", {
      id: toastId,
      description: `${successCount}/${orders.length} created. ${failures.length} failed.\n${failedDetails}`,
    });
    clearFormState();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) clearFormState();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Import</Button>
      </DialogTrigger>

      <DialogContent className="w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Orders</DialogTitle>
        </DialogHeader>
        <ExportExampleOrderExcelButton />

        {/* CHOOSE CHANNEL FIRST */}
        <div className="mt-2">
          <Popover open={openChannel} onOpenChange={setOpenChannel}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                className="w-full justify-between font-normal"
              >
                {channel
                  ? CHANNEL_OPTIONS.find((item) => item.value === channel)
                      ?.label
                  : "Select channel"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              usePortal={false}
              className="w-[var(--radix-popover-trigger-width)] p-0 pointer-events-auto z-[120]"
            >
              <Command>
                <CommandInput placeholder="Search channel..." />
                <CommandEmpty>No channel found.</CommandEmpty>
                <CommandGroup className="max-h-56 overflow-y-auto">
                  {sortedChannelOptions.map((item) => (
                    <CommandItem
                      key={item.value}
                      value={`${item.label} ${item.value}`}
                      onSelect={() => {
                        setChannel(item.value);
                        setOpenChannel(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          channel === item.value ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {item.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* DROPZONE */}
        <div
          {...getRootProps()}
          className={`mt-4 flex h-40 items-center justify-center rounded-lg border-2 border-dashed ${
            !channel ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          } ${
            isDragActive ? "border-primary bg-primary/10" : "border-gray-300"
          }`}
        >
          <input {...getInputProps()} />
          {!file ? (
            <p className="text-sm text-gray-500">
              {channel ? "Drop or click to upload" : "Select channel first"}
            </p>
          ) : (
            <div className="flex gap-2">
              <File />
              <p className="text-sm text-gray-600">{file.name}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={!orders.length} onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderImport;
