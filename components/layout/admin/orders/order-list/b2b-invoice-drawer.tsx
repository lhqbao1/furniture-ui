"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Trash2, CalendarIcon, X } from "lucide-react";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { B2BInvoicePDFFile } from "@/components/layout/pdf/b2b-invoice-pdf-file";
import { CheckOutMain } from "@/types/checkout";
import { getStatusStyle } from "./status-styles";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateProductVAT } from "@/lib/caculate-vat";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  B2BInvoicePartyInfo,
  normalizeB2BInvoicePartyInfo,
  resolveB2BInvoicePartyInfo,
} from "@/lib/b2b-invoice";

interface B2BInvoiceDrawerProps {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  marketplace: string;
  selectedOrders: CheckOutMain[];
}

type InvoiceExportFormat = "csv" | "xlsx" | "pdf";

const EXPORT_LABEL_BY_FORMAT: Record<InvoiceExportFormat, string> = {
  csv: "CSV",
  xlsx: "XLSX",
  pdf: "PDF",
};

const DEFAULT_INVOICE_INTRO = `Sehr geehrte Damen und Herren,

vielen Dank für Ihren Auftrag und das damit verbundene Vertrauen!
Hiermit stelle ich Ihnen die folgenden Leistungen in Rechnung:`;

const DEFAULT_PAYMENT_NOTE =
  "Bitte überweisen Sie den Rechnungsbetrag unter Angabe der Rechnungsnummer auf das unten angegebene Konto.";

const formatDateDDMMYYYY = (date: Date) =>
  date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatEur = (value: number) =>
  `${value.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;

const formatTaxPercent = (tax: unknown) => {
  if (tax === null || tax === undefined) return "-";

  const formatValue = (value: number) =>
    `${value.toLocaleString("de-DE", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}%`;

  if (typeof tax === "number") {
    if (!Number.isFinite(tax)) return "-";
    const percentageValue = tax > 1 ? tax : tax * 100;
    return formatValue(percentageValue);
  }

  if (typeof tax === "string") {
    const normalized = tax.trim();
    if (!normalized) return "-";

    const cleaned = normalized
      .replace("%", "")
      .replace(",", ".")
      .trim();
    const parsed = Number(cleaned);
    if (!Number.isFinite(parsed)) return "-";

    const percentageValue = parsed > 1 ? parsed : parsed * 100;
    return formatValue(percentageValue);
  }

  return "-";
};

const getCheckoutCartItems = (checkout: CheckOutMain["checkouts"][number] | undefined) => {
  if (!checkout) return [];

  if (Array.isArray(checkout.cart)) {
    return checkout.cart.flatMap((cartItem) => cartItem.items ?? []);
  }

  return checkout.cart?.items ?? [];
};

const resolveRefNumber = ({
  order,
  item,
  itemCount,
}: {
  order: CheckOutMain;
  item?: { bader_id?: string | null } | null;
  itemCount: number;
}) => {
  const normalizedChannel = String(order.from_marketplace ?? "")
    .trim()
    .toLowerCase();
  const isBaderWithMultiItems = normalizedChannel === "bader" && itemCount >= 2;
  const normalizedBaderId = String(item?.bader_id ?? "").trim();

  if (isBaderWithMultiItems && normalizedBaderId) {
    return normalizedBaderId;
  }

  return order.marketplace_order_id || order.checkout_code || order.id || "-";
};

export default function B2BInvoiceDrawer({
  open,
  onOpenChange,
  marketplace,
  selectedOrders,
}: B2BInvoiceDrawerProps) {
  const [invoiceOrders, setInvoiceOrders] =
    useState<CheckOutMain[]>(selectedOrders);
  const [invoiceId, setInvoiceId] = useState("");
  const [invoiceIdError, setInvoiceIdError] = useState(false);
  const [servicePeriod, setServicePeriod] = useState("");
  const [servicePeriodRange, setServicePeriodRange] = useState<
    DateRange | undefined
  >(undefined);
  const [servicePeriodOpen, setServicePeriodOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [paymentTermDays, setPaymentTermDays] = useState("14");
  const [paymentTermDaysError, setPaymentTermDaysError] = useState(false);
  const [skontoPercent, setSkontoPercent] = useState("");
  const [skontoDays, setSkontoDays] = useState("");
  const [skontoError, setSkontoError] = useState<string | null>(null);
  const [invoiceIntro, setInvoiceIntro] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [invoicePartyInfo, setInvoicePartyInfo] = useState<B2BInvoicePartyInfo>(
    () =>
      resolveB2BInvoicePartyInfo({
        marketplace,
        order: selectedOrders[0],
      }),
  );
  const [isInvoicePartyEdited, setIsInvoicePartyEdited] = useState(false);
  const [confirmExportFormat, setConfirmExportFormat] =
    useState<InvoiceExportFormat | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [isInvoiceIntroEdited, setIsInvoiceIntroEdited] = useState(false);
  const [isPaymentNoteEdited, setIsPaymentNoteEdited] = useState(false);
  const wasOpenRef = useRef(false);

  const defaultInvoicePartyInfo = useMemo(
    () =>
      resolveB2BInvoicePartyInfo({
        marketplace,
        order: invoiceOrders[0],
      }),
    [invoiceOrders, marketplace],
  );

  useEffect(() => {
    if (!open) {
      setInvoiceOrders(selectedOrders);
      setIsConfirmDialogOpen(false);
      setConfirmExportFormat(null);
      setIsCreatingInvoice(false);
    }
  }, [selectedOrders, open]);

  useEffect(() => {
    if (servicePeriodRange?.from && servicePeriodRange?.to) {
      setServicePeriod(
        `${format(servicePeriodRange.from, "dd.MM.yyyy")} - ${format(servicePeriodRange.to, "dd.MM.yyyy")}`,
      );
      setServicePeriodOpen(false);
      return;
    }
    if (servicePeriodRange?.from) {
      setServicePeriod(format(servicePeriodRange.from, "dd.MM.yyyy"));
      return;
    }
    setServicePeriod("");
  }, [servicePeriodRange]);

  const invoiceTitleLine = orderNumber.trim()
    ? `Rechnung Nr. ${invoiceId || "XXXXXXXX"} - Ihre Bestellung ${orderNumber.trim()}`
    : `Rechnung Nr. ${invoiceId || "XXXXXXXX"}`;
  const defaultIntroText = `${invoiceTitleLine}\n\n${DEFAULT_INVOICE_INTRO}`;

  const parsedPaymentTermDays = Number(paymentTermDays);
  const safePaymentTermDays =
    Number.isFinite(parsedPaymentTermDays) && parsedPaymentTermDays > 0
      ? Math.floor(parsedPaymentTermDays)
      : 0;
  const computedPaymentDueDate = useMemo(() => {
    const dueDate = new Date();
    dueDate.setHours(0, 0, 0, 0);
    dueDate.setDate(dueDate.getDate() + safePaymentTermDays);
    return formatDateDDMMYYYY(dueDate);
  }, [safePaymentTermDays]);

  const paymentDueDateLine = `Der Rechnungsbetrag ist bis zum ${computedPaymentDueDate} fällig.`;
  const normalizedSkontoPercent = skontoPercent.trim().replace(",", ".");
  const parsedSkontoPercent = Number(normalizedSkontoPercent);
  const parsedSkontoDays = Number(skontoDays);
  const hasSkontoInput = skontoPercent.trim().length > 0 || skontoDays.trim().length > 0;
  const hasValidSkonto =
    Number.isFinite(parsedSkontoPercent) &&
    parsedSkontoPercent > 0 &&
    Number.isFinite(parsedSkontoDays) &&
    parsedSkontoDays > 0;
  const formattedSkontoPercent = hasValidSkonto
    ? parsedSkontoPercent.toLocaleString("de-DE", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    : "";
  const paymentTermLine = hasValidSkonto
    ? `Zahlungsbedingungen: Zahlung innerhalb von ${Math.floor(parsedSkontoDays)} Tagen - ${formattedSkontoPercent}% Skonto, innerhalb von 30 Tagen ab Rechnungseingang ohne Abzüge.`
    : "Zahlungsbedingungen:";
  const defaultPaymentNote = `${paymentTermLine}\n\n${paymentDueDateLine}\n${DEFAULT_PAYMENT_NOTE}`;
  const normalizedInvoicePartyInfo = useMemo(
    () => normalizeB2BInvoicePartyInfo(invoicePartyInfo),
    [invoicePartyInfo],
  );

  const invoiceExportRows = useMemo(() => {
    const invoiceCountry =
      normalizedInvoicePartyInfo.invoice_country.toString().toUpperCase().trim() ||
      "DE";
    const invoiceTaxId = normalizedInvoicePartyInfo.tax_id;

    const rawRows = invoiceOrders.flatMap((order) => {
      const primaryCheckoutItems = getCheckoutCartItems(order.checkouts?.[0]);
      const orderItems = (order.checkouts ?? []).flatMap((checkout) =>
        getCheckoutCartItems(checkout),
      );
      const normalizedChannel = String(order.from_marketplace ?? "")
        .trim()
        .toLowerCase();
      const isBaderWithMultiItems =
        normalizedChannel === "bader" && primaryCheckoutItems.length >= 2;
      const orderShippingGross = Number(order.total_shipping) || 0;

      if (isBaderWithMultiItems) {
        return primaryCheckoutItems.map((item, itemIndex) => {
          const quantity = Number(item?.quantity) || 1;
          const unitGross =
            Number(
              item?.item_price ??
                item?.purchased_products?.final_price ??
                item?.products?.final_price ??
                item?.final_price ??
                0,
            ) || 0;
          const shippingGross = itemIndex === 0 ? orderShippingGross : 0;
          const taxValue =
            item?.purchased_products?.tax ?? item?.products?.tax ?? null;

          const unitVatCalculation = calculateProductVAT(
            unitGross,
            taxValue,
            invoiceCountry,
            invoiceTaxId,
          );
          const shippingVatCalculation = calculateProductVAT(
            shippingGross,
            taxValue,
            invoiceCountry,
            invoiceTaxId,
          );

          const unitNet = Number(unitVatCalculation.net) || 0;
          const rowNet = unitNet * quantity;
          const shippingNet = Number(shippingVatCalculation.net) || 0;

          return {
            "Ref.-Nr .": resolveRefNumber({
              order,
              item,
              itemCount: primaryCheckoutItems.length,
            }),
            Produktname:
              item?.purchased_products?.name ?? item?.products?.name ?? "-",
            Menge: quantity,
            Versand: formatEur(shippingNet),
            "E.-Preis": formatEur(unitNet),
            "USt.": formatTaxPercent(taxValue),
            "G.-Preis": formatEur(rowNet),
          };
        });
      }

      const firstItem = orderItems[0];
      const quantity =
        orderItems.reduce(
          (sum, item) => sum + (Number(item.quantity) || 0),
          0,
        ) || 1;
      const unitGross =
        Number(
          firstItem?.item_price ??
            firstItem?.purchased_products?.final_price ??
            firstItem?.products?.final_price ??
            firstItem?.final_price ??
            0,
        ) || 0;
      const taxValue =
        firstItem?.purchased_products?.tax ?? firstItem?.products?.tax ?? null;

      const unitVatCalculation = calculateProductVAT(
        unitGross,
        taxValue,
        invoiceCountry,
        invoiceTaxId,
      );
      const shippingVatCalculation = calculateProductVAT(
        orderShippingGross,
        taxValue,
        invoiceCountry,
        invoiceTaxId,
      );

      const unitNet = Number(unitVatCalculation.net) || 0;
      const rowNet = unitNet * quantity;
      const shippingNet = Number(shippingVatCalculation.net) || 0;

      return [
        {
          "Ref.-Nr .": resolveRefNumber({
            order,
            item: firstItem,
            itemCount: primaryCheckoutItems.length || orderItems.length,
          }),
          Produktname:
            firstItem?.purchased_products?.name ??
            firstItem?.products?.name ??
            "-",
          Menge: quantity,
          Versand: formatEur(shippingNet),
          "E.-Preis": formatEur(unitNet),
          "USt.": formatTaxPercent(taxValue),
          "G.-Preis": formatEur(rowNet),
        },
      ];
    });

    return rawRows.map((row, index) => ({
      "Pos.": index + 1,
      ...row,
    }));
  }, [invoiceOrders, normalizedInvoicePartyInfo]);

  const validateBeforeCreate = () => {
    if (!invoiceId.trim()) {
      setInvoiceIdError(true);
      toast.error("Missing required field", {
        description: "Invoice ID is required.",
      });
      return false;
    }

    if (
      !paymentTermDays.trim() ||
      Number(paymentTermDays) <= 0 ||
      Number.isNaN(Number(paymentTermDays))
    ) {
      setPaymentTermDaysError(true);
      toast.error("Missing required field", {
        description: "Payment Term (days) must be greater than 0.",
      });
      return false;
    }

    setInvoiceIdError(false);
    setPaymentTermDaysError(false);

    if (hasSkontoInput && !hasValidSkonto) {
      setSkontoError(
        "Please provide both valid Skonto discount (%) and Skonto period (days).",
      );
      toast.error("Invalid Skonto information");
      return false;
    }

    setSkontoError(null);
    return true;
  };

  const updateInvoicePartyInfo = (
    field: keyof B2BInvoicePartyInfo,
    value: string,
  ) => {
    setIsInvoicePartyEdited(true);
    setInvoicePartyInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const createPdfInvoice = async () => {
    const marketplaceOrderIds = invoiceOrders
      .map((order) => order.marketplace_order_id)
      .filter((id): id is string => Boolean(id?.trim()));

    console.log({
      invoiceId,
      servicePeriod,
      orderNumber,
      invoiceIntro,
      paymentTermDays,
      skontoPercent,
      skontoDays,
      paymentNote,
      marketplaceOrderIds,
    });

    try {
      const blob = await pdf(
        <B2BInvoicePDFFile
          invoiceId={invoiceId.trim()}
          servicePeriod={servicePeriod.trim()}
          orderNumber={orderNumber.trim()}
          introText={invoiceIntro}
          paymentNote={paymentNote}
          orders={invoiceOrders}
          invoicePartyInfo={normalizedInvoicePartyInfo}
        />,
      ).toBlob();

      saveAs(blob, `b2b-invoice-${invoiceId.trim()}.pdf`);
      return true;
    } catch (error) {
      toast.error("Failed to create B2B invoice PDF");
      console.error(error);
      return false;
    }
  };

  const createCsvInvoice = () => {
    if (!invoiceExportRows.length) {
      toast.error("No invoice rows to export");
      return false;
    }

    const headers = Object.keys(invoiceExportRows[0]);
    const escapeCsvValue = (value: unknown) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csvLines = [
      headers.map(escapeCsvValue).join(";"),
      ...invoiceExportRows.map((row) =>
        headers
          .map((header) =>
            escapeCsvValue((row as Record<string, unknown>)[header]),
          )
          .join(";"),
      ),
    ];

    const csvContent = `\uFEFF${csvLines.join("\r\n")}`;
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(blob, `b2b-invoice-${invoiceId.trim()}.csv`);
    return true;
  };

  const createXlsxInvoice = async () => {
    if (!invoiceExportRows.length) {
      toast.error("No invoice rows to export");
      return false;
    }

    try {
      const XLSX = await import("xlsx");
      const worksheet = XLSX.utils.json_to_sheet(invoiceExportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Invoice");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });

      saveAs(blob, `b2b-invoice-${invoiceId.trim()}.xlsx`);
      return true;
    } catch (error) {
      toast.error("Failed to create XLSX invoice");
      console.error(error);
      return false;
    }
  };

  const openConfirmDialog = (format: InvoiceExportFormat) => {
    if (!validateBeforeCreate()) return;
    setConfirmExportFormat(format);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmCreateInvoice = async () => {
    if (!confirmExportFormat || isCreatingInvoice) return;

    setIsCreatingInvoice(true);
    let isSuccess = false;

    if (confirmExportFormat === "csv") {
      isSuccess = createCsvInvoice();
    } else if (confirmExportFormat === "xlsx") {
      isSuccess = await createXlsxInvoice();
    } else {
      isSuccess = await createPdfInvoice();
    }

    setIsCreatingInvoice(false);

    if (isSuccess) {
      setIsConfirmDialogOpen(false);
      setConfirmExportFormat(null);
    }
  };

  useEffect(() => {
    const justOpened = open && !wasOpenRef.current;
    if (justOpened) {
      setSkontoPercent("");
      setSkontoDays("");
      setSkontoError(null);
      setInvoiceIntro(defaultIntroText);
      setPaymentNote(defaultPaymentNote);
      setInvoicePartyInfo(defaultInvoicePartyInfo);
      setIsInvoicePartyEdited(false);
      setIsInvoiceIntroEdited(false);
      setIsPaymentNoteEdited(false);
      setIsConfirmDialogOpen(false);
      setConfirmExportFormat(null);
      setIsCreatingInvoice(false);
    }
    wasOpenRef.current = open;
  }, [open, defaultIntroText, defaultPaymentNote, defaultInvoicePartyInfo]);

  useEffect(() => {
    if (!open || isInvoiceIntroEdited) return;
    setInvoiceIntro(defaultIntroText);
  }, [defaultIntroText, isInvoiceIntroEdited, open]);

  useEffect(() => {
    if (!open || isPaymentNoteEdited) return;
    setPaymentNote(defaultPaymentNote);
  }, [defaultPaymentNote, isPaymentNoteEdited, open]);

  useEffect(() => {
    if (!open || isInvoicePartyEdited) return;
    setInvoicePartyInfo(defaultInvoicePartyInfo);
  }, [defaultInvoicePartyInfo, isInvoicePartyEdited, open]);

  const confirmExportLabel = confirmExportFormat
    ? EXPORT_LABEL_BY_FORMAT[confirmExportFormat]
    : "Invoice";

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange} direction="right">
        <DrawerContent className="p-6 w-[620px] max-w-none data-[vaul-drawer-direction=right]:sm:max-w-[620px] mx-auto overflow-y-auto">
        <DrawerHeader className="px-0 pb-4">
          <DrawerTitle>
            Create{" "}
            {marketplace
              ? `${marketplace.charAt(0).toUpperCase()}${marketplace.slice(1)} `
              : ""}
            B2B Invoice
          </DrawerTitle>
          <DrawerDescription>
            Selected orders: {invoiceOrders.length}
          </DrawerDescription>
        </DrawerHeader>

        {invoiceOrders.some((order) => {
          const status = order.status?.toLowerCase();
          return status !== "shipped" && status !== "completed";
        }) && (
          <div className="mt-4 rounded-md border border-red-400 bg-red-50 p-3">
            <p className="text-sm font-medium text-red-700">
              You selected orders with status different from dispatched. Please
              review before creating invoice.
            </p>
            <div className="mt-2 space-y-1">
              {invoiceOrders
                .filter((order) => {
                  const status = order.status?.toLowerCase();
                  return status !== "shipped" && status !== "completed";
                })
                .map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-sm border border-red-200 bg-white px-2 py-1 text-sm text-red-700"
                  >
                    <span>
                      {order.marketplace_order_id ||
                        order.checkout_code ||
                        order.id}
                      : {getStatusStyle(order.status ?? "").text}
                    </span>
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-700"
                      onClick={() =>
                        setInvoiceOrders((prev) =>
                          prev.filter((item) => item.id !== order.id),
                        )
                      }
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold">Invoice ID</p>
            <Input
              value={invoiceId}
              onChange={(e) => {
                setInvoiceId(e.target.value);
                if (invoiceIdError && e.target.value.trim()) {
                  setInvoiceIdError(false);
                }
              }}
              placeholder="Rechnung Nr."
              className={invoiceIdError ? "border-red-500" : undefined}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">Order Number (optional)</p>
            <Input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. 16PGJ"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">
              Service Period (Leistungszeitraum)
            </p>
            <Popover
              open={servicePeriodOpen}
              onOpenChange={setServicePeriodOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-between font-normal"
                >
                  <span className="truncate text-left">
                    {servicePeriod || "Select date range"}
                  </span>
                  <span className="flex items-center gap-1">
                    {servicePeriodRange?.from && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setServicePeriodRange(undefined);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            setServicePeriodRange(undefined);
                          }
                        }}
                        className="rounded p-1 hover:bg-muted"
                      >
                        <X className="h-3.5 w-3.5 opacity-70" />
                      </span>
                    )}
                    <CalendarIcon className="h-4 w-4 opacity-70" />
                  </span>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="z-[80] w-auto p-0 pointer-events-auto"
                align="start"
              >
                <Calendar
                  mode="range"
                  selected={servicePeriodRange}
                  onSelect={(range) => setServicePeriodRange(range)}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            <Input
              value={servicePeriod}
              readOnly
              placeholder="e.g. 01.02.2026 - 29.02.2026"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">Payment Term (days)</p>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={paymentTermDays}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\D/g, "");
                setPaymentTermDays(onlyDigits);
                if (paymentTermDaysError && onlyDigits.trim()) {
                  setPaymentTermDaysError(false);
                }
              }}
              onKeyDown={(e) => {
                if (
                  [
                    "Backspace",
                    "Delete",
                    "ArrowLeft",
                    "ArrowRight",
                    "Tab",
                  ].includes(e.key)
                ) {
                  return;
                }
                if (!/^\d$/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              onPaste={(e) => {
                const pastedText = e.clipboardData.getData("text");
                if (!/^\d+$/.test(pastedText)) {
                  e.preventDefault();
                }
              }}
              placeholder="14"
              className={paymentTermDaysError ? "border-red-500" : undefined}
            />
          </div>

          <Card className="border border-emerald-100 bg-emerald-50/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Skonto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Optional. Set discount percent and days for early payment terms.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Discount (Rabat)</p>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      %
                    </span>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={skontoPercent}
                      onChange={(e) => {
                        const onlyNumber = e.target.value
                          .replace(/[^\d.,]/g, "")
                          .replace(/(,.*),/g, "$1")
                          .replace(/(\..*)\./g, "$1");
                        setSkontoPercent(onlyNumber);
                        if (skontoError) {
                          setSkontoError(null);
                        }
                      }}
                      placeholder="e.g. 1"
                      className="pl-8"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold">Skonto period (days)</p>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={skontoDays}
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/\D/g, "");
                      setSkontoDays(onlyDigits);
                      if (skontoError) {
                        setSkontoError(null);
                      }
                    }}
                    placeholder="e.g. 10"
                  />
                </div>
              </div>

              {skontoError ? (
                <p className="text-sm text-red-600">{skontoError}</p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border border-sky-100 bg-sky-50/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Invoice Receiver Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-muted-foreground">
                This block controls recipient information shown in the invoice
                header.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <p className="text-sm font-semibold">Company name</p>
                  <Input
                    value={invoicePartyInfo.company_name}
                    onChange={(e) =>
                      updateInvoicePartyInfo("company_name", e.target.value)
                    }
                    placeholder="e.g. BRUNO BADER GmbH + Co. KG"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <p className="text-sm font-semibold">Street address</p>
                  <Input
                    value={invoicePartyInfo.invoice_address}
                    onChange={(e) =>
                      updateInvoicePartyInfo("invoice_address", e.target.value)
                    }
                    placeholder="e.g. Maximilianstr. 48"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold">Postal code</p>
                  <Input
                    value={invoicePartyInfo.invoice_postal_code}
                    onChange={(e) =>
                      updateInvoicePartyInfo(
                        "invoice_postal_code",
                        e.target.value,
                      )
                    }
                    placeholder="e.g. 75172"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold">City</p>
                  <Input
                    value={invoicePartyInfo.invoice_city}
                    onChange={(e) =>
                      updateInvoicePartyInfo("invoice_city", e.target.value)
                    }
                    placeholder="e.g. Pforzheim"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold">Country</p>
                  <Input
                    value={invoicePartyInfo.invoice_country}
                    onChange={(e) =>
                      updateInvoicePartyInfo("invoice_country", e.target.value)
                    }
                    placeholder="e.g. DE"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold">Tax ID</p>
                  <Input
                    value={invoicePartyInfo.tax_id}
                    onChange={(e) =>
                      updateInvoicePartyInfo("tax_id", e.target.value)
                    }
                    placeholder="e.g. DE 144173081"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <p className="text-sm font-semibold">Invoice Intro Text</p>
            <Textarea
              value={invoiceIntro}
              onChange={(e) => {
                setIsInvoiceIntroEdited(true);
                setInvoiceIntro(e.target.value);
              }}
              className="min-h-[150px]"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">Payment Terms & Closing</p>
            <Textarea
              value={paymentNote}
              onChange={(e) => {
                setIsPaymentNoteEdited(true);
                setPaymentNote(e.target.value);
              }}
              className="min-h-[150px]"
            />
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button
              variant="outline"
              disabled={invoiceOrders.length === 0}
              onClick={() => openConfirmDialog("csv")}
            >
              Create CSV Invoice
            </Button>
            <Button
              variant="outline"
              disabled={invoiceOrders.length === 0}
              onClick={() => openConfirmDialog("xlsx")}
            >
              Create XLSX Invoice
            </Button>
            <Button
              disabled={invoiceOrders.length === 0}
              onClick={() => openConfirmDialog("pdf")}
            >
              Create PDF Invoice
            </Button>
          </div>
        </div>
        </DrawerContent>
      </Drawer>

      <Dialog
        open={isConfirmDialogOpen}
        onOpenChange={(nextOpen) => {
          if (isCreatingInvoice) return;
          setIsConfirmDialogOpen(nextOpen);
          if (!nextOpen) {
            setConfirmExportFormat(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Confirm Invoice Information</DialogTitle>
            <DialogDescription>
              Please review the invoice receiver details before creating the{" "}
              {confirmExportLabel} invoice.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="border border-sky-100 bg-sky-50/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">
                  Invoice Receiver Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm leading-6">
                <p>{normalizedInvoicePartyInfo.company_name || "-"}</p>
                <p>{normalizedInvoicePartyInfo.invoice_address || "-"}</p>
                <p>
                  {normalizedInvoicePartyInfo.invoice_postal_code || "-"}{" "}
                  {normalizedInvoicePartyInfo.invoice_city || ""}
                </p>
                <p>{normalizedInvoicePartyInfo.tax_id || "-"}</p>
                <p className="text-xs text-muted-foreground">
                  Country: {normalizedInvoicePartyInfo.invoice_country || "-"}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-2 rounded-md border bg-muted/20 p-3 text-sm sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Invoice ID: </span>
                <span className="font-medium">{invoiceId.trim()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Orders: </span>
                <span className="font-medium">{invoiceOrders.length}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-muted-foreground">Service period: </span>
                <span className="font-medium">{servicePeriod || "-"}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isCreatingInvoice}
              onClick={() => {
                setIsConfirmDialogOpen(false);
                setConfirmExportFormat(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isCreatingInvoice}
              onClick={handleConfirmCreateInvoice}
            >
              {isCreatingInvoice
                ? "Creating..."
                : `Confirm & Create ${confirmExportLabel} Invoice`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
