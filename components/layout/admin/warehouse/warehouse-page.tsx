"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateDpdOutboundLabels } from "@/features/dpd/hook";
import type { CreateDpdOutboundLabelsPayload } from "@/features/dpd/api";
import { useCreateGlsOutboundLabels } from "@/features/gls/hook";
import type {
  CreateGlsOutboundLabelsPayload,
  GlsOutboundOrderDataItem,
} from "@/features/gls/api";
import type {
  CreateSpeditionOutboundLabelPayload,
  CreateSpeditionOutboundLabelResponse,
} from "@/features/spedition/api";
import { useCreateSpeditionOutboundLabel } from "@/features/spedition/hook";
import { useGetAdminSupplierCheckoutItems } from "@/features/checkout/hook";
import { useSendSupplierTrackingBulks } from "@/features/supplier/hook";
import type { SendTrackingBulksInput } from "@/features/supplier/api";
import {
  SupplierCheckoutItem,
  SupplierCheckoutItemShippingAddress,
} from "@/types/checkout";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Loader2,
  MapPin,
  PackageCheck,
  Printer,
  RefreshCw,
  Search,
  Truck,
} from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { SpeditionLabelPdf } from "@/components/layout/pdf/spedition-label-pdf";
import { SpeditionLabelPreview } from "@/components/layout/pdf/spedition-label-preview";
import type { SpeditionLabelData } from "@/components/layout/pdf/spedition-label-pdf";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { toast } from "sonner";

const PRESTIGE_HOME_SUPPLIER_ID = "65d162e2-7c5d-46f9-86d3-21fcf4346efe";
const PREPARE_NEEDED_STATUSES = [
  "PREPARATION_SHIPPING",
  "PAID",
  "EXCHANGE_PREPARATION_SHIPPING",
  "EXCHANGE",
];
const DISPATCHED_STATUSES = ["SHIPPED", "COMPLETED"];
const WAREHOUSE_VIEW_OPTIONS = [
  { value: "prepare-needed", label: "Prepare needed" },
  { value: "dispatched", label: "Dispatched" },
] as const;
const PAGE_SIZE_OPTIONS = [20, 50, 100];
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
const WAREHOUSE_CARRIER_OPTIONS = [
  { value: "dpd", imageSrc: "/dpd.jpeg", imageAlt: "DPD" },
  { value: "gls", imageSrc: "/gls-new.png", imageAlt: "GLS" },
  {
    value: "spedition",
    imageSrc: "/cargoline.webp",
    imageAlt: "Cargoline",
  },
] as const;

type WarehouseCarrier = (typeof WAREHOUSE_CARRIER_OPTIONS)[number]["value"];
type WarehouseView = (typeof WAREHOUSE_VIEW_OPTIONS)[number]["value"];

interface ShipmentConfirmDialogState {
  productName: string;
  shipments: SupplierCheckoutItemShippingAddress[];
  selectedShipmentIds: string[];
  shippedAt: Date;
}

const DEFAULT_WAREHOUSE_CARRIER: WarehouseCarrier = "dpd";

const isWarehouseCarrier = (value?: string | null): value is WarehouseCarrier =>
  WAREHOUSE_CARRIER_OPTIONS.some((option) => option.value === value);

const isWarehouseView = (value?: string | null): value is WarehouseView =>
  WAREHOUSE_VIEW_OPTIONS.some((option) => option.value === value);

const formatNumber = (value?: number | string | null) => {
  const numericValue = Number(value ?? 0);

  if (!Number.isFinite(numericValue)) return "0";

  return new Intl.NumberFormat("de-DE").format(numericValue);
};

const getMissingSpeditionPackageFields = (item: SupplierCheckoutItem) => {
  const fields = [
    ["weight", item.weight_per_item],
    ["length", item.length],
    ["width", item.width],
    ["height", item.height],
  ] as const;

  return fields
    .filter(([, value]) => !(Number(value) > 0))
    .map(([label]) => label);
};

const formatDateOnly = (value: Date) =>
  new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);

const formatDateForSpedition = (value?: string | null) => {
  const normalizedValue = value?.trim() ?? "";

  if (!normalizedValue) return "";

  const datePart = normalizedValue.match(/^\d{4}-\d{2}-\d{2}/)?.[0];

  if (datePart) return datePart;

  const parsedDate = new Date(normalizedValue);

  return Number.isNaN(parsedDate.getTime())
    ? ""
    : parsedDate.toISOString().slice(0, 10);
};

const removeOrderCodeDashes = (value?: string | null) =>
  (value ?? "").replace(/-/g, "").trim();

const getShipmentKey = (
  address: SupplierCheckoutItemShippingAddress,
  index: number,
) => address.id || address.checkout_code || `shipment-${index}`;

const hasCompleteShipmentLabel = (
  address: SupplierCheckoutItemShippingAddress,
) => {
  const labels = address.labels ?? [];

  return (
    labels.length > 0 &&
    labels.every(
      (label) =>
        Boolean(label.label?.trim()) && Boolean(label.tracking_number?.trim()),
    )
  );
};

const hasShipmentTrackingNumber = (
  address: SupplierCheckoutItemShippingAddress,
) =>
  (address.labels ?? []).some((label) => Boolean(label.tracking_number?.trim()));

const hasCompleteShipmentForCarrier = (
  address: SupplierCheckoutItemShippingAddress,
  carrier: WarehouseCarrier,
) =>
  carrier === "spedition"
    ? hasShipmentTrackingNumber(address)
    : hasCompleteShipmentLabel(address);

const openExistingLabelUrls = (urls: string[]) => {
  urls.forEach((url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  });
};

const openShipmentLabels = (address: SupplierCheckoutItemShippingAddress) => {
  openExistingLabelUrls(
    (address.labels ?? []).map((label) => label.label.trim()).filter(Boolean),
  );
};

const splitRecipientName = (value?: string | null) => {
  const normalizedName = (value ?? "").trim().replace(/\s+/g, " ");

  if (!normalizedName) {
    return {
      firstName: "",
      lastName: "",
    };
  }

  const [firstName, ...lastNameParts] = normalizedName.split(" ");

  return {
    firstName,
    lastName: lastNameParts.join(" "),
  };
};

const splitStreetAndHouseNumber = (value?: string | null) => {
  const normalizedAddress = (value ?? "").trim().replace(/\s+/g, " ");

  if (!normalizedAddress) {
    return {
      street: "",
      houseNumber: " ",
    };
  }

  const streetFirstMatch = normalizedAddress.match(
    /^(.+?)\s+(\d+\s*[a-zA-Z]?([/-]\s*\d+\s*[a-zA-Z]?)?)$/,
  );

  if (streetFirstMatch) {
    return {
      street: streetFirstMatch[1].trim(),
      houseNumber: streetFirstMatch[2].replace(/\s+/g, "").trim(),
    };
  }

  const houseFirstMatch = normalizedAddress.match(
    /^(\d+\s*[a-zA-Z]?([/-]\s*\d+\s*[a-zA-Z]?)?)\s+(.+)$/,
  );

  if (houseFirstMatch) {
    return {
      street: houseFirstMatch[3].trim(),
      houseNumber: houseFirstMatch[1].replace(/\s+/g, "").trim(),
    };
  }

  return {
    street: normalizedAddress,
    houseNumber: " ",
  };
};

const parseJsonSafely = (value: string) => {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
};

const getRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const readErrorResponseData = async (data: unknown) => {
  if (data instanceof Blob) {
    const text = await data.text();

    return text ? parseJsonSafely(text) : null;
  }

  if (typeof data === "string") {
    return parseJsonSafely(data);
  }

  return data;
};

const extractOutboundLabelErrorMessage = (data: unknown): string | null => {
  if (typeof data === "string") return data.trim() || null;

  const record = getRecord(data);
  if (!record) return null;

  const detail = record.detail;

  if (typeof detail === "string") return detail.trim() || null;

  const detailRecord = getRecord(detail);
  const detailMessage = detailRecord?.message;

  if (typeof detailMessage === "string" && detailMessage.trim()) {
    return detailMessage.trim();
  }

  const dpdErrors = detailRecord?.dpd_errors;

  if (Array.isArray(dpdErrors)) {
    for (const dpdError of dpdErrors) {
      const dpdErrorRecord = getRecord(dpdError);
      const dpdErrorMessage = dpdErrorRecord?.message;

      if (typeof dpdErrorMessage === "string" && dpdErrorMessage.trim()) {
        return dpdErrorMessage.trim();
      }
    }
  }

  const message = record.message;

  if (typeof message === "string" && message.trim()) {
    return message.trim();
  }

  return null;
};

const getOutboundLabelErrorMessage = async (error: unknown) => {
  const errorRecord = getRecord(error);
  const responseRecord = getRecord(errorRecord?.response);
  const responseData = await readErrorResponseData(responseRecord?.data);
  const apiMessage = extractOutboundLabelErrorMessage(responseData);

  if (apiMessage) return apiMessage;
  if (error instanceof Error && error.message) return error.message;

  return "Failed to create DPD labels";
};

const getAddressLine = (address: SupplierCheckoutItemShippingAddress) =>
  [
    address.recipient_name,
    address.address_line,
    address.additional_address_line,
    [address.postal_code, address.city].filter(Boolean).join(" "),
    address.country,
  ]
    .filter(Boolean)
    .join(", ");

const getCountryFlag = (countryCode?: string | null) => {
  const normalizedCountryCode = countryCode?.trim().toUpperCase();

  if (!normalizedCountryCode || normalizedCountryCode.length !== 2) return null;

  return normalizedCountryCode
    .split("")
    .map((character) => String.fromCodePoint(127397 + character.charCodeAt(0)))
    .join("");
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getShipmentAgeStatus = (createdAt?: string | null) => {
  if (!createdAt) return null;

  const createdAtTime = new Date(createdAt).getTime();

  if (Number.isNaN(createdAtTime)) return null;

  const ageInMs = Date.now() - createdAtTime;

  if (ageInMs > 2 * ONE_DAY_IN_MS) {
    return {
      label: "Late",
      className: "bg-red-600 text-white ring-red-600",
    };
  }

  if (ageInMs > ONE_DAY_IN_MS) {
    return {
      label: "Warning",
      className: "bg-amber-50 text-amber-700 ring-amber-200",
    };
  }

  return null;
};

const getSearchText = (item: SupplierCheckoutItem) =>
  [
    item.name,
    item.sku,
    ...item.list_shipping_address.flatMap((address) => [
      address.checkout_code,
      address.recipient_name,
      address.city,
      address.postal_code,
      address.country,
    ]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

const buildOutboundOrderData = (
  item: SupplierCheckoutItem,
): GlsOutboundOrderDataItem[] =>
  (item.list_shipping_address ?? []).map((address) => {
    const { firstName, lastName } = splitRecipientName(address.recipient_name);
    const { street, houseNumber } = splitStreetAndHouseNumber(
      address.address_line,
    );

    return {
      shipping_address: {
        recipient_company: address.name_address ?? "",
        recipient_first_name: firstName,
        recipient_last_name: lastName,
        recipient_email: address.email ?? "",
        recipient_phone: address.phone_number ?? "",
        recipient_street: street,
        recipient_house_no: houseNumber,
        recipient_zip: address.postal_code ?? "",
        recipient_city: address.city ?? "",
        recipient_country: address.country || "DE",
      },
      parcel_data: {
        weight: Math.max(Number(item.weight_per_item) || 0.001, 0.001),
        content: "Prestige Home Product",
        outbound_id: removeOrderCodeDashes(address.checkout_code),
        outbound_rf_1: item.sku ?? "",
        outbound_rf_2: item.name ?? "",
        cart_items_id: address.cart_items_id ?? "",
      },
    };
  });

const buildDpdPayload = (
  item: SupplierCheckoutItem,
): CreateDpdOutboundLabelsPayload => ({
  orderdata: buildOutboundOrderData(item).map((order, index) => ({
    ...order,
    parcel_data: {
      ...order.parcel_data,
      cart_items_id: item.list_shipping_address[index]?.cart_items_id ?? "",
    },
  })),
  label_size: "A6",
  dpd_shipping_date: new Date().toISOString(),
  dpd_label_position: "UpperLeft",
});

const buildGlsPayload = (
  item: SupplierCheckoutItem,
): CreateGlsOutboundLabelsPayload => ({
  orderdata: buildOutboundOrderData(item),
});

const roundToThreeDecimals = (value: number) => Math.round(value * 1000) / 1000;

const buildSpeditionPayload = (
  item: SupplierCheckoutItem,
  address: SupplierCheckoutItemShippingAddress,
): CreateSpeditionOutboundLabelPayload => {
  const length = Number(item.length) || 0;
  const width = Number(item.width) || 0;
  const height = Number(item.height) || 0;
  const { firstName, lastName } = splitRecipientName(address.recipient_name);
  const { street, houseNumber } = splitStreetAndHouseNumber(
    address.address_line,
  );

  return {
    parcel_data: {
      weight: Number(item.weight_per_item) || 0,
      content: item.name ?? "",
      outbound_rf_1: item.sku ?? "",
      package_type: "KT",
      length_cm: length,
      width_cm: width,
      height_cm: height,
      volume_cbm: roundToThreeDecimals((length * width * height) / 1000000),
      loading_meters: 0.6,
      cart_items_id: address.cart_items_id ?? "",
    },
    orderdata: [
      {
        shipping_address: {
          recipient_company: address.name_address,
          recipient_first_name: firstName,
          recipient_last_name: lastName,
          recipient_email: address.email ?? "",
          recipient_phone: address.phone_number ?? "",
          recipient_street: street,
          recipient_house_no: houseNumber,
          recipient_zip: address.postal_code ?? "",
          recipient_city: address.city ?? "",
          recipient_country: address.country || "DE",
        },
        outbound_id: address.checkout_code ?? "",
        delivery_date: formatDateForSpedition(address.created_at),
        delivery_note_number: address.checkout_code ?? "",
      },
    ],
  };
};

const mapSpeditionLabelData = (
  response: CreateSpeditionOutboundLabelResponse,
): SpeditionLabelData | null => {
  const order = response.payload?.orderdata?.[0];

  if (!order) return null;

  const parcel = response.payload.parcel_data;
  const address = order.shipping_address;

  return {
    recipient: {
      name: [address.recipient_first_name, address.recipient_last_name]
        .filter(Boolean)
        .join(" "),
      street: [address.recipient_street, address.recipient_house_no]
        .filter(Boolean)
        .join(" "),
      postalCode: address.recipient_zip,
      city: address.recipient_city,
      countryCode: address.recipient_country,
    },
    orderCode: order.outbound_id,
    sku: parcel.outbound_rf_1,
    productName: parcel.content,
    parcelNumber: 1,
    parcelCount: response.sscc.length || 1,
    weightKg: parcel.weight,
    sscc: response.sscc[0] ?? "",
    reference: order.delivery_note_number || order.outbound_id,
    createdAt: order.delivery_date,
  };
};

const buildSpeditionLabelDataFromShipment = (
  item: SupplierCheckoutItem,
  address: SupplierCheckoutItemShippingAddress,
): SpeditionLabelData => {
  const { firstName, lastName } = splitRecipientName(address.recipient_name);
  const { street, houseNumber } = splitStreetAndHouseNumber(
    address.address_line,
  );
  const trackingNumber = address.labels?.find((label) =>
    Boolean(label.tracking_number?.trim()),
  )?.tracking_number;

  return {
    recipient: {
      name: [firstName, lastName].filter(Boolean).join(" "),
      street: [street, houseNumber].filter(Boolean).join(" "),
      postalCode: address.postal_code,
      city: address.city,
      countryCode: address.country,
    },
    orderCode: address.checkout_code,
    sku: item.sku,
    productName: item.name,
    parcelNumber: 1,
    parcelCount: 1,
    weightKg: item.weight_per_item,
    sscc: trackingNumber ?? "",
    reference: address.checkout_code,
    createdAt: formatDateForSpedition(address.created_at),
  };
};

const buildTrackingPayload = (
  dialog: ShipmentConfirmDialogState,
  carrier: WarehouseCarrier,
): SendTrackingBulksInput => ({
  tracking: dialog.shipments
    .filter((address, index) =>
      dialog.selectedShipmentIds.includes(getShipmentKey(address, index)),
    )
    .flatMap((address) => {
      const label = address.labels?.[0];

      if (
        !address.checkout_id ||
        !label?.tracking_number ||
        (carrier !== "spedition" && !label.label)
      ) {
        return [];
      }

      return [
        {
          checkout_id: address.checkout_id,
          tracking_number: label.tracking_number,
          shipping_carrier: carrier,
          shipped_date: label.created_at,
          ship_code: address.checkout_code,
        },
      ];
    }),
});

function ProductAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-sm font-bold text-emerald-600 ring-1 ring-emerald-100">
      {initials || <PackageCheck className="h-5 w-5" />}
    </div>
  );
}

function AddressCard({
  address,
  index,
  onConfirm,
  onReprint,
  onPrint,
  allowConfirm,
  allowShipmentPrint,
  carrier,
}: {
  address: SupplierCheckoutItemShippingAddress;
  index: number;
  onConfirm: (
    address: SupplierCheckoutItemShippingAddress,
    index: number,
  ) => void;
  onReprint: (address: SupplierCheckoutItemShippingAddress) => void;
  onPrint: (
    address: SupplierCheckoutItemShippingAddress,
    index: number,
  ) => void;
  allowConfirm: boolean;
  allowShipmentPrint: boolean;
  carrier: WarehouseCarrier;
}) {
  const countryFlag = getCountryFlag(address.country);
  const ageStatus = getShipmentAgeStatus(address.created_at);
  const isPrinted = hasCompleteShipmentForCarrier(address, carrier);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Shipment #{index + 1}
          </p>
          <p className="mt-1 font-semibold text-slate-950">
            {address.checkout_code || "—"}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {isPrinted && allowConfirm ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Printed
            </span>
          ) : null}
          {ageStatus ? (
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${ageStatus.className}`}
            >
              {ageStatus.label}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
            {countryFlag ? <span aria-hidden="true">{countryFlag}</span> : null}
            <span>{address.country || "—"}</span>
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p>Created: {formatDateTime(address.created_at)}</p>
        <div className="flex gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>{getAddressLine(address) || "No shipping address"}</span>
        </div>
        {address.phone_number ? <p>Phone: {address.phone_number}</p> : null}
        {address.email ? <p>Email: {address.email}</p> : null}
      </div>

      {isPrinted || allowShipmentPrint ? (
        <div className="mt-4 flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-1.5 text-xs text-slate-500">
            <p className="font-semibold uppercase tracking-[0.12em] text-slate-400">
              Tracking
            </p>
            {address.labels?.map((label) => (
              <div key={label.id} className="flex flex-wrap items-center gap-3">
                <span className="font-semibold tabular-nums text-slate-700">
                  {label.tracking_number}
                </span>
                {label.label ? (
                  <a
                    href={label.label}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
                  >
                    View label
                  </a>
                ) : null}
              </div>
            ))}
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
            {isPrinted && allowConfirm ? (
              <Button
                type="button"
                size="sm"
                onClick={() => onConfirm(address, index)}
                className="h-9 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                Confirm
              </Button>
            ) : null}
            {isPrinted ? (
              <Button
                type="button"
                size="sm"
                onClick={() => onReprint(address)}
                variant="outline"
                className="h-9 rounded-xl border-slate-200 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-300"
              >
                <Printer className="mr-1.5 h-3.5 w-3.5" />
                Reprint
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={() => onPrint(address, index)}
                className="h-9 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                <Printer className="mr-1.5 h-3.5 w-3.5" />
                Print
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ExpandedAddresses({
  item,
  onConfirmShipment,
  onReprintShipment,
  onPrintShipment,
  allowConfirm,
  allowShipmentPrint,
  carrier,
}: {
  item: SupplierCheckoutItem;
  onConfirmShipment: (
    item: SupplierCheckoutItem,
    address: SupplierCheckoutItemShippingAddress,
    index: number,
  ) => void;
  onReprintShipment: (
    item: SupplierCheckoutItem,
    address: SupplierCheckoutItemShippingAddress,
  ) => void;
  onPrintShipment: (
    item: SupplierCheckoutItem,
    address: SupplierCheckoutItemShippingAddress,
    index: number,
  ) => void;
  allowConfirm: boolean;
  allowShipmentPrint: boolean;
  carrier: WarehouseCarrier;
}) {
  const addresses = item.list_shipping_address ?? [];

  return (
    <div className="rounded-3xl bg-slate-50 p-4 md:p-5">
      <div className="flex justify-start">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
          {formatNumber(addresses.length)} shipments
        </span>
      </div>

      {addresses.length > 0 ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
          {addresses.map((address, index) => (
            <AddressCard
              key={address.id || `${item.sku}-${index}`}
              address={address}
              index={index}
              onConfirm={(selectedAddress, selectedIndex) =>
                onConfirmShipment(item, selectedAddress, selectedIndex)
              }
              onReprint={(address) => onReprintShipment(item, address)}
              onPrint={(address, addressIndex) =>
                onPrintShipment(item, address, addressIndex)
              }
              allowConfirm={allowConfirm}
              allowShipmentPrint={allowShipmentPrint}
              carrier={carrier}
            />
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-sm text-slate-500">
          No shipping addresses returned for this product.
        </div>
      )}
    </div>
  );
}

function WarehouseTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#EEF8F0] hover:bg-[#EEF8F0]">
            <TableHead className="w-14 bg-[#EEF8F0]" />
            <TableHead className="min-w-[420px] bg-[#EEF8F0]">
              Product
            </TableHead>
            <TableHead className="bg-[#EEF8F0]">SKU</TableHead>
            <TableHead className="bg-[#EEF8F0]">Quantity</TableHead>
            <TableHead className="bg-[#EEF8F0]">Weight / item</TableHead>
            <TableHead className="bg-[#EEF8F0]">Shipments</TableHead>
            <TableHead className="bg-[#EEF8F0] text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-9 w-9 rounded-full bg-slate-100" />
              </TableCell>
              <TableCell>
                <div className="flex min-w-[420px] items-center gap-4 py-2">
                  <Skeleton className="h-14 w-14 rounded-2xl bg-emerald-50" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-5 w-full max-w-[520px] bg-slate-100" />
                    <div className="flex gap-3">
                      <Skeleton className="h-4 w-24 bg-slate-100" />
                      <Skeleton className="h-4 w-44 bg-slate-100" />
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-28 bg-slate-100" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-20 rounded-full bg-emerald-50" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16 bg-slate-100" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-16 rounded-full bg-slate-100" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-10 w-24 rounded-xl bg-emerald-50" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function WarehousePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Number(searchParams.get("page_size") ?? 50);
  const search = searchParams.get("search") ?? "";
  const viewParam = searchParams.get("view");
  const activeView = isWarehouseView(viewParam) ? viewParam : "prepare-needed";
  const carrierParam = searchParams.get("carrier");
  const activeCarrier = isWarehouseCarrier(carrierParam)
    ? carrierParam
    : DEFAULT_WAREHOUSE_CARRIER;
  const activeStatuses =
    activeView === "dispatched" ? DISPATCHED_STATUSES : PREPARE_NEEDED_STATUSES;
  const activeViewLabel = WAREHOUSE_VIEW_OPTIONS.find(
    (option) => option.value === activeView,
  )?.label;
  const isPrepareView = activeView === "prepare-needed";
  const [searchInput, setSearchInput] = React.useState(search);
  const [expandedKeys, setExpandedKeys] = React.useState<string[]>([]);
  const [printingKey, setPrintingKey] = React.useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] =
    React.useState<ShipmentConfirmDialogState | null>(null);
  const [speditionLabel, setSpeditionLabel] =
    React.useState<SpeditionLabelData | null>(null);
  const createDpdOutboundLabels = useCreateDpdOutboundLabels();
  const createGlsOutboundLabels = useCreateGlsOutboundLabels();
  const createSpeditionOutboundLabel = useCreateSpeditionOutboundLabel();
  const sendSupplierTrackingBulks = useSendSupplierTrackingBulks();

  React.useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetAdminSupplierCheckoutItems({
      supplier_id: PRESTIGE_HOME_SUPPLIER_ID,
      status: activeStatuses,
      carrier: activeCarrier,
    });

  const filteredItems = React.useMemo(() => {
    const items = data?.items ?? [];
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return items;

    return items.filter((item) =>
      getSearchText(item).includes(normalizedSearch),
    );
  }, [data?.items, search]);

  const totalQuantity = React.useMemo(
    () =>
      filteredItems.reduce(
        (total, item) => total + (Number(item.quantity) || 0),
        0,
      ),
    [filteredItems],
  );
  const totalShipments = React.useMemo(
    () =>
      filteredItems.reduce(
        (total, item) => total + (item.list_shipping_address?.length ?? 0),
        0,
      ),
    [filteredItems],
  );
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedItems = React.useMemo(() => {
    const startIndex = (safePage - 1) * pageSize;

    return filteredItems.slice(startIndex, startIndex + pageSize);
  }, [filteredItems, pageSize, safePage]);

  const updateParams = React.useCallback(
    (updates: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
          return;
        }
        params.set(key, String(value));
      });

      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateParams({ search: searchInput.trim(), page: 1 });
  };

  const handleCarrierChange = (value: string) => {
    if (!isWarehouseCarrier(value)) return;

    setExpandedKeys([]);
    updateParams({ carrier: value, page: 1 });
  };

  const handleViewChange = (value: string) => {
    if (!isWarehouseView(value)) return;

    setExpandedKeys([]);
    updateParams({ view: value, page: 1 });
  };

  const toggleExpanded = (key: string) => {
    setExpandedKeys((current) =>
      current.includes(key)
        ? current.filter((itemKey) => itemKey !== key)
        : [...current, key],
    );
  };

  const openConfirmDialog = (
    item: SupplierCheckoutItem,
    shipments: SupplierCheckoutItemShippingAddress[],
  ) => {
    if (shipments.length === 0) {
      toast.error("No shipments to confirm for this product");
      return;
    }

    setConfirmDialog({
      productName: item.name || "Unnamed product",
      shipments,
      selectedShipmentIds: shipments.map((address, index) =>
        getShipmentKey(address, index),
      ),
      shippedAt: new Date(),
    });
  };

  const handleConfirmProduct = (item: SupplierCheckoutItem) => {
    openConfirmDialog(
      item,
      (item.list_shipping_address ?? []).filter((address) =>
        hasCompleteShipmentForCarrier(address, activeCarrier),
      ),
    );
  };

  const handleConfirmShipment = (
    item: SupplierCheckoutItem,
    address: SupplierCheckoutItemShippingAddress,
  ) => {
    openConfirmDialog(item, [address]);
  };

  const handleReprintShipment = (
    item: SupplierCheckoutItem,
    address: SupplierCheckoutItemShippingAddress,
  ) => {
    if (activeCarrier === "spedition") {
      setSpeditionLabel(buildSpeditionLabelDataFromShipment(item, address));
      return;
    }

    openShipmentLabels(address);
    toast.success("Existing label opened", {
      description: "The label file is ready to print again.",
    });
  };

  const handlePrintSpeditionShipment = async (
    item: SupplierCheckoutItem,
    address: SupplierCheckoutItemShippingAddress,
    index: number,
  ) => {
    const shipmentKey = `spedition:${getShipmentKey(address, index)}`;
    setPrintingKey(shipmentKey);

    try {
      const response = await createSpeditionOutboundLabel.mutateAsync(
        buildSpeditionPayload(item, address),
      );
      const labelData = mapSpeditionLabelData(response);

      if (!labelData) {
        throw new Error("Spedition label response is missing label data");
      }

      setSpeditionLabel(labelData);
      await refetch();
      toast.success("Spedition label created");
    } catch (error) {
      toast.error(await getOutboundLabelErrorMessage(error));
    } finally {
      setPrintingKey(null);
    }
  };

  const handlePrintSpeditionLabel = async () => {
    if (!speditionLabel) return;

    try {
      const blob = await pdf(
        <SpeditionLabelPdf data={speditionLabel} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement("iframe");

      iframe.style.position = "fixed";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.src = url;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        window.setTimeout(() => {
          iframe.remove();
          URL.revokeObjectURL(url);
        }, 1000);
      };
    } catch {
      toast.error("Failed to prepare the Spedition label for printing");
    }
  };

  const toggleConfirmShipment = (shipmentId: string) => {
    setConfirmDialog((current) => {
      if (!current) return current;

      return {
        ...current,
        selectedShipmentIds: current.selectedShipmentIds.includes(shipmentId)
          ? current.selectedShipmentIds.filter((id) => id !== shipmentId)
          : [...current.selectedShipmentIds, shipmentId],
      };
    });
  };

  const handleConfirmSelectedShipments = async () => {
    if (!confirmDialog) return;

    const payload = buildTrackingPayload(confirmDialog, activeCarrier);

    if (payload.tracking.length === 0) {
      toast.error("No complete tracking data is available for confirmation");
      return;
    }

    try {
      await sendSupplierTrackingBulks.mutateAsync(payload);
      await refetch();
      setConfirmDialog(null);
      toast.success("Shipment confirmation sent");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to confirm shipments";
      toast.error(message);
    }
  };

  const handlePrintProduct = async (
    item: SupplierCheckoutItem,
    key: string,
  ) => {
    const addresses = item.list_shipping_address ?? [];

    if (addresses.length === 0) {
      toast.error("No shipments to print for this product");
      return;
    }

    const unprintedAddresses = addresses.filter(
      (address) => !hasCompleteShipmentForCarrier(address, activeCarrier),
    );

    if (unprintedAddresses.length === 0) {
      toast.info("All shipments are already printed", {
        description: "Use Reprint on an individual shipment to print it again.",
      });
      return;
    }

    setPrintingKey(key);
    const itemToPrint = {
      ...item,
      list_shipping_address: unprintedAddresses,
    };

    try {
      if (activeCarrier === "gls") {
        await createGlsOutboundLabels.mutateAsync(buildGlsPayload(itemToPrint));
      } else if (activeCarrier === "dpd") {
        await createDpdOutboundLabels.mutateAsync(buildDpdPayload(itemToPrint));
      } else {
        toast.error("Printing is only available for DPD and GLS");
        return;
      }

      await refetch();

      const carrierLabel = activeCarrier === "gls" ? "GLS" : "DPD";

      toast.success(`${carrierLabel} labels created`, {
        description: "Labels created. Use Reprint on a shipment to print it.",
      });
    } catch (error) {
      toast.error(await getOutboundLabelErrorMessage(error));
    } finally {
      setPrintingKey(null);
    }
  };

  const handleReset = () => {
    setSearchInput("");
    setExpandedKeys([]);
    router.push(
      activeCarrier === DEFAULT_WAREHOUSE_CARRIER
        ? activeView === "prepare-needed"
          ? "?"
          : `?view=${activeView}`
        : activeView === "prepare-needed"
          ? `?carrier=${activeCarrier}`
          : `?carrier=${activeCarrier}&view=${activeView}`,
    );
  };

  return (
    <div className="space-y-6 pb-10">
      <section className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50 shadow-sm">
        <div className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600 ring-1 ring-emerald-100">
              Warehouse
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              {activeViewLabel}
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-3xl border border-emerald-100 bg-white/80 p-4 shadow-sm backdrop-blur md:min-w-[360px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Products
              </p>
              {isLoading ? (
                <Skeleton className="mt-3 h-6 w-12 bg-slate-100" />
              ) : (
                <p className="mt-2 text-xl font-bold text-slate-950">
                  {formatNumber(filteredItems.length)}
                </p>
              )}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                To prepare
              </p>
              {isLoading ? (
                <Skeleton className="mt-3 h-6 w-12 bg-emerald-50" />
              ) : (
                <p className="mt-2 text-xl font-bold text-emerald-600">
                  {formatNumber(totalQuantity)}
                </p>
              )}
            </div>
            <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Shipments
              </p>
              {isLoading ? (
                <Skeleton className="mt-3 h-6 w-16 bg-slate-100" />
              ) : (
                <p className="mt-2 text-xl font-bold text-slate-950">
                  {formatNumber(totalShipments)}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="space-y-3">
        <Tabs value={activeView} onValueChange={handleViewChange}>
          <TabsList className="grid w-full grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm sm:w-fit">
            {WAREHOUSE_VIEW_OPTIONS.map((option) => (
              <TabsTrigger
                key={option.value}
                value={option.value}
                className="h-11 rounded-xl border-b-0 px-6 text-sm font-semibold data-[state=active]:border-b-0 data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:ring-1 data-[state=active]:ring-emerald-200"
              >
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Tabs value={activeCarrier} onValueChange={handleCarrierChange}>
          <TabsList className="grid w-full grid-cols-3 gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm sm:w-fit">
            {WAREHOUSE_CARRIER_OPTIONS.map((option) => (
              <TabsTrigger
                key={option.value}
                value={option.value}
                aria-label={option.imageAlt}
                className="h-12 rounded-xl border-b-0 bg-white px-4 data-[state=active]:border-b-0 data-[state=active]:bg-emerald-50 data-[state=active]:ring-1 data-[state=active]:ring-emerald-200 sm:px-8"
              >
                <Image
                  src={option.imageSrc}
                  alt={option.imageAlt}
                  width={120}
                  height={36}
                  className="h-7 w-auto object-contain"
                />
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <form className="relative flex-1" onSubmit={handleSearch}>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by product, SKU, checkout code, or address"
              className="h-12 rounded-2xl border-slate-200 bg-white pl-12 text-base shadow-sm"
            />
          </form>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
            <select
              value={pageSize}
              onChange={(event) =>
                updateParams({ page_size: Number(event.target.value), page: 1 })
              }
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} rows
                </option>
              ))}
            </select>

            <Button
              type="button"
              onClick={() => refetch()}
              variant="outline"
              className="h-12 rounded-2xl border-slate-200 px-4"
              disabled={isFetching}
            >
              {isFetching ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>

            <Button
              type="button"
              onClick={handleReset}
              variant="ghost"
              className="h-12 rounded-2xl px-4 text-slate-500"
            >
              Reset
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-sm md:p-5">
        {isLoading ? (
          <WarehouseTableSkeleton />
        ) : isError ? (
          <div className="flex h-56 flex-col items-center justify-center rounded-3xl bg-red-50 text-center text-red-600">
            <p className="font-semibold">Failed to load preparation items.</p>
            <Button
              type="button"
              onClick={() => refetch()}
              variant="outline"
              className="mt-4 rounded-2xl bg-white"
            >
              Try again
            </Button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center rounded-3xl bg-slate-50 text-center text-slate-500">
            <PackageCheck className="mb-3 h-8 w-8 text-slate-300" />
            <p className="font-semibold text-slate-700">
              No {activeViewLabel?.toLowerCase()} items
            </p>
            <p className="mt-1 text-sm">
              There are no matching preparation items.
            </p>
          </div>
        ) : (
          <>
            <Table containerClassName="rounded-3xl border border-slate-200">
              <TableHeader>
                <TableRow className="bg-[#EEF8F0] hover:bg-[#EEF8F0]">
                  <TableHead className="w-14 bg-[#EEF8F0]" />
                  <TableHead className="min-w-[420px] bg-[#EEF8F0]">
                    Product
                  </TableHead>
                  <TableHead className="bg-[#EEF8F0]">SKU</TableHead>
                  <TableHead className="bg-[#EEF8F0]">Quantity</TableHead>
                  <TableHead className="bg-[#EEF8F0]">Weight / item</TableHead>
                  <TableHead className="bg-[#EEF8F0]">Shipments</TableHead>
                  <TableHead className="bg-[#EEF8F0] text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedItems.map((item, index) => {
                  const rowKey = item.sku || `${item.name}-${index}`;
                  const isExpanded = expandedKeys.includes(rowKey);
                  const hasPrintedShipments = (
                    item.list_shipping_address ?? []
                  ).some((address) =>
                    hasCompleteShipmentForCarrier(address, activeCarrier),
                  );
                  const hasUnprintedShipments = (
                    item.list_shipping_address ?? []
                  ).some(
                    (address) =>
                      !hasCompleteShipmentForCarrier(address, activeCarrier),
                  );
                  const missingSpeditionPackageFields =
                    getMissingSpeditionPackageFields(item);
                  const hasInvalidSpeditionPackage =
                    missingSpeditionPackageFields.length > 0;

                  return (
                    <React.Fragment key={rowKey}>
                      <TableRow
                        role="button"
                        tabIndex={0}
                        aria-expanded={isExpanded}
                        onClick={() => toggleExpanded(rowKey)}
                        onKeyDown={(event) => {
                          if (event.key !== "Enter" && event.key !== " ")
                            return;

                          event.preventDefault();
                          toggleExpanded(rowKey);
                        }}
                        className="cursor-pointer hover:bg-emerald-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-inset"
                      >
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={
                              isExpanded ? "Collapse product" : "Expand product"
                            }
                            aria-expanded={isExpanded}
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleExpanded(rowKey);
                            }}
                            className="h-9 w-9 rounded-full text-slate-600 hover:bg-emerald-50 hover:text-emerald-600"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex min-w-[420px] items-center gap-4 py-2">
                            <ProductAvatar name={item.name} />
                            <div className="min-w-0">
                              <p className="line-clamp-2 max-w-[640px] text-base font-semibold text-slate-950">
                                {item.name || "Unnamed product"}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
                                <span>
                                  {formatNumber(
                                    item.list_shipping_address?.length,
                                  )}{" "}
                                  shipments
                                </span>
                              </div>
                              {activeCarrier === "spedition" &&
                              hasInvalidSpeditionPackage ? (
                                <p className="mt-2 text-xs font-semibold text-red-600">
                                  Missing package data: {missingSpeditionPackageFields.join(", ")}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-slate-700">
                          {item.sku || "—"}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200">
                            {formatNumber(item.quantity)} pcs.
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {formatNumber(item.weight_per_item)} kg
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
                            <Truck className="h-4 w-4" />
                            {formatNumber(item.list_shipping_address?.length)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {(activeCarrier === "dpd" ||
                              activeCarrier === "gls") &&
                            hasUnprintedShipments ? (
                              <Button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  void handlePrintProduct(item, rowKey);
                                }}
                                disabled={
                                  printingKey === rowKey
                                }
                                className="rounded-xl bg-emerald-600 px-4 text-white hover:bg-emerald-700"
                              >
                                {printingKey === rowKey ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Printer className="mr-2 h-4 w-4" />
                                )}
                                Print
                              </Button>
                            ) : null}
                            {isPrepareView && hasPrintedShipments ? (
                              <Button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  handleConfirmProduct(item);
                                }}
                                variant="outline"
                                className="rounded-xl border-emerald-200 px-4 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Bulk confirm
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>

                      {isExpanded ? (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-slate-50/60 p-4">
                            <ExpandedAddresses
                              item={item}
                              onConfirmShipment={handleConfirmShipment}
                              onReprintShipment={handleReprintShipment}
                              onPrintShipment={handlePrintSpeditionShipment}
                              allowConfirm={isPrepareView}
                              allowShipmentPrint={
                                activeCarrier === "spedition" &&
                                !hasInvalidSpeditionPackage
                              }
                              carrier={activeCarrier}
                            />
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>

            <div className="mt-4 flex flex-col items-center justify-between gap-3 text-sm text-slate-500 md:flex-row">
              <span>
                {formatNumber(filteredItems.length)} products found · page{" "}
                {safePage}/{totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  disabled={safePage <= 1}
                  onClick={() => updateParams({ page: safePage - 1 })}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  disabled={safePage >= totalPages}
                  onClick={() => updateParams({ page: safePage + 1 })}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </section>

      <Dialog
        open={Boolean(speditionLabel)}
        onOpenChange={(open) => {
          if (!open) setSpeditionLabel(null);
        }}
      >
        <DialogContent className="flex max-h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-2xl flex-col overflow-hidden rounded-3xl bg-white p-4">
          <DialogHeader className="shrink-0">
            <DialogTitle>Spedition label</DialogTitle>
            <DialogDescription>
              The label was created successfully and is ready to print.
            </DialogDescription>
          </DialogHeader>
          {speditionLabel ? (
            <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl bg-slate-50 p-2 sm:p-4">
              <SpeditionLabelPreview data={speditionLabel} />
            </div>
          ) : null}
          <DialogFooter className="shrink-0 pt-2">
            <Button
              type="button"
              onClick={handlePrintSpeditionLabel}
              className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <Printer className="mr-2 h-4 w-4" />
              Print label
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(confirmDialog)}
        onOpenChange={(open) => {
          if (!open) setConfirmDialog(null);
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-3xl sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm shipment</DialogTitle>
            <DialogDescription>
              Are you sure you want to confirm the selected shipments were sent
              on{" "}
              <span className="font-semibold text-slate-700">
                {confirmDialog ? formatDateOnly(confirmDialog.shippedAt) : "—"}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>

          {confirmDialog ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900 ring-1 ring-emerald-100">
                <p className="font-semibold">{confirmDialog.productName}</p>
                <p className="mt-1 text-emerald-700">
                  {formatNumber(confirmDialog.selectedShipmentIds.length)} of{" "}
                  {formatNumber(confirmDialog.shipments.length)} shipments
                  selected.
                </p>
              </div>

              <div className="space-y-3">
                {confirmDialog.shipments.map((address, index) => {
                  const shipmentId = getShipmentKey(address, index);
                  const isChecked =
                    confirmDialog.selectedShipmentIds.includes(shipmentId);

                  return (
                    <label
                      key={shipmentId}
                      className="flex cursor-pointer gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/40"
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() =>
                          toggleConfirmShipment(shipmentId)
                        }
                        className="mt-1"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold text-slate-950">
                            {address.checkout_code || `Shipment #${index + 1}`}
                          </p>
                          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                            {address.country || "—"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          {getAddressLine(address) || "No shipping address"}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span>
                            Created: {formatDateTime(address.created_at)}
                          </span>
                          {address.phone_number ? (
                            <span>Phone: {address.phone_number}</span>
                          ) : null}
                          {address.email ? (
                            <span>Email: {address.email}</span>
                          ) : null}
                          {address.labels?.map((label) => (
                            <React.Fragment key={label.id}>
                              <span>
                                Tracking: {label.tracking_number || "—"}
                              </span>
                              {label.label ? (
                                <a
                                  href={label.label}
                                  target="_blank"
                                  rel="noreferrer"
                                  onClick={(event) => event.stopPropagation()}
                                  className="font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
                                >
                                  View label
                                </a>
                              ) : null}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl"
              onClick={() => setConfirmDialog(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={
                !confirmDialog?.selectedShipmentIds.length ||
                sendSupplierTrackingBulks.isPending
              }
              onClick={handleConfirmSelectedShipments}
            >
              {sendSupplierTrackingBulks.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirm selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
