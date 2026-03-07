"use client";

import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "use-debounce";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Trash2 } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePathname, useRouter } from "@/src/i18n/navigation";
import { useLocale } from "next-intl";
import { ProductItem } from "@/types/products";
import OrderFilterForm from "../../orders/order-list/filter/filter-form";
import { useSearchParams } from "next/navigation";
import ExportOrderExcelButton from "./export-button";
import OrderImport from "./order-import";
import { CheckOutMain } from "@/types/checkout";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { toast } from "sonner";
import { pdf } from "@react-pdf/renderer";
import { saveAs } from "file-saver";
import { B2BInvoicePDFFile } from "@/components/layout/pdf/b2b-invoice-pdf-file";
import { getStatusStyle } from "./status-styles";
import MultiSearch from "../../products/products-list/toolbar/multi-search";

export enum ToolbarType {
  product = "product",
  order = "order",
}

interface OrderToolbarProps {
  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  addButtonText?: string;
  isAddButtonModal?: boolean;
  addButtonUrl?: string;
  addButtonModalContent?: React.ReactNode;
  exportData?: ProductItem[];
  type: ToolbarType;
  selectedOrders?: CheckOutMain[];
}

const FILTER_KEYS = ["search", "status", "channel", "from_date", "to_date"];
const DEFAULT_INVOICE_INTRO = `Sehr geehrte Damen und Herren,

vielen Dank für Ihren Auftrag und das damit verbundene Vertrauen!
Hiermit stelle ich Ihnen die folgenden Leistungen in Rechnung:`;

const PAYMENT_DUE_DATE_TOKEN = "__PAYMENT_DUE_DATE__";
const DEFAULT_PAYMENT_NOTE = `Bitte überweisen Sie den Rechnungsbetrag unter Angabe der Rechnungsnummer auf das unten angegebene
Konto.
${PAYMENT_DUE_DATE_TOKEN}
Mit freundlichen Grüßen
Duong Thuy Nguyen
`;

export default function OrderToolbar({
  pageSize,
  setPageSize,
  setPage,
  addButtonText,
  isAddButtonModal,
  addButtonUrl,
  addButtonModalContent,
  exportData,
  type,
  selectedOrders = [],
}: OrderToolbarProps) {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openB2BDrawer, setOpenB2BDrawer] = useState(false);
  const [b2bMarketplace, setB2BMarketplace] = useState<string>("");
  const [invoiceOrders, setInvoiceOrders] = useState<CheckOutMain[]>([]);
  const [invoiceId, setInvoiceId] = useState("");
  const [invoiceIdError, setInvoiceIdError] = useState(false);
  const [servicePeriod, setServicePeriod] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryAddressError, setDeliveryAddressError] = useState(false);
  const [paymentTermDays, setPaymentTermDays] = useState("14");
  const [paymentTermDaysError, setPaymentTermDaysError] = useState(false);
  const [paymentDueDate, setPaymentDueDate] = useState("");
  const [paymentDueDateError, setPaymentDueDateError] = useState(false);
  const [invoiceIntro, setInvoiceIntro] = useState(DEFAULT_INVOICE_INTRO);
  const [paymentNote, setPaymentNote] = useState(DEFAULT_PAYMENT_NOTE);
  const defaultSearch = searchParams.get("search") ?? "";
  const invoiceTitleLine = orderNumber.trim()
    ? `Rechnung Nr. ${invoiceId || "XXXXXXXX"} - Ihre Bestellung ${orderNumber.trim()}`
    : `Rechnung Nr. ${invoiceId || "XXXXXXXX"}`;
  const resolvedIntroText = `${invoiceTitleLine}\n\n${invoiceIntro}`;
  const paymentTermLine = `Zahlungsbedingungen: Zahlung innerhalb von ${
    paymentTermDays || "XX"
  } Tagen ab Rechnungseingang ohne Abzüge.`;
  const paymentDueDateLine = `Der Rechnungsbetrag ist bis zum ${
    paymentDueDate || "TT.MM.JJJJ"
  } fällig.`;
  const paymentBodyWithDueDate = paymentNote.includes(PAYMENT_DUE_DATE_TOKEN)
    ? paymentNote.replace(PAYMENT_DUE_DATE_TOKEN, paymentDueDateLine)
    : `${paymentDueDateLine}\n${paymentNote}`;
  const resolvedPaymentNote = `${paymentTermLine}\n\n${paymentBodyWithDueDate}`;

  const [searchValue, setSearchValue] = useState(defaultSearch);
  const [prevParams, setPrevParams] = useState(
    Object.fromEntries(searchParams.entries()),
  );
  const [debouncedSearch] = useDebounce(searchValue, 600);

  // push URL khi debounce hoàn thành
  useEffect(() => {
    const current = Object.fromEntries(searchParams.entries());

    // check filter changed
    const filterChanged = FILTER_KEYS.some((k) => current[k] !== prevParams[k]);

    if (filterChanged) {
      router.push(
        {
          pathname,
          query: { ...current, page: 1 },
        },
        { scroll: false },
      );
      setPage(1);
    }

    setPrevParams(current);
  }, [searchParams]);

  useEffect(() => {
    const currentSearch = searchParams.get("search") ?? "";
    if (debouncedSearch !== currentSearch) {
      router.push(
        {
          pathname,
          query: {
            ...Object.fromEntries(searchParams.entries()),
            search: debouncedSearch,
          },
        },
        { scroll: false },
      );
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (!openB2BDrawer) {
      setInvoiceOrders(selectedOrders);
    }
  }, [selectedOrders, openB2BDrawer]);

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-2 w-full flex-wrap lg:flex-nowrap">
      {/* Left group */}
      <div className="lg:flex items-center lg:gap-4 gap-2 flex-nowrap hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-1">
              Group action <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {/* <DropdownMenuItem>Delete Selected</DropdownMenuItem> */}
            <DropdownMenuItem>Export Selected</DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                if (selectedOrders.length === 0) {
                  toast.info("No order selected");
                  return;
                }

                const missingExternalId = selectedOrders.filter(
                  (order) => !order.marketplace_order_id?.trim(),
                );
                const missingMarketplace = selectedOrders.filter(
                  (order) => !order.from_marketplace?.trim(),
                );

                const marketplaces = Array.from(
                  new Set(
                    selectedOrders
                      .map((order) => order.from_marketplace?.trim())
                      .filter((value): value is string => Boolean(value)),
                  ),
                );

                const errors: string[] = [];

                if (missingExternalId.length > 0) {
                  errors.push(
                    `Missing external ID: ${missingExternalId
                      .map((order) => order.checkout_code || order.id)
                      .join(", ")}`,
                  );
                }

                if (missingMarketplace.length > 0) {
                  errors.push(
                    `Missing marketplace: ${missingMarketplace
                      .map((order) => order.checkout_code || order.id)
                      .join(", ")}`,
                  );
                }

                if (marketplaces.length > 1) {
                  errors.push(
                    `Orders must be in one marketplace. Found: ${marketplaces.join(", ")}`,
                  );
                }

                if (errors.length > 0) {
                  toast.error("Cannot create B2B invoice", {
                    description: (
                      <div className="flex flex-col gap-1">
                        {errors.map((error) => (
                          <div key={error}>- {error}</div>
                        ))}
                      </div>
                    ),
                  });
                  return;
                }

                const marketplace = marketplaces[0] ?? "";
                setB2BMarketplace(marketplace);
                setInvoiceOrders(selectedOrders);
                setOpenB2BDrawer(true);
              }}
            >
              Create B2B Invoice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex gap-2 text-sm font-medium">
          <ExportOrderExcelButton />
          <OrderImport />
        </div>
      </div>

      {/* Search (auto, no button) */}
      <div className="flex items-center w-full flex-1 flex-nowrap gap-2">
        <MultiSearch />
        <Input
          placeholder="Search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>

      {/* Right group */}
      <div className="flex items-center gap-4 flex-wrap lg:flex-nowrap justify-center lg:justify-start">
        <div>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => setPageSize(Number(value))}
          >
            <SelectTrigger className="border text-black cursor-pointer">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 rows</SelectItem>
              <SelectItem value="5">5 rows</SelectItem>
              <SelectItem value="10">10 rows</SelectItem>
              <SelectItem value="20">20 rows</SelectItem>
              <SelectItem value="50">50 rows</SelectItem>
              <SelectItem value="300">300 rows</SelectItem>
              <SelectItem value="500">500 rows</SelectItem>
              <SelectItem value="1000">1000 rows</SelectItem>
              <SelectItem value="2000">2000 rows</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1">
              Filter <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[800px] px-8 py-4">
            {/* {type === ToolbarType.product && <FilterForm />} */}
            {type === ToolbarType.order && <OrderFilterForm />}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1">
              View <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Compact</DropdownMenuItem>
            <DropdownMenuItem>Comfortable</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1">
              Columns <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Name</DropdownMenuItem>
            <DropdownMenuItem>Stock</DropdownMenuItem>
            <DropdownMenuItem>Price</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {addButtonText && (
          <Button
            className="bg-primary hover:bg-primary font-semibold"
            onClick={() => {
              if (addButtonUrl) {
                router.push(addButtonUrl, { locale });
              } else if (isAddButtonModal) {
                setOpenAddModal(true);
              }
            }}
          >
            {addButtonText}
          </Button>
        )}
      </div>

      {isAddButtonModal && (
        <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
          <DialogContent className="w-1/3">
            <DialogHeader>
              <DialogTitle>{addButtonText}</DialogTitle>
            </DialogHeader>
            {addButtonModalContent &&
              React.cloneElement(
                addButtonModalContent as React.ReactElement<{
                  onClose?: () => void;
                }>,
                { onClose: () => setOpenAddModal(false) },
              )}
          </DialogContent>
        </Dialog>
      )}

      <Drawer
        open={openB2BDrawer}
        onOpenChange={setOpenB2BDrawer}
        direction="right"
      >
        <DrawerContent className="p-6 w-[620px] max-w-none data-[vaul-drawer-direction=right]:sm:max-w-[620px] mx-auto overflow-y-auto">
          <DrawerHeader className="px-0 pb-4">
            <DrawerTitle>
              Create{" "}
              {b2bMarketplace
                ? `${b2bMarketplace.charAt(0).toUpperCase()}${b2bMarketplace.slice(1)} `
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
                You selected orders with status different from dispatched.
                Please review before creating invoice.
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
              <Input
                value={servicePeriod}
                onChange={(e) => setServicePeriod(e.target.value)}
                placeholder="e.g. 01.02.2026 - 29.02.2026"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold">Payment Term (days)</p>
              <Input
                type="number"
                min={1}
                value={paymentTermDays}
                onChange={(e) => {
                  setPaymentTermDays(e.target.value);
                  if (paymentTermDaysError && e.target.value.trim()) {
                    setPaymentTermDaysError(false);
                  }
                }}
                placeholder="14"
                className={paymentTermDaysError ? "border-red-500" : undefined}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold">Payment Due Date</p>
              <Input
                value={paymentDueDate}
                onChange={(e) => {
                  setPaymentDueDate(e.target.value);
                  if (paymentDueDateError && e.target.value.trim()) {
                    setPaymentDueDateError(false);
                  }
                }}
                placeholder="31.03.2026"
                className={paymentDueDateError ? "border-red-500" : undefined}
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
                if (!paymentDueDate.trim()) {
                  setPaymentDueDateError(true);
                  toast.error("Missing required field", {
                    description: "Payment Due Date is required.",
                  });
                  return;
                }

                setInvoiceIdError(false);
                setDeliveryAddressError(false);
                setPaymentTermDaysError(false);
                setPaymentDueDateError(false);
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
                  paymentDueDate,
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
    </div>
  );
}
