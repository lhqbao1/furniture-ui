"use client";

import React, { useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Check, ChevronsUpDown, FileSpreadsheet, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";
import { CHANEL_OPTIONS } from "./filter/filter-order-chanel";
import {
  getAllCheckOutMain,
  UpdateBulkExtInvoiceIdPayload,
  UpdateBulkExtInvoiceIdResponse,
  UpdateBulkExtInvoiceIdPayloadItem,
} from "@/features/checkout/api";
import { useUpdateBulkExtInvoiceId } from "@/features/checkout/hook";
import { CheckOutMain } from "@/types/checkout";

type ConfirmMode = "excel" | "input";

interface ConfirmInvoicedImportProps {
  selectedOrders?: CheckOutMain[];
}

const EXCEL_ACCEPT = {
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
    ".xlsx",
  ],
  "application/vnd.ms-excel": [".xls"],
} as const;

const normalizeHeader = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s.-]+/g, "_");

const normalizeOrderId = (value: unknown): string =>
  String(value ?? "").trim();

const toCanonicalOrderId = (value: unknown): string => {
  const normalized = normalizeOrderId(value);
  if (!normalized) return "";

  const withoutLeadingZeros = normalized.replace(/^0+/, "");
  return withoutLeadingZeros || "0";
};

const hasExpectedHeaders = (firstCell: string, secondCell: string): boolean => {
  const first = normalizeHeader(firstCell);
  const second = normalizeHeader(secondCell);

  return first === "ext_id" && second === "ext_invoice_id";
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

const parseInvoiceRows = (
  rows: unknown[][],
): {
  payload: UpdateBulkExtInvoiceIdPayload;
  skippedRows: number[];
} => {
  if (rows.length === 0) {
    return { payload: [], skippedRows: [] };
  }

  const firstCell = String(rows[0]?.[0] ?? "").trim();
  const secondCell = String(rows[0]?.[1] ?? "").trim();
  const startsWithHeader = hasExpectedHeaders(firstCell, secondCell);

  const workingRows = startsWithHeader ? rows.slice(1) : rows;
  const baseLineNumber = startsWithHeader ? 2 : 1;

  const payload: UpdateBulkExtInvoiceIdPayloadItem[] = [];
  const skippedRows: number[] = [];

  workingRows.forEach((row, index) => {
    const extId = String(row?.[0] ?? "").trim();
    const extInvoiceId = String(row?.[1] ?? "").trim();
    const hasAnyValue = extId.length > 0 || extInvoiceId.length > 0;

    if (!hasAnyValue) return;

    if (!extId || !extInvoiceId) {
      skippedRows.push(baseLineNumber + index);
      return;
    }

    payload.push({
      ext_id: extId,
      ext_invoice_id: extInvoiceId,
    });
  });

  return { payload, skippedRows };
};

const readInvoicePayloadFromFile = (
  file: File,
): Promise<{
  payload: UpdateBulkExtInvoiceIdPayload;
  skippedRows: number[];
}> =>
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

        resolve(parseInvoiceRows(rows));
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsBinaryString(file);
  });

const ConfirmInvoicedImport = ({
  selectedOrders = [],
}: ConfirmInvoicedImportProps) => {
  const updateBulkExtInvoiceIdMutation = useUpdateBulkExtInvoiceId();

  const [open, setOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<ConfirmMode>("excel");
  const [openChannel, setOpenChannel] = useState(false);
  const [channel, setChannel] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [payload, setPayload] = useState<UpdateBulkExtInvoiceIdPayload>([]);
  const [invoiceId, setInvoiceId] = useState("");
  const [isPreparingSubmit, setIsPreparingSubmit] = useState(false);

  const extractInvalidExtIds = (
    response: UpdateBulkExtInvoiceIdResponse,
  ): string[] => {
    if (!Array.isArray(response)) return [];

    return response
      .map((item) => String(item?.ext_id ?? "").trim())
      .filter((extId): extId is string => Boolean(extId));
  };

  const sortedChannelOptions = useMemo(
    () =>
      [...CHANEL_OPTIONS].sort((a, b) =>
        a.label.localeCompare(b.label, "de", { sensitivity: "base" }),
      ),
    [],
  );

  const handleDownloadExample = () => {
    const headers = ["ext_id", "ext_invoice_id"];
    const rows = [
      ["12345678", "RE290526"],
      ["87654321", "RE290526"],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Example");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    saveAs(
      new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "confirm-invoiced-example.xlsx",
    );
  };

  const resetState = () => {
    setConfirmMode("excel");
    setFile(null);
    setPayload([]);
    setInvoiceId("");
    setChannel(null);
    setOpenChannel(false);
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (!channel) {
      toast.error("Please select channel first");
      return;
    }

    const uploadedFile = acceptedFiles[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    try {
      const parsed = await readInvoicePayloadFromFile(uploadedFile);

      if (parsed.skippedRows.length > 0) {
        setPayload([]);
        toast.error("Invalid rows in file", {
          description: `Rows missing ext_id/ext_invoice_id: ${parsed.skippedRows.join(", ")}`,
        });
        return;
      }

      if (parsed.payload.length === 0) {
        setPayload([]);
        toast.error("No valid rows found", {
          description: "File must contain 2 columns: ext_id and ext_invoice_id",
        });
        return;
      }

      setPayload(parsed.payload);
      toast.success(`Parsed ${parsed.payload.length} rows`);
    } catch (error) {
      setPayload([]);
      toast.error("Failed to parse Excel file", {
        description: getErrorMessage(error),
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: EXCEL_ACCEPT,
    multiple: false,
    disabled:
      !channel || updateBulkExtInvoiceIdMutation.isPending || isPreparingSubmit,
    onDropRejected: () => {
      toast.error("Only .xls or .xlsx files are allowed");
    },
  });

  const handleSubmit = async () => {
    if (!channel) {
      toast.error("Please select channel first");
      return;
    }

    if (payload.length === 0) {
      toast.error("No data to submit");
      return;
    }

    const toastId = toast.loading(`Confirming ${payload.length} invoices...`);

    try {
      setIsPreparingSubmit(true);

      const checkouts = await getAllCheckOutMain({
        channel: [channel],
      });

      const checkoutByOrderId = new Map<string, string>();
      const checkoutByCanonicalOrderId = new Map<string, string>();

      checkouts.forEach((checkout) => {
        const rawOrderId = normalizeOrderId(checkout.marketplace_order_id);
        const canonicalOrderId = toCanonicalOrderId(rawOrderId);
        const existingExtInvoiceId = normalizeOrderId(checkout.ext_invoice_id);

        if (rawOrderId && !checkoutByOrderId.has(rawOrderId)) {
          checkoutByOrderId.set(rawOrderId, existingExtInvoiceId);
        }

        if (
          canonicalOrderId &&
          !checkoutByCanonicalOrderId.has(canonicalOrderId)
        ) {
          checkoutByCanonicalOrderId.set(canonicalOrderId, existingExtInvoiceId);
        }
      });

      const alreadyInvoicedExtIdsSet = new Set<string>();

      const filteredPayload = payload.filter((item) => {
        const rawExtId = normalizeOrderId(item.ext_id);
        const canonicalExtId = toCanonicalOrderId(rawExtId);

        const existingExtInvoiceId =
          checkoutByOrderId.get(rawExtId) ??
          checkoutByCanonicalOrderId.get(canonicalExtId) ??
          "";

        if (existingExtInvoiceId) {
          alreadyInvoicedExtIdsSet.add(rawExtId);
          return false;
        }

        return true;
      });

      const alreadyInvoicedExtIds = Array.from(alreadyInvoicedExtIdsSet);

      if (alreadyInvoicedExtIds.length > 0) {
        toast.error("These marketplace order IDs are already invoiced.", {
          description: alreadyInvoicedExtIds.join(", "),
        });
      }

      if (filteredPayload.length === 0) {
        toast.error("No rows to submit after filtering invoiced orders.", {
          id: toastId,
        });
        return;
      }

      const response =
        await updateBulkExtInvoiceIdMutation.mutateAsync(filteredPayload);
      const invalidExtIds = extractInvalidExtIds(response);

      if (invalidExtIds.length > 0) {
        toast.error("These marketplace order IDs do not exist in the system.", {
          id: toastId,
          description: invalidExtIds.join(", "),
        });
        return;
      }

      toast.success("Invoices confirmed successfully", { id: toastId });
      setOpen(false);
      resetState();
    } catch (error) {
      toast.error("Failed to confirm invoices", {
        id: toastId,
        description: getErrorMessage(error),
      });
    } finally {
      setIsPreparingSubmit(false);
    }
  };

  const handleSubmitInput = async () => {
    const normalizedInvoiceId = invoiceId.trim();

    if (selectedOrders.length === 0) {
      toast.error("Please select at least one order first");
      return;
    }

    if (!normalizedInvoiceId) {
      toast.error("Please input invoice ID");
      return;
    }

    const missingExternalId = selectedOrders.filter(
      (order) => !normalizeOrderId(order.marketplace_order_id),
    );

    if (missingExternalId.length > 0) {
      toast.error("Some selected orders are missing marketplace order ID.", {
        description: missingExternalId
          .map((order) => order.checkout_code || order.id)
          .join(", "),
      });
      return;
    }

    const alreadyInvoicedOrders = selectedOrders.filter((order) =>
      Boolean(normalizeOrderId(order.ext_invoice_id)),
    );

    if (alreadyInvoicedOrders.length > 0) {
      toast.error("These selected orders are already invoiced.", {
        description: alreadyInvoicedOrders
          .map((order) => order.marketplace_order_id || order.checkout_code)
          .join(", "),
      });
    }

    const inputPayload = selectedOrders
      .filter((order) => !normalizeOrderId(order.ext_invoice_id))
      .map((order) => ({
        ext_id: normalizeOrderId(order.marketplace_order_id),
        ext_invoice_id: normalizedInvoiceId,
      }));

    if (inputPayload.length === 0) {
      toast.error("No selected orders to confirm after filtering invoiced orders.");
      return;
    }

    const toastId = toast.loading(
      `Confirming ${inputPayload.length} invoices...`,
    );

    try {
      const response =
        await updateBulkExtInvoiceIdMutation.mutateAsync(inputPayload);
      const invalidExtIds = extractInvalidExtIds(response);

      if (invalidExtIds.length > 0) {
        toast.error("These marketplace order IDs do not exist in the system.", {
          id: toastId,
          description: invalidExtIds.join(", "),
        });
        return;
      }

      toast.success("Invoices confirmed successfully", { id: toastId });
      setOpen(false);
      resetState();
    } catch (error) {
      toast.error("Failed to confirm invoices", {
        id: toastId,
        description: getErrorMessage(error),
      });
    }
  };

  const isSubmitting =
    updateBulkExtInvoiceIdMutation.isPending || isPreparingSubmit;
  const isExcelMode = confirmMode === "excel";
  const isInputMode = confirmMode === "input";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">Confirm invoiced</Button>
      </DialogTrigger>

      <DialogContent className="w-[600px]">
        <DialogHeader>
          <DialogTitle>Confirm Invoiced</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-900">
            Confirmation method
          </div>
          <RadioGroup
            value={confirmMode}
            onValueChange={(value) => setConfirmMode(value as ConfirmMode)}
            className="grid gap-2 sm:grid-cols-2"
          >
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm hover:bg-slate-50">
              <RadioGroupItem value="excel" />
              Confirm via Excel file
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm hover:bg-slate-50">
              <RadioGroupItem value="input" />
              Confirm selected orders
            </label>
          </RadioGroup>
        </div>

        {isExcelMode ? (
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={handleDownloadExample}
              className="w-fit"
            >
              Download sample file
            </Button>

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Required file format: 2 columns (`ext_id`, `ext_invoice_id`).
              </p>

              <Popover open={openChannel} onOpenChange={setOpenChannel}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between font-normal"
                  >
                    {channel
                      ? CHANEL_OPTIONS.find((item) => item.key === channel)
                          ?.label
                      : "Select channel"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  usePortal={false}
                  className="z-[120] w-[var(--radix-popover-trigger-width)] p-0 pointer-events-auto"
                >
                  <Command>
                    <CommandInput placeholder="Search channel..." />
                    <CommandEmpty>No channel found.</CommandEmpty>
                    <CommandGroup className="max-h-56 overflow-y-auto">
                      {sortedChannelOptions.map((item) => (
                        <CommandItem
                          key={item.key}
                          value={`${item.label} ${item.key}`}
                          onSelect={() => {
                            setChannel(item.key);
                            setFile(null);
                            setPayload([]);
                            setOpenChannel(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              channel === item.key
                                ? "opacity-100"
                                : "opacity-0",
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

            <div
              {...getRootProps()}
              className={`mt-2 flex h-40 items-center justify-center rounded-lg border-2 border-dashed ${
                !channel || updateBulkExtInvoiceIdMutation.isPending
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer"
              } ${
                isDragActive
                  ? "border-primary bg-primary/10"
                  : "border-gray-300"
              }`}
            >
              <input {...getInputProps()} />

              {!file ? (
                <p className="text-sm text-gray-500">
                  {channel
                    ? "Drop or click to upload (.xls/.xlsx)"
                    : "Select channel first"}
                </p>
              ) : (
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  <p className="text-sm text-gray-600">{file.name}</p>
                </div>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              {payload.length > 0
                ? `${payload.length} rows ready`
                : "No rows parsed yet"}
            </div>
          </>
        ) : null}

        {isInputMode ? (
          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="text-sm text-muted-foreground">
              Selected orders:{" "}
              <span className="font-medium text-slate-900">
                {selectedOrders.length}
              </span>
            </div>
            <Input
              value={invoiceId}
              onChange={(event) => setInvoiceId(event.target.value)}
              placeholder="Input invoice ID"
              disabled={isSubmitting}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                void handleSubmitInput();
              }}
            />
            <p className="text-xs text-muted-foreground">
              This invoice ID will be applied to all selected orders.
            </p>
          </div>
        ) : null}

        <div className="mt-2 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={isExcelMode ? handleSubmit : handleSubmitInput}
            disabled={
              isSubmitting ||
              (isExcelMode && payload.length === 0) ||
              (isInputMode &&
                (!invoiceId.trim() || selectedOrders.length === 0))
            }
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Confirm"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmInvoicedImport;
