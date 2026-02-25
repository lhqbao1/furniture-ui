"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import { File } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { createManualCheckOut } from "@/features/checkout/api";
import { ManualCreateOrderFormValues } from "@/lib/schema/manual-checkout";
import ExportExampleOrderExcelButton from "./export-example-button";

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
  // thêm sau nếu cần:
  praktiker: null,
  check24: null,
  amazon: null,
  prestige: null,
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

const toNumberOrNull = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toRequiredString = (value: unknown, fallback = ""): string =>
  toTrimmedStringOrNull(value) ?? fallback;

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

    id_provider: toTrimmedStringOrNull(row["id_provider"]),
    quantity: Number(row["quantity"] ?? 1),
    title: toStringOrNull(row["title"]),
    sku: toStringOrNull(row["sku"]),
    final_price: Number(row["final_price"] ?? 1),
    tax: computedTax ?? 0,
    status: toStringOrNull(row["status"]) ?? "PAID",
    payment_term: toNumberOrNull(row["payment_term"]),
    total_shipping: toNumberOrDefault(row["total_shipping"], 35.95),
    vat: Number(row["vat"]),
    carrier: toStringOrNull(row["carrier"]),
  };
};

const OrderImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [channel, setChannel] = useState<string | null>(null);
  const [orders, setOrders] = useState<GroupedOrder[]>([]);
  const [open, setOpen] = useState(false);

  const clearFormState = () => {
    setFile(null);
    setOrders([]);
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

      const grouped: Record<string, GroupedOrder> = {};

      normalized.forEach((row) => {
        const id = String(row.marketplace_order_id);

        if (!grouped[id]) {
          const {
            sku,
            quantity,
            title,
            id_provider,
            final_price,
            vat,
            ...rest
          } = row;
          grouped[id] = {
            ...rest,
            items: [],
          };
        }

        grouped[id].items.push({
          quantity: row.quantity,
          id_provider: row.id_provider ?? "",
          title: row.title ?? "",
          sku: row.sku ?? "",
          final_price: row.final_price * (1 + row.vat),
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
      } catch (error: any) {
        console.error("Failed to create order", { index, error });
        const failedId = (orders[index] as { marketplace_order_id?: string })
          ?.marketplace_order_id;
        const detail =
          error?.response?.data?.detail ??
          error?.response?.data?.message ??
          error?.message ??
          "Unknown error";
        failures.push({
          index,
          error,
          id: failedId,
          message: typeof detail === "string" ? detail : "Unknown error",
        });
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
          <Select
            onValueChange={setChannel}
            defaultValue={channel ?? undefined}
          >
            <SelectTrigger className="border" placeholderColor>
              <SelectValue placeholder="Select channel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="amazon">Amazon</SelectItem>
              <SelectItem value="inprodius">Inprodius</SelectItem>
              <SelectItem value="netto">Netto</SelectItem>
              <SelectItem value="freakout">FreakOut</SelectItem>
              <SelectItem value="praktiker">Praktiker</SelectItem>
              <SelectItem value="norma">Norma24</SelectItem>
              <SelectItem value="check24">Check24</SelectItem>
              <SelectItem value="bauhaus">Bauhaus</SelectItem>
              <SelectItem value="euro-tops">Euro Tops</SelectItem>
              <SelectItem value="XXXLUTZ">XXXLUTZ</SelectItem>
              <SelectItem value="prestige">Prestige Home</SelectItem>
            </SelectContent>
          </Select>
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
