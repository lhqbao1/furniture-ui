"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";

interface B2BInvoiceDrawerProps {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  marketplace: string;
  selectedOrders: CheckOutMain[];
}

const DEFAULT_INVOICE_INTRO = `Sehr geehrte Damen und Herren,

vielen Dank für Ihren Auftrag und das damit verbundene Vertrauen!
Hiermit stelle ich Ihnen die folgenden Leistungen in Rechnung:`;

const PAYMENT_DUE_DATE_TOKEN = "__PAYMENT_DUE_DATE__";
const DEFAULT_PAYMENT_NOTE = `Bitte überweisen Sie den Rechnungsbetrag unter Angabe der Rechnungsnummer auf das unten angegebene
Konto.
${PAYMENT_DUE_DATE_TOKEN}
`;

const formatDateDDMMYYYY = (date: Date) =>
  date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

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
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryAddressError, setDeliveryAddressError] = useState(false);
  const [paymentTermDays, setPaymentTermDays] = useState("14");
  const [paymentTermDaysError, setPaymentTermDaysError] = useState(false);
  const [invoiceIntro, setInvoiceIntro] = useState(DEFAULT_INVOICE_INTRO);
  const [paymentNote, setPaymentNote] = useState(DEFAULT_PAYMENT_NOTE);

  useEffect(() => {
    if (!open) {
      setInvoiceOrders(selectedOrders);
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
  const resolvedIntroText = `${invoiceTitleLine}\n\n${invoiceIntro}`;

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

  const paymentTermLine = `Zahlungsbedingungen:`;
  const paymentDueDateLine = `Der Rechnungsbetrag ist bis zum ${computedPaymentDueDate} fällig.`;
  const paymentBodyWithDueDate = paymentNote.includes(PAYMENT_DUE_DATE_TOKEN)
    ? paymentNote.replace(PAYMENT_DUE_DATE_TOKEN, paymentDueDateLine)
    : `${paymentDueDateLine}\n${paymentNote}`;
  const resolvedPaymentNote = `${paymentTermLine}\n\n${paymentBodyWithDueDate}`;

  return (
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
            <p className="text-sm font-semibold">Delivery Address</p>
            <Input
              value={deliveryAddress}
              onChange={(e) => {
                setDeliveryAddress(e.target.value);
                if (deliveryAddressError && e.target.value.trim()) {
                  setDeliveryAddressError(false);
                }
              }}
              placeholder="Logis. Areal PP 1108/Hala BA5, 90055 Lozorno"
              className={deliveryAddressError ? "border-red-500" : undefined}
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
                  ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(
                    e.key,
                  )
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

          <div className="space-y-2">
            <p className="text-sm font-semibold">Invoice Intro Text</p>
            <Textarea
              value={resolvedIntroText}
              onChange={(e) => {
                const raw = e.target.value;
                const withoutDynamicLine = raw.startsWith(invoiceTitleLine)
                  ? raw.slice(invoiceTitleLine.length)
                  : raw.replace(
                      /^(?:Rechnung Nr\.|SAMMELRECHNUNG NR\.)\s.*\n?/,
                      "",
                    );
                setInvoiceIntro(withoutDynamicLine.replace(/^\n+/, ""));
              }}
              className="min-h-[150px]"
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">Payment Terms & Closing</p>
            <Textarea
              value={resolvedPaymentNote}
              onChange={(e) => {
                const raw = e.target.value;
                const withoutTermLine = raw.startsWith(paymentTermLine)
                  ? raw.slice(paymentTermLine.length)
                  : raw.replace(/^Zahlungsbedingungen:.*\n?/, "");
                const withoutDueDateLine = withoutTermLine.replace(
                  /Der Rechnungsbetrag ist bis zum .* fällig\.\n?/,
                  `${PAYMENT_DUE_DATE_TOKEN}\n`,
                );
                setPaymentNote(withoutDueDateLine.replace(/^\n+/, ""));
              }}
              className="min-h-[150px]"
            />
          </div>

          <Button
            className="w-full"
            disabled={invoiceOrders.length === 0}
            onClick={async () => {
              if (!invoiceId.trim()) {
                setInvoiceIdError(true);
                toast.error("Missing required field", {
                  description: "Invoice ID is required.",
                });
                return;
              }

              if (!deliveryAddress.trim()) {
                setDeliveryAddressError(true);
                toast.error("Missing required field", {
                  description: "Delivery Address is required.",
                });
                return;
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
                return;
              }

              setInvoiceIdError(false);
              setDeliveryAddressError(false);
              setPaymentTermDaysError(false);

              const marketplaceOrderIds = invoiceOrders
                .map((order) => order.marketplace_order_id)
                .filter((id): id is string => Boolean(id?.trim()));

              console.log({
                invoiceId,
                deliveryAddress,
                servicePeriod,
                orderNumber,
                invoiceIntro: resolvedIntroText,
                paymentTermDays,
                paymentNote: resolvedPaymentNote,
                marketplaceOrderIds,
              });

              try {
                const blob = await pdf(
                  <B2BInvoicePDFFile
                    invoiceId={invoiceId.trim()}
                    deliveryAddress={deliveryAddress.trim()}
                    servicePeriod={servicePeriod.trim()}
                    orderNumber={orderNumber.trim()}
                    introText={resolvedIntroText}
                    paymentNote={resolvedPaymentNote}
                    orders={invoiceOrders}
                  />,
                ).toBlob();

                saveAs(blob, `b2b-invoice-${invoiceId.trim()}.pdf`);
              } catch (error) {
                toast.error("Failed to create B2B invoice PDF");
                console.error(error);
              }
            }}
          >
            Create Invoice
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
