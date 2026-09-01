"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCreateDpdOutboundLabels } from "@/features/dpd/hook";
import type { CreateDpdOutboundLabelsPayload } from "@/features/dpd/api";
import { useGetAdminSupplierCheckoutItems } from "@/features/checkout/hook";
import {
  SupplierCheckoutItem,
  SupplierCheckoutItemShippingAddress,
} from "@/types/checkout";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  MapPin,
  PackageCheck,
  Printer,
  RefreshCw,
  Search,
  Truck,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import { toast } from "sonner";

const PRESTIGE_HOME_SUPPLIER_ID = "65d162e2-7c5d-46f9-86d3-21fcf4346efe";
const WAREHOUSE_STATUSES = ["PREPARATION_SHIPPING", "PAID"];
const PAGE_SIZE_OPTIONS = [20, 50, 100];
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

const formatNumber = (value?: number | string | null) => {
  const numericValue = Number(value ?? 0);

  if (!Number.isFinite(numericValue)) return "0";

  return new Intl.NumberFormat("de-DE").format(numericValue);
};

const removeOrderCodeDashes = (value?: string | null) =>
  (value ?? "").replace(/-/g, "").trim();

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

const getDpdLabelUrl = (response: unknown): string | null => {
  if (typeof response === "string") return response;
  if (!response || typeof response !== "object") return null;

  const record = response as Record<string, unknown>;
  const directValue =
    record.url ??
    record.file_url ??
    record.pdf_url ??
    record.label_url ??
    record.download_url ??
    record.file ??
    record.pdf ??
    record.base64 ??
    record.data;

  if (typeof directValue === "string") return directValue;

  if (Array.isArray(record.labels)) {
    const firstLabel = record.labels[0];

    if (typeof firstLabel === "string") return firstLabel;
    if (firstLabel && typeof firstLabel === "object") {
      return getDpdLabelUrl(firstLabel);
    }
  }

  return null;
};

const openDpdLabelResponse = (response: unknown) => {
  if (response instanceof Blob) {
    const objectUrl = URL.createObjectURL(response);

    window.open(objectUrl, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);

    return true;
  }

  const labelUrl = getDpdLabelUrl(response);

  if (!labelUrl) return false;

  if (labelUrl.startsWith("data:application/pdf")) {
    window.open(labelUrl, "_blank", "noopener,noreferrer");
    return true;
  }

  if (labelUrl.startsWith("http") || labelUrl.startsWith("/")) {
    window.open(labelUrl, "_blank", "noopener,noreferrer");
    return true;
  }

  try {
    const byteCharacters = window.atob(labelUrl);
    const byteNumbers = Array.from(byteCharacters, (character) =>
      character.charCodeAt(0),
    );
    const blob = new Blob([new Uint8Array(byteNumbers)], {
      type: "application/pdf",
    });
    const objectUrl = URL.createObjectURL(blob);

    window.open(objectUrl, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);

    return true;
  } catch {
    return false;
  }
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

const buildDpdPayload = (
  item: SupplierCheckoutItem,
): CreateDpdOutboundLabelsPayload => ({
  orderdata: (item.list_shipping_address ?? []).map((address) => {
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
      },
    };
  }),
  label_size: "A6",
  dpd_shipping_date: new Date().toISOString(),
  dpd_label_position: "UpperLeft",
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
}: {
  address: SupplierCheckoutItemShippingAddress;
  index: number;
}) {
  const countryFlag = getCountryFlag(address.country);
  const ageStatus = getShipmentAgeStatus(address.created_at);

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
    </div>
  );
}

function ExpandedAddresses({ item }: { item: SupplierCheckoutItem }) {
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

export default function WarehousePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Number(searchParams.get("page_size") ?? 50);
  const search = searchParams.get("search") ?? "";
  const [searchInput, setSearchInput] = React.useState(search);
  const [expandedKeys, setExpandedKeys] = React.useState<string[]>([]);
  const [printingKey, setPrintingKey] = React.useState<string | null>(null);
  const createDpdOutboundLabels = useCreateDpdOutboundLabels();

  React.useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const { data, isLoading, isFetching, isError, refetch } =
    useGetAdminSupplierCheckoutItems({
      supplier_id: PRESTIGE_HOME_SUPPLIER_ID,
      status: WAREHOUSE_STATUSES,
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

  const toggleExpanded = (key: string) => {
    setExpandedKeys((current) =>
      current.includes(key)
        ? current.filter((itemKey) => itemKey !== key)
        : [...current, key],
    );
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

    setPrintingKey(key);

    try {
      const response = await createDpdOutboundLabels.mutateAsync(
        buildDpdPayload(item),
      );
      const opened = openDpdLabelResponse(response);

      toast.success("DPD labels created", {
        description: opened
          ? "The label file was opened in a new tab."
          : "The API returned successfully, but no label URL was found.",
      });
    } catch {
      toast.error("Failed to create DPD labels");
    } finally {
      setPrintingKey(null);
    }
  };

  const handleReset = () => {
    setSearchInput("");
    setExpandedKeys([]);
    router.push("?");
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
              Preparation Shipping
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-3xl border border-emerald-100 bg-white/80 p-4 shadow-sm backdrop-blur md:min-w-[360px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Products
              </p>
              <p className="mt-2 text-xl font-bold text-slate-950">
                {formatNumber(filteredItems.length)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                To prepare
              </p>
              <p className="mt-2 text-xl font-bold text-emerald-600">
                {formatNumber(totalQuantity)}
              </p>
            </div>
            <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Shipments
              </p>
              <p className="mt-2 text-xl font-bold text-slate-950">
                {formatNumber(totalShipments)}
              </p>
            </div>
          </div>
        </div>
      </section>

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
          <div className="flex h-56 items-center justify-center rounded-3xl bg-slate-50 text-slate-500">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-emerald-600" />
            Loading preparation items...
          </div>
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
            <p className="font-semibold text-slate-700">No items to prepare</p>
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
                                <span>Status: PREPARATION_SHIPPING</span>
                              </div>
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
                          <Button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void handlePrintProduct(item, rowKey);
                            }}
                            disabled={printingKey === rowKey}
                            className="rounded-xl bg-emerald-600 px-4 text-white hover:bg-emerald-700"
                          >
                            {printingKey === rowKey ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Printer className="mr-2 h-4 w-4" />
                            )}
                            Print
                          </Button>
                        </TableCell>
                      </TableRow>

                      {isExpanded ? (
                        <TableRow>
                          <TableCell colSpan={7} className="bg-slate-50/60 p-4">
                            <ExpandedAddresses item={item} />
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
    </div>
  );
}
