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
import { File, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { useImportProductInventory } from "@/features/file/hook";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { title } from "process";
import { createManualCheckOut } from "@/features/checkout/api";

const PRESET_BY_MARKETPLACE: Record<string, any> = {
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
  // thêm sau nếu cần:
  praktiker: null,
  norma: null,
  amazon: null,
  prestige: null,
};

const normalize = (row: any, preset: any, channel: string) => {
  const hasCompany = preset?.company_name || row["company_name"];

  return {
    email: row["email"]?.trim() ?? "guest",
    tax_id: preset?.tax_id ?? row["tax_id"] ?? null,
    first_name: row["first_name"] ?? null,
    last_name: row["last_name"]?.trim() ?? null,
    company_name: preset?.company_name
      ? preset.company_name
      : row["company_name"] || null,

    address: row["address"]?.trim() || null,
    additional_address: row["additional_address"]?.trim() || null,
    recipient_name: row["recipient_name"] || null,
    city: row["city"] || null,
    country: row["country"] || null,
    phone: row["phone"] || null,
    postal_code: row["postal_code"]?.toString().trim() || null,
    email_shipping: row["email_shipping"] || null,

    invoice_address: preset?.invoice_address ?? row["invoice_address"] ?? null,
    invoice_recipient_name:
      [row["first_name"], row["last_name"]].filter(Boolean).join(" ") ?? null,
    invoice_phone: row["invoice_phone"] || null,
    email_invoice: row["email"]?.trim() ?? null,
    invoice_city: preset?.invoice_city ?? row["invoice_city"] ?? null,
    invoice_postal_code:
      preset?.invoice_postal_code ?? row["invoice_postal_code"] ?? null,
    invoice_country: preset?.invoice_country ?? row["invoice_country"] ?? null,

    from_marketplace: channel.toLowerCase().trim(),
    marketplace_order_id:
      row["marketplace_order_id"]?.toString().trim() || null,

    id_provider: row["id_provider"]?.toString().trim() || null,
    quantity: Number(row["quantity"] ?? 1),
    title: row["title"] || null,
    sku: row["sku"] || null,
    final_price: Number(row["final_price"] ?? 1),
    tax:
      row["country"] === "DE"
        ? 19
        : row["country"] === "AT"
          ? hasCompany
            ? 0
            : 20
          : null,
    status: row["status"] || null,
    payment_term: row["payment_term"] || null,
    total_shipping: row["total_shipping"] || 35.95,
    vat: Number(row["vat"]),
  };
};

const OrderImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [channel, setChannel] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const importProductInventoryMutation = useImportProductInventory();

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

      const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      const preset = PRESET_BY_MARKETPLACE[channel] ?? null;

      const normalized = json.map((row: any) =>
        normalize(row, preset, channel),
      );

      // ---- thêm phần này ---- //
      const grouped: Record<string, any> = {};

      normalized.forEach((row) => {
        const id = row.marketplace_order_id;

        if (!grouped[id]) {
          grouped[id] = {
            ...row,
            items: [],
          };
        }

        grouped[id].items.push({
          quantity: row.quantity,
          id_provider: row.id_provider,
          title: row.title,
          sku: row.sku,
          final_price: row.final_price * (1 + row.vat),
        });

        delete grouped[id].sku;
        delete grouped[id].quantity;
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

    try {
      for (const order of orders) {
        await createManualCheckOut(order);
      }

      toast.success("All orders created successfully!", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to create one or more orders", { id: toastId });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Import</Button>
      </DialogTrigger>

      <DialogContent className="w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Orders</DialogTitle>
        </DialogHeader>

        {/* CHOOSE CHANNEL FIRST */}
        <div className="mt-2">
          <Select
            onValueChange={setChannel}
            defaultValue={channel ?? undefined}
          >
            <SelectTrigger className="border">
              <SelectValue placeholder="Select marketplace" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="amazon">Amazon</SelectItem>
              <SelectItem value="inprodius">Inprodius</SelectItem>
              <SelectItem value="netto">Netto</SelectItem>
              <SelectItem value="freakout">FreakOut</SelectItem>
              <SelectItem value="praktiker">Praktiker</SelectItem>
              <SelectItem value="norma">Norma24</SelectItem>
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
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            disabled={!orders.length}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderImport;
