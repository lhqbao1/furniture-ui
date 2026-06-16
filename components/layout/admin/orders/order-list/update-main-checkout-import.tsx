"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  UpdateMainCheckoutInvoiceAddressPayload,
  UpdateMainCheckoutItemPricePayload,
  UpdateMainCheckoutPayload,
} from "@/features/checkout/api";
import { useUpdateMainCheckout } from "@/features/checkout/hook";

type ParsedUpdateOrderRow = {
  rowNumber: number;
  main_checkout_id: string;
  payload: UpdateMainCheckoutPayload;
};

type ParseUpdateOrderResult = {
  rows: ParsedUpdateOrderRow[];
  errors: string[];
  skippedRows: number[];
};

type InvoiceAddressKey = keyof UpdateMainCheckoutInvoiceAddressPayload;
type StringPayloadKey = "channel" | "ext_id" | "ext_reference";

const EXCEL_ACCEPT = {
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
  "application/vnd.ms-excel": [".xls"],
} as const;

const STRING_PAYLOAD_FIELDS: StringPayloadKey[] = [
  "channel",
  "ext_id",
  "ext_reference",
];

const INVOICE_ADDRESS_HEADERS: Record<string, InvoiceAddressKey> = {
  invoice_address_address_line: "address_line",
  address_line: "address_line",
  invoice_address_city: "city",
  city: "city",
  invoice_address_country: "country",
  country: "country",
  invoice_address_postal_code: "postal_code",
  postal_code: "postal_code",
  invoice_address_phone_number: "phone_number",
  phone_number: "phone_number",
  invoice_address_recipient_name: "recipient_name",
  recipient_name: "recipient_name",
  invoice_address_email: "email",
  email: "email",
  invoice_address_company_name: "company_name",
  company_name: "company_name",
  invoice_address_tax_id: "tax_id",
  tax_id: "tax_id",
};

const ITEM_PRICE_HEADER_REGEX =
  /^item_prices\[(\d+)\]_(id_provider|price)$/;

const normalizeHeader = (value: unknown): string =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s.-]+/g, "_");

const hasCellValue = (value: unknown): boolean =>
  String(value ?? "").trim().length > 0;

const getStringCell = (value: unknown): string =>
  String(value ?? "").trim();

const parseNumberCell = (value: unknown): number | null => {
  const rawValue = getStringCell(value);
  if (!rawValue) return null;

  const withoutCurrency = rawValue.replace(/[€\s]/g, "");
  const lastCommaIndex = withoutCurrency.lastIndexOf(",");
  const lastDotIndex = withoutCurrency.lastIndexOf(".");
  const normalized =
    lastCommaIndex > lastDotIndex
      ? withoutCurrency.replace(/\./g, "").replace(",", ".")
      : withoutCurrency.replace(/,/g, "");
  const numberValue = Number(normalized);

  return Number.isFinite(numberValue) ? numberValue : null;
};

const getErrorMessage = (error: unknown): string => {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;

  if (typeof error === "object") {
    const err = error as {
      response?: { data?: { detail?: unknown; message?: unknown } };
      message?: unknown;
    };

    const detail =
      err.response?.data?.detail ?? err.response?.data?.message ?? err.message;

    if (typeof detail === "string") return detail;
  }

  return "Unknown error";
};

const isPayloadEmpty = (payload: UpdateMainCheckoutPayload): boolean =>
  Object.keys(payload).length === 0;

const parseUpdateOrderRows = (rows: unknown[][]): ParseUpdateOrderResult => {
  if (rows.length === 0) {
    return {
      rows: [],
      errors: ["The file is empty."],
      skippedRows: [],
    };
  }

  const headers = rows[0].map(normalizeHeader);
  const hasMainCheckoutId = headers.includes("main_checkout_id");

  if (!hasMainCheckoutId) {
    return {
      rows: [],
      errors: ["Missing required column: main_checkout_id."],
      skippedRows: [],
    };
  }

  const parsedRows: ParsedUpdateOrderRow[] = [];
  const errors: string[] = [];
  const skippedRows: number[] = [];

  rows.slice(1).forEach((row, index) => {
    const rowNumber = index + 2;
    const rowByHeader = new Map<string, unknown>();

    headers.forEach((header, headerIndex) => {
      if (!header) return;
      rowByHeader.set(header, row?.[headerIndex]);
    });

    const hasAnyValue = Array.from(rowByHeader.values()).some(hasCellValue);
    if (!hasAnyValue) return;

    const mainCheckoutId = getStringCell(rowByHeader.get("main_checkout_id"));

    if (!mainCheckoutId) {
      errors.push(`Row ${rowNumber}: main_checkout_id is required.`);
      return;
    }

    const payload: UpdateMainCheckoutPayload = {};
    const rowErrors: string[] = [];

    STRING_PAYLOAD_FIELDS.forEach((field) => {
      const value = getStringCell(rowByHeader.get(field));
      if (value) payload[field] = value;
    });

    const shippingAmountCell = rowByHeader.get("shipping_amount");
    if (hasCellValue(shippingAmountCell)) {
      const shippingAmount = parseNumberCell(shippingAmountCell);

      if (shippingAmount === null) {
        rowErrors.push("shipping_amount must be a number.");
      } else {
        payload.shipping_amount = shippingAmount;
      }
    }

    const invoiceAddress: Partial<UpdateMainCheckoutInvoiceAddressPayload> = {};

    rowByHeader.forEach((value, header) => {
      const addressKey = INVOICE_ADDRESS_HEADERS[header];
      if (!addressKey || !hasCellValue(value)) return;

      invoiceAddress[addressKey] = getStringCell(value);
    });

    if (Object.keys(invoiceAddress).length > 0) {
      payload.invoice_address = invoiceAddress;
    }

    const itemDrafts = new Map<
      number,
      Partial<UpdateMainCheckoutItemPricePayload>
    >();

    rowByHeader.forEach((value, header) => {
      if (!hasCellValue(value)) return;

      const match = ITEM_PRICE_HEADER_REGEX.exec(header);
      if (!match) return;

      const itemIndex = Number(match[1]);
      const itemField = match[2] as keyof UpdateMainCheckoutItemPricePayload;
      const draft = itemDrafts.get(itemIndex) ?? {};

      if (itemField === "price") {
        const price = parseNumberCell(value);

        if (price === null) {
          rowErrors.push(`item_prices[${itemIndex}].price must be a number.`);
        } else {
          draft.price = price;
        }
      } else {
        draft.id_provider = getStringCell(value);
      }

      itemDrafts.set(itemIndex, draft);
    });

    const itemPrices: UpdateMainCheckoutItemPricePayload[] = [];

    Array.from(itemDrafts.entries())
      .sort(([leftIndex], [rightIndex]) => leftIndex - rightIndex)
      .forEach(([itemIndex, draft]) => {
        if (!draft.id_provider || typeof draft.price !== "number") {
          rowErrors.push(
            `item_prices[${itemIndex}] requires both id_provider and price.`,
          );
          return;
        }

        itemPrices.push({
          id_provider: draft.id_provider,
          price: draft.price,
        });
      });

    if (itemPrices.length > 0) {
      payload.item_prices = itemPrices;
    }

    if (rowErrors.length > 0) {
      errors.push(
        ...rowErrors.map((message) => `Row ${rowNumber}: ${message}`),
      );
      return;
    }

    if (isPayloadEmpty(payload)) {
      skippedRows.push(rowNumber);
      return;
    }

    parsedRows.push({
      rowNumber,
      main_checkout_id: mainCheckoutId,
      payload,
    });
  });

  return { rows: parsedRows, errors, skippedRows };
};

const readUpdateOrderRowsFromFile = (
  file: File,
): Promise<ParseUpdateOrderResult> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = event.target?.result;

        if (!data) {
          reject(new Error("Cannot read file data"));
          return;
        }

        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
          reject(new Error("Cannot find worksheet"));
          return;
        }

        const rows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
          header: 1,
          raw: false,
          defval: "",
        });

        resolve(parseUpdateOrderRows(rows));
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsBinaryString(file);
  });

const UpdateMainCheckoutImport = () => {
  const updateMainCheckoutMutation = useUpdateMainCheckout();

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedUpdateOrderRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [skippedRows, setSkippedRows] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetState = () => {
    setFile(null);
    setParsedRows([]);
    setParseErrors([]);
    setSkippedRows([]);
    setIsSubmitting(false);
  };

  const handleDownloadExample = () => {
    const headers = [
      "main_checkout_id",
      "channel",
      "ext_id",
      "ext_reference",
      "invoice_address.address_line",
      "invoice_address.city",
      "invoice_address.country",
      "invoice_address.postal_code",
      "invoice_address.phone_number",
      "invoice_address.recipient_name",
      "invoice_address.email",
      "invoice_address.company_name",
      "invoice_address.tax_id",
      "shipping_amount",
      "item_prices[0].id_provider",
      "item_prices[0].price",
      "item_prices[1].id_provider",
      "item_prices[1].price",
    ];
    const exampleRows = [
      [
        "19eba0e0-7b90-4000-8e06-6167d4e6b401",
        "netto",
        "6958883",
        "REF-6958883",
        "Musterstraße 1",
        "Berlin",
        "DE",
        "10115",
        "+49123456789",
        "Max Mustermann",
        "max@example.com",
        "Muster GmbH",
        "DE123456789",
        35.95,
        "1002613",
        299,
        "1002614",
        19.99,
      ],
      [
        "29eba0e0-7b90-4000-8e06-6167d4e6b402",
        "",
        "",
        "ONLY-REFERENCE-UPDATED",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "1001298",
        369,
        "",
        "",
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...exampleRows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Update orders");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "update-orders-example.xlsx",
    );
  };

  const onDrop = async (acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setParsedRows([]);
    setParseErrors([]);
    setSkippedRows([]);

    try {
      const parsed = await readUpdateOrderRowsFromFile(uploadedFile);

      setParsedRows(parsed.rows);
      setParseErrors(parsed.errors);
      setSkippedRows(parsed.skippedRows);

      if (parsed.errors.length > 0) {
        toast.error("Invalid rows in file", {
          description: parsed.errors.slice(0, 3).join("\n"),
        });
        return;
      }

      if (parsed.rows.length === 0) {
        toast.error("No valid rows found");
        return;
      }

      toast.success(`Parsed ${parsed.rows.length} rows`);
    } catch (error) {
      setParsedRows([]);
      setParseErrors([getErrorMessage(error)]);
      toast.error("Failed to parse Excel file", {
        description: getErrorMessage(error),
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: EXCEL_ACCEPT,
    multiple: false,
    disabled: isSubmitting,
    onDropRejected: () => {
      toast.error("Only .xls or .xlsx files are allowed");
    },
  });

  const handleSubmit = async () => {
    if (parsedRows.length === 0) {
      toast.error("No data to submit");
      return;
    }

    if (parseErrors.length > 0) {
      toast.error("Please fix invalid rows before submitting");
      return;
    }

    const toastId = toast.loading(`Updating ${parsedRows.length} orders...`);
    const failedRows: string[] = [];
    let successCount = 0;

    try {
      setIsSubmitting(true);

      for (const row of parsedRows) {
        try {
          await updateMainCheckoutMutation.mutateAsync({
            main_checkout_id: row.main_checkout_id,
            payload: row.payload,
          });
          successCount += 1;
        } catch (error) {
          failedRows.push(`Row ${row.rowNumber}: ${getErrorMessage(error)}`);
        }
      }

      if (failedRows.length > 0) {
        toast.error(`Updated ${successCount}/${parsedRows.length} orders`, {
          id: toastId,
          description: failedRows.slice(0, 5).join("\n"),
        });
        return;
      }

      toast.success("Orders updated successfully", { id: toastId });
      setOpen(false);
      resetState();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Update orders</Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] w-[720px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Orders</DialogTitle>
        </DialogHeader>

        <Button
          type="button"
          variant="secondary"
          onClick={handleDownloadExample}
          className="w-fit"
        >
          Download sample file
        </Button>

        <div className="space-y-1 text-sm text-muted-foreground">
          <p>
            Required column:{" "}
            <span className="font-medium text-slate-900">
              main_checkout_id
            </span>
            .
          </p>
          <p>
            Only non-empty cells are sent to the API. Leave a cell blank to skip
            that field.
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`mt-2 flex h-40 items-center justify-center rounded-lg border-2 border-dashed ${
            isSubmitting ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          } ${
            isDragActive ? "border-primary bg-primary/10" : "border-gray-300"
          }`}
        >
          <input {...getInputProps()} />

          {!file ? (
            <p className="text-sm text-gray-500">
              Drop or click to upload (.xls/.xlsx)
            </p>
          ) : (
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              <p className="text-sm text-gray-600">{file.name}</p>
            </div>
          )}
        </div>

        <div className="space-y-2 text-sm">
          <div className="text-muted-foreground">
            {parsedRows.length > 0
              ? `${parsedRows.length} rows ready`
              : "No rows parsed yet"}
            {skippedRows.length > 0
              ? ` · skipped empty payload rows: ${skippedRows.join(", ")}`
              : ""}
          </div>

          {parseErrors.length > 0 ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">
              <div className="font-medium">Rows need attention</div>
              <div className="mt-1 whitespace-pre-line">
                {parseErrors.slice(0, 6).join("\n")}
                {parseErrors.length > 6
                  ? `\n...and ${parseErrors.length - 6} more`
                  : ""}
              </div>
            </div>
          ) : null}
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting || parsedRows.length === 0 || parseErrors.length > 0
            }
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Submit"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateMainCheckoutImport;
