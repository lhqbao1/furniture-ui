"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckOut, CheckOutMain } from "@/types/checkout";
import {
  CircleAlert,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  Eye,
  FileText,
} from "lucide-react";
import { getOrderTagOption, listChanel } from "@/data/data";
import { useRouter } from "@/src/i18n/navigation";
import { useLocale } from "next-intl";
import { CartItem } from "@/types/cart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { ProductTable } from "../../products/products-list/product-table";
import { getStatusStyle } from "./status-styles";
import CancelExchangeDialog from "../order-details/dialog/cancel-exchange-dialog";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { getMainCheckOutByMainCheckOutId } from "@/features/checkout/api";

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function isImageUrl(url: string) {
  return /\.(png|jpe?g|gif|webp|bmp|svg|avif)(\?.*)?$/i.test(url);
}

function getFileNameFromUrl(url: string) {
  const path = url.split("?")[0] ?? "";
  const fileName = path.split("/").pop() ?? "file";
  try {
    return decodeURIComponent(fileName);
  } catch {
    return fileName;
  }
}

type OrderInfoFileEntry = {
  key: string;
  url: string;
  source: "checkout" | "refund";
};

type OrderInfoCardPosition = {
  top: number;
  left: number;
  maxHeight: number;
};

const ORDER_INFO_CARD_WIDTH = 460;
const ORDER_INFO_CARD_MAX_HEIGHT = 560;
const ORDER_INFO_CARD_MIN_HEIGHT = 260;
const ORDER_INFO_CARD_MARGIN = 16;

function getOrderInfoFileEntries(order: Pick<CheckOutMain, "files"> & {
  product_refund?: CheckOutMain["product_refund"];
}): OrderInfoFileEntry[] {
  const entries = new Map<string, OrderInfoFileEntry>();

  (order.product_refund ?? []).forEach((refundItem, refundIndex) => {
    (refundItem?.files ?? []).forEach((file, fileIndex) => {
      const url = (file?.url ?? "").trim();
      if (!url || entries.has(url)) return;
      entries.set(url, {
        key: `refund-${refundIndex}-${fileIndex}-${url}`,
        url,
        source: "refund",
      });
    });
  });

  (order.files ?? []).forEach((file, index) => {
    const url = (file?.url ?? "").trim();
    if (!url) return;
    entries.set(url, {
      key: `checkout-${index}-${url}`,
      url,
      source: "checkout",
    });
  });

  return Array.from(entries.values());
}

function getOrderInfoCardPosition(rect: DOMRect): OrderInfoCardPosition {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const cardWidth = Math.min(
    ORDER_INFO_CARD_WIDTH,
    viewportWidth - ORDER_INFO_CARD_MARGIN * 2,
  );
  const left = Math.min(
    Math.max(ORDER_INFO_CARD_MARGIN, rect.right - cardWidth),
    viewportWidth - cardWidth - ORDER_INFO_CARD_MARGIN,
  );
  const spaceBelow = viewportHeight - rect.bottom - ORDER_INFO_CARD_MARGIN;
  const spaceAbove = rect.top - ORDER_INFO_CARD_MARGIN;
  const preferBelow =
    spaceBelow >= ORDER_INFO_CARD_MIN_HEIGHT || spaceBelow >= spaceAbove;

  if (preferBelow) {
    const top = rect.bottom + 10;
    return {
      top,
      left,
      maxHeight: Math.max(
        ORDER_INFO_CARD_MIN_HEIGHT,
        Math.min(ORDER_INFO_CARD_MAX_HEIGHT, viewportHeight - top - ORDER_INFO_CARD_MARGIN),
      ),
    };
  }

  const maxHeight = Math.max(
    ORDER_INFO_CARD_MIN_HEIGHT,
    Math.min(ORDER_INFO_CARD_MAX_HEIGHT, spaceAbove - 10),
  );

  return {
    top: Math.max(ORDER_INFO_CARD_MARGIN, rect.top - maxHeight - 10),
    left,
    maxHeight,
  };
}

const parseDateValue = (value?: string | Date | null): Date | null => {
  if (!value) return null;
  const directDate = new Date(value);
  if (!Number.isNaN(directDate.getTime())) return directDate;

  const fallback = `${value}Z`;
  const fallbackDate = new Date(fallback);
  if (!Number.isNaN(fallbackDate.getTime())) return fallbackDate;

  return null;
};

const formatDeliveryRangeLabel = (
  fromValue?: string | Date | null,
  toValue?: string | Date | null,
): string => {
  const fromDate = parseDateValue(fromValue);
  const toDate = parseDateValue(toValue);

  if (!fromDate && !toDate) return "-";

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "numeric",
      year: "2-digit",
    });

  if (fromDate && toDate) {
    return `${formatDate(fromDate)} - ${formatDate(toDate)}`;
  }

  return formatDate(fromDate ?? toDate!);
};

const TAG_COLOR_BY_LABEL: Record<string, string> = {
  "exchange in progress": "bg-[#1E3A8A]",
  "exchange completed": "bg-[#14532D]",
  "no refund needed": "bg-[#B45309]",
  "different carrier": "bg-[#0F766E]",
};

const normalizeTagValue = (value?: string | null) =>
  typeof value === "string" ? value.trim() : "";

const getFallbackTagCode = (tag: string) => {
  const words = tag
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (words.length === 0) {
    return "TAG";
  }

  if (words.length === 1) {
    return words[0].slice(0, 3).toUpperCase();
  }

  return words
    .slice(0, 3)
    .map((item) => item[0]?.toUpperCase() ?? "")
    .join("");
};

const buildOrderTagBadges = (order: CheckOutMain) => {
  const tagsFromArray = Array.isArray(order.tags)
    ? order.tags
        .map((item) => ({
          tag: normalizeTagValue(item?.tag),
          code: normalizeTagValue(item?.code),
        }))
        .filter((item) => item.tag)
    : [];

  const fallbackTag = normalizeTagValue(order.tag);
  const baseTags =
    tagsFromArray.length > 0
      ? tagsFromArray
      : fallbackTag
        ? [{ tag: fallbackTag, code: "" }]
        : [];

  const uniqueTags = Array.from(
    new Map(baseTags.map((item) => [item.tag.toLowerCase(), item])).values(),
  );

  return uniqueTags.map((item) => {
    const option = getOrderTagOption(item.tag);
    const bgClass =
      TAG_COLOR_BY_LABEL[item.tag.toLowerCase()] ??
      option?.bg ??
      "bg-[#334155]";
    const shortCode = item.code
      ? item.code.toUpperCase()
      : (option?.shortLabel ?? getFallbackTagCode(item.tag));

    return {
      label: item.tag,
      code: shortCode,
      bgClass,
    };
  });
};

const formatPostalCityCountry = (
  postalCode?: string | null,
  city?: string | null,
  country?: string | null,
) => {
  const postal = String(postalCode ?? "").trim();
  const cityName = String(city ?? "").trim();
  const countryCode = String(country ?? "").trim().toUpperCase();
  return [postal, cityName, countryCode].filter(Boolean).join(" ");
};

const getOrderCustomerEmail = (
  order: CheckOutMain,
  checkout?: CheckOut,
): string => {
  const mainCheckoutUserEmail = String(
    (
      order as CheckOutMain & {
        user?: { email?: string | null } | null;
      }
    )?.user?.email ?? "",
  ).trim();

  if (mainCheckoutUserEmail) return mainCheckoutUserEmail;

  const checkoutUserEmail = String(checkout?.user?.email ?? "").trim();
  if (checkoutUserEmail) return checkoutUserEmail;

  const invoiceEmail = String(checkout?.invoice_address?.email ?? "").trim();
  return invoiceEmail;
};

const deliveryPreviewColumns: ColumnDef<CartItem>[] = [
  {
    accessorKey: "id_provider",
    header: "ID",
    cell: ({ row }) => (
      <div className="font-medium">
        #{row.original?.products?.id_provider ?? "-"}
      </div>
    ),
  },
  {
    accessorKey: "sku",
    header: () => <div className="text-center">SKU</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original?.products?.sku ?? "-"}</div>
    ),
  },
  {
    accessorKey: "ean",
    header: () => <div className="text-center">EAN</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original?.products?.ean ?? "-"}</div>
    ),
  },
  {
    accessorKey: "name",
    header: () => <div className="text-left">NAME</div>,
    cell: ({ row }) => (
      <div className="max-w-[420px] truncate">
        {row.original?.products?.name ?? "-"}
      </div>
    ),
  },
  {
    accessorKey: "quantity",
    header: () => <div className="text-center">MENGE</div>,
    cell: ({ row }) => (
      <div className="text-center font-medium">
        {toNumber(row.original?.quantity).toLocaleString("de-DE")}
      </div>
    ),
  },
];

const ActionCell = ({
  id,
  expandedRowId,
  setExpandedRowId,
  toggleExpandedRow,
  isRowExpanded,
  currentRowId,
  note,
  files,
  productRefund,
  status,
  refundAmount,
  marketplaceOrderId,
}: {
  id: string;
  expandedRowId?: string | null;
  setExpandedRowId?: (id: string | null) => void;
  toggleExpandedRow?: (id: string) => void;
  isRowExpanded?: (id: string) => boolean;
  currentRowId?: string;
  note?: string | null;
  files?: CheckOutMain["files"];
  productRefund?: CheckOutMain["product_refund"];
  status?: string | null;
  refundAmount?: number | null;
  marketplaceOrderId?: string | null;
}) => {
  const router = useRouter();
  const locale = useLocale();

  const isExpanded = currentRowId
    ? (isRowExpanded?.(currentRowId) ?? expandedRowId === currentRowId)
    : false;
  const noteText = note?.trim();
  const fileEntries = getOrderInfoFileEntries({
    files: files ?? [],
    product_refund: productRefund,
  });
  const normalizedStatus = String(status ?? "").toLowerCase();
  const shouldFetchDetailInfo =
    fileEntries.length === 0 &&
    !noteText &&
    (normalizedStatus.includes("refund") || toNumber(refundAmount) > 0);
  const { data: detailOrder, isFetching: isFetchingDetailInfo } = useQuery({
    queryKey: ["checkout-main-id", id, "order-list-info"],
    queryFn: () => getMainCheckOutByMainCheckOutId(id),
    enabled: shouldFetchDetailInfo,
    retry: false,
  });
  const detailFileEntries = detailOrder
    ? getOrderInfoFileEntries({
        files: detailOrder.files ?? [],
        product_refund: detailOrder.product_refund,
      })
    : [];
  const effectiveFileEntries =
    fileEntries.length > 0 ? fileEntries : detailFileEntries;
  const effectiveNoteText = noteText || detailOrder?.note?.trim();
  const imageFiles = effectiveFileEntries.filter((entry) =>
    isImageUrl(entry.url),
  );
  const documentFiles = effectiveFileEntries.filter(
    (entry) => !isImageUrl(entry.url),
  );
  const hasInfo = Boolean(effectiveNoteText || effectiveFileEntries.length > 0);
  const showInfoTrigger = hasInfo || (shouldFetchDetailInfo && isFetchingDetailInfo);
  const [infoCardPosition, setInfoCardPosition] =
    useState<OrderInfoCardPosition | null>(null);
  const closeInfoCardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const cancelCloseInfoCard = useCallback(() => {
    if (!closeInfoCardTimeoutRef.current) return;
    clearTimeout(closeInfoCardTimeoutRef.current);
    closeInfoCardTimeoutRef.current = null;
  }, []);
  const openInfoCard = useCallback(
    (target: HTMLElement) => {
      cancelCloseInfoCard();
      setInfoCardPosition(getOrderInfoCardPosition(target.getBoundingClientRect()));
    },
    [cancelCloseInfoCard],
  );
  const scheduleCloseInfoCard = useCallback(() => {
    cancelCloseInfoCard();
    closeInfoCardTimeoutRef.current = setTimeout(() => {
      setInfoCardPosition(null);
      closeInfoCardTimeoutRef.current = null;
    }, 120);
  }, [cancelCloseInfoCard]);

  return (
    <div className="flex justify-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => router.push(`/admin/orders/${id}`, { locale })}
      >
        <Eye className="w-4 h-4" stroke="#F7941D" />
      </Button>

      {showInfoTrigger && (
        <>
          <Button
            variant="ghost"
            size="icon"
            aria-label="View order information"
            onMouseEnter={(event) => openInfoCard(event.currentTarget)}
            onMouseLeave={scheduleCloseInfoCard}
            onFocus={(event) => openInfoCard(event.currentTarget)}
            onBlur={scheduleCloseInfoCard}
          >
            <CircleAlert className="w-4 h-4 text-blue-600" />
          </Button>
          {infoCardPosition && typeof document !== "undefined" &&
            createPortal(
              <div
                onMouseEnter={cancelCloseInfoCard}
                onMouseLeave={scheduleCloseInfoCard}
                className="fixed z-[1000] w-[460px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 text-slate-950 shadow-2xl"
                style={{
                  top: infoCardPosition.top,
                  left: infoCardPosition.left,
                  maxHeight: infoCardPosition.maxHeight,
                }}
              >
            <div className="border-b border-slate-100 px-4 py-3">
              <div className="text-sm font-semibold">
                Order info {marketplaceOrderId ? `#${marketplaceOrderId}` : ""}
              </div>
              <div className="text-xs text-slate-500">
                Note, images and uploaded files
              </div>
            </div>

            <div
              className="space-y-4 overflow-y-auto p-4"
              style={{ maxHeight: Math.max(160, infoCardPosition.maxHeight - 72) }}
            >
              <section className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Note
                </div>
                {effectiveNoteText ? (
                  <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm whitespace-pre-wrap break-words">
                    {effectiveNoteText}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 p-3 text-sm text-slate-500">
                    No note.
                  </div>
                )}
              </section>

              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Images
                  </div>
                  <span className="text-xs text-slate-400">
                    {imageFiles.length}
                  </span>
                </div>
                {imageFiles.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {imageFiles.map((entry) => {
                      const fileName = getFileNameFromUrl(entry.url);

                      return (
                        <a
                          key={entry.key}
                          href={entry.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-blue-300"
                        >
                          <div className="relative h-24 w-full bg-slate-100">
                            <Image
                              src={entry.url}
                              alt={fileName}
                              fill
                              sizes="150px"
                              unoptimized
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                          <div className="truncate px-2 py-1.5 text-xs text-slate-600">
                            {fileName}
                          </div>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 p-3 text-sm text-slate-500">
                    No images.
                  </div>
                )}
              </section>

              <section className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Files
                  </div>
                  <span className="text-xs text-slate-400">
                    {documentFiles.length}
                  </span>
                </div>
                {documentFiles.length > 0 ? (
                  <div className="space-y-2">
                    {documentFiles.map((entry) => {
                      const fileName = getFileNameFromUrl(entry.url);

                      return (
                        <a
                          key={entry.key}
                          href={entry.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:border-blue-300 hover:bg-blue-50"
                        >
                          <FileText className="size-4 shrink-0 text-slate-500" />
                          <span className="min-w-0 flex-1 truncate">
                            {fileName}
                          </span>
                          <ExternalLink className="size-3.5 shrink-0 text-slate-400" />
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 p-3 text-sm text-slate-500">
                    No files.
                  </div>
                )}
              </section>
            </div>
              </div>,
              document.body,
            )}
        </>
      )}

      {/* Expand button */}
      <Button
        variant={"ghost"}
        type="button"
        onClick={() => {
          if (!currentRowId) return;
          if (toggleExpandedRow) {
            toggleExpandedRow(currentRowId);
            return;
          }
          setExpandedRowId?.(isExpanded ? null : currentRowId);
        }}
        className="p-1"
      >
        {isExpanded ? (
          <ChevronDown className="size-4 text-gray-600" />
        ) : (
          <ChevronRight className="size-4 text-gray-600" />
        )}
      </Button>
    </div>
  );
};

const ActionCellChild = ({
  checkout,
  items,
  checkoutId,
  checkoutMainCode,
  isSupplier = false,
  expandedRowId,
  setExpandedRowId,
  toggleExpandedRow,
  isRowExpanded,
  currentRowId,
  status,
}: {
  checkout: CheckOut;
  items: CartItem[];
  checkoutId: string;
  checkoutMainCode?: string | null;
  isSupplier?: boolean;
  expandedRowId?: string | null;
  setExpandedRowId?: (id: string | null) => void;
  toggleExpandedRow?: (id: string) => void;
  isRowExpanded?: (id: string) => boolean;
  currentRowId?: string;
  status?: string;
}) => {
  const isExpanded = currentRowId
    ? (isRowExpanded?.(currentRowId) ?? expandedRowId === currentRowId)
    : false;

  const normalizeDeliveryItems = (cartItems: CartItem[]): CartItem[] => {
    return cartItems.flatMap((item) => {
      const bundles = item?.products?.bundles;
      const parentQuantity = Number(item?.quantity ?? 0);

      if (!Array.isArray(bundles) || bundles.length === 0) {
        return item;
      }

      const normalizedBundleItems = bundles
        .map((bundle) => {
          const bundleItem = bundle?.bundle_item;
          const quantityPerBundle = Number(bundle?.quantity ?? 0);

          if (!bundleItem || quantityPerBundle <= 0) return null;

          const normalizedQuantity = Math.max(
            0,
            parentQuantity * quantityPerBundle,
          );
          const normalizedUnitPrice = toNumber(
            bundleItem?.final_price ?? item?.item_price,
          );

          return {
            ...item,
            products: bundleItem,
            quantity: normalizedQuantity,
            item_price: normalizedUnitPrice,
            final_price: normalizedUnitPrice * normalizedQuantity,
          } as CartItem;
        })
        .filter((bundleItem): bundleItem is CartItem => bundleItem !== null);

      return normalizedBundleItems.length > 0 ? normalizedBundleItems : item;
    });
  };

  const normalizedItems = normalizeDeliveryItems(
    Array.isArray(items) ? items : [],
  );

  const escapeXml = (value: unknown) => {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  };

  const handleDownloadXml = () => {
    const marketplace = (checkout?.from_marketplace ?? "").toLowerCase();
    const orderReference =
      checkoutMainCode?.trim() ||
      checkout?.checkout_code ||
      checkout?.shipment?.ship_code ||
      "";
    const shippingAddress = checkout?.shipping_address;
    const customerName = shippingAddress?.recipient_name ?? "";
    const warehouseName = checkout?.ware_house ?? "";
    const positions = normalizedItems;

    const positionsXml = positions
      .map((item) => {
        const lineItemId =
          (
            item as CartItem & {
              line_item_id?: string | null;
              products?: { line_item_id?: string | null };
            }
          )?.line_item_id ??
          (
            item as CartItem & {
              line_item_id?: string | null;
              products?: { line_item_id?: string | null };
            }
          )?.products?.line_item_id ??
          "";

        const sku = item?.products?.sku ?? "";
        const name = item?.products?.name ?? "";
        const quantity = Number(item?.quantity ?? 0);

        return [
          "        <Position>",
          `            <Referenz>${escapeXml(lineItemId)}</Referenz>`,
          `            <Artikel>${escapeXml(sku)}</Artikel>`,
          `            <Bezeichner>${escapeXml(name)}</Bezeichner>`,
          `            <Menge_SOLL>${escapeXml(Number.isFinite(quantity) ? quantity : 0)}</Menge_SOLL>`,
          "        </Position>",
        ].join("\n");
      })
      .join("\n");

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      "<Lieferauftrag>",
      "    <Kopfdaten>",
      "        <Mandant>243</Mandant>",
      `        <Auftrag>${escapeXml(orderReference)}</Auftrag>`,
      `        <Lager>${escapeXml(warehouseName)}</Lager>`,
      `        <Auftraggeber>${escapeXml(marketplace)}</Auftraggeber>`,
      `        <Kunde>${escapeXml(customerName)}</Kunde>`,
      `        <Versandname1>${escapeXml(shippingAddress?.recipient_name ?? "")}</Versandname1>`,
      "        <Versandname2/>",
      `        <Versandstrasse>${escapeXml(shippingAddress?.address_line ?? "")}</Versandstrasse>`,
      `        <Versandplz>${escapeXml(shippingAddress?.postal_code ?? "")}</Versandplz>`,
      `        <Versandort>${escapeXml(shippingAddress?.city ?? "")}</Versandort>`,
      `        <Versandland>${escapeXml(shippingAddress?.country ?? "")}</Versandland>`,
      `        <Versandart>${escapeXml(checkout?.carrier ?? "")}</Versandart>`,
      `        <Telefon>${escapeXml(shippingAddress?.phone_number ?? "")}</Telefon>`,
      `        <Mail>${escapeXml(shippingAddress?.email ?? "")}</Mail>`,
      "    </Kopfdaten>",
      "    <Positionen>",
      positionsXml,
      "    </Positionen>",
      "</Lieferauftrag>",
    ].join("\n");

    const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileName = `delivery-order-${checkout?.shipment?.ship_code || checkoutId}.xml`;

    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex justify-center items-center gap-2">
      {/* Eye Icon */}
      {!isSupplier && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-amber-50">
              <Eye className="w-4 h-4 text-amber-500" />
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[96vw] max-w-[1150px] p-0">
            <DialogHeader className="border-b px-6 py-4">
              <DialogTitle>Delivery Order Items</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {normalizedItems.length} Positionen im Auftrag
              </p>
            </DialogHeader>
            <div className="px-6 py-4">
              <ProductTable
                data={normalizedItems}
                columns={deliveryPreviewColumns}
                page={1}
                pageSize={100}
                setPage={() => {}}
                setPageSize={() => {}}
                hasPagination={false}
                totalItems={normalizedItems.length}
                totalPages={1}
                hasHeaderBackGround
                hasBackground
                hasCount={false}
                isSticky
                stickyContainerClassName="max-h-[52vh]"
              />
            </div>
            <DialogFooter className="border-t px-6 py-4">
              <DialogClose asChild>
                <Button variant="secondary">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {status?.toLowerCase() === "exchange" && (
        <CancelExchangeDialog id={checkoutId} main_checkout_id={checkoutId} />
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={handleDownloadXml}
            className="hover:bg-amber-50"
          >
            <Download className="w-4 h-4 text-amber-500" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>download xml</TooltipContent>
      </Tooltip>

      {/* Expand button */}
      <Button
        variant={"ghost"}
        type="button"
        onClick={() => {
          if (!currentRowId) return;
          if (toggleExpandedRow) {
            toggleExpandedRow(currentRowId);
            return;
          }
          setExpandedRowId?.(isExpanded ? null : currentRowId);
        }}
        className="p-1"
      >
        {isExpanded ? (
          <ChevronDown className="size-4 text-gray-600" />
        ) : (
          <ChevronRight className="size-4 text-gray-600" />
        )}
      </Button>
    </div>
  );
};

export const orderColumns: ColumnDef<CheckOutMain>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ORDER ID",
    cell: ({ row }) => {
      return <div>#{row.original.checkout_code}</div>;
    },
  },
  {
    accessorKey: "external_id",
    header: "EXTERNAL ID",
    cell: ({ row }) => {
      return <div>{row.original.marketplace_order_id}</div>;
    },
  },

  {
    accessorKey: "customer",
    header: "CUSTOMER",
    cell: ({ row }) => {
      const primaryCheckout = row.original.checkouts?.[0];
      const user = primaryCheckout?.user;
      const shippingAddress = primaryCheckout?.shipping_address;
      const invoiceAddress = primaryCheckout?.invoice_address;
      const postalCity = formatPostalCityCountry(
        shippingAddress?.postal_code,
        shippingAddress?.city,
        shippingAddress?.country,
      );
      const displayName =
        shippingAddress?.recipient_name?.trim() ||
        user?.company_name?.trim() ||
        invoiceAddress?.recipient_name?.trim() ||
        "";
      const displayEmail = getOrderCustomerEmail(row.original, primaryCheckout);

      return (
        <div>
          <div>{displayName}</div>
          {postalCity ? (
            <div className="text-xs text-slate-500">{postalCity}</div>
          ) : null}
          {displayEmail ? (
            <div className="text-xs text-slate-500">{displayEmail}</div>
          ) : null}
        </div>
      );
    },
  },
  {
    accessorKey: "channel",
    header: () => <div className="text-center w-full">CHANNEL</div>,
    cell: ({ row }) => {
      const currentChanel = row.original.from_marketplace;
      const channelLogo =
        listChanel.find((ch) => ch.name === currentChanel)?.icon ||
        "new-logo.svg";
      return (
        <div className="h-12 relative">
          <Image
            src={`/${channelLogo}`}
            alt="icon"
            fill
            className="object-contain p-2"
            unoptimized
          />
        </div>
      );
    },
  },

  {
    accessorKey: "created_at",
    header: () => <div className="text-center w-full">DATE CREATED</div>,
    cell: ({ row }) => {
      let iso = row.original.created_at.toString();

      // 👉 Nếu backend không gửi Z, mình thêm vào để JS parse đúng UTC
      if (!iso.endsWith("Z")) {
        iso += "Z";
      }

      const date = new Date(iso);

      const time = date.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Europe/Berlin", // giờ Berlin
      });

      const day = date.toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Europe/Berlin",
      });

      return (
        <div className="flex flex-col items-center text-xs text-[#4D4D4D]">
          <span>{day}</span>
          <span>{time}</span>
        </div>
      );
    },
  },

  {
    accessorKey: "delivery_range",
    header: () => <div className="text-center w-full">ESTIMATED DELIVERY</div>,
    cell: ({ row }) => (
      <div className="text-center text-[#4D4D4D]">
        {formatDeliveryRangeLabel(
          row.original.delivery_from,
          row.original.delivery_to,
        )}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center w-full">STATUS</div>,
    cell: ({ row }) => {
      const raw = row.original.status?.toLowerCase() ?? "";
      const { text, bg, color } = getStatusStyle(raw);

      return (
        <div
          className={`mx-auto px-4 py-1 rounded-full text-sm font-medium capitalize ${bg} ${color}`}
          style={{ width: "fit-content" }}
        >
          {text}
        </div>
      );
    },
  },
  {
    accessorKey: "tag",
    header: () => <div className="text-center w-full">TAG</div>,
    cell: ({ row }) => {
      const tagBadges = buildOrderTagBadges(row.original);

      if (tagBadges.length === 0) {
        return <div />;
      }

      return (
        <div className="mx-auto flex w-fit flex-wrap items-center justify-center gap-1">
          {tagBadges.map((tagBadge) => (
            <div
              key={tagBadge.label}
              title={tagBadge.label}
              className={`rounded-[4px] px-2 py-1 text-xs font-semibold leading-none text-white ${tagBadge.bgClass}`}
            >
              {tagBadge.code}
            </div>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "value",
    header: () => <div className="text-center w-full">INVOICE</div>,
    cell: ({ row }) => {
      return (
        <div className="flex gap-1 items-center justify-end">
          <div
            className={`${
              row.original.total_amount < 0 ? "text-red-500" : "text-[#4D4D4D]"
            }`}
          >
            €
            {row.original.total_amount.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          {/* <ViewFileDialog
            checkoutId={row.original.id}
            type="invoice"
          /> */}
        </div>
      );
    },
  },
  {
    accessorKey: "ext_invoice_id",
    header: () => <div className="text-center w-full">INVOICE NUMBER</div>,
    cell: ({ row }) => {
      const extInvoiceId = String(row.original.ext_invoice_id ?? "").trim();
      return <div className="text-center">{extInvoiceId || "-"}</div>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center w-full">ACTIONS</div>,
    cell: ({ row, table }) => (
      <ActionCell
        id={row.original.id}
        expandedRowId={table.options.meta?.expandedRowId || null}
        setExpandedRowId={table.options.meta?.setExpandedRowId || (() => {})}
        toggleExpandedRow={table.options.meta?.toggleExpandedRow}
        isRowExpanded={table.options.meta?.isRowExpanded}
        currentRowId={row.id}
        note={row.original.note}
        files={row.original.files}
        productRefund={row.original.product_refund}
        status={row.original.status}
        refundAmount={row.original.refund_amount}
        marketplaceOrderId={row.original.checkout_code}
      />
    ),
  },
];

export const customerOrderColumns: ColumnDef<CheckOutMain>[] = [
  {
    accessorKey: "id",
    header: "ORDER ID",
    cell: ({ row }) => {
      return <div>#{row.original.checkout_code}</div>;
    },
  },
  {
    accessorKey: "external_id",
    header: "EXTERNAL ID",
    cell: ({ row }) => {
      return <div>{row.original.marketplace_order_id}</div>;
    },
  },
  {
    accessorKey: "customer",
    header: "CUSTOMER",
    cell: ({ row }) => {
      const primaryCheckout = row.original.checkouts?.[0];
      const shippingAddress = primaryCheckout?.shipping_address;
      const postalCity = formatPostalCityCountry(
        shippingAddress?.postal_code,
        shippingAddress?.city,
        shippingAddress?.country,
      );
      const firstName = primaryCheckout?.user?.first_name ?? "";
      const lastName = primaryCheckout?.user?.last_name ?? "";
      const email = getOrderCustomerEmail(row.original, primaryCheckout);

      return (
        <div>
          <div className="capitalize">{`${firstName} ${lastName}`.trim()}</div>
          {postalCity ? (
            <div className="text-xs text-slate-500">{postalCity}</div>
          ) : null}
          {email ? <div className="text-xs text-slate-500">{email}</div> : null}
        </div>
      );
    },
  },

  {
    accessorKey: "channel",
    header: () => <div className="text-center w-full">CHANNEL</div>,
    cell: ({ row }) => {
      const currentChanel = row.original.from_marketplace;
      const channelLogo =
        listChanel.find((ch) => ch.name === currentChanel)?.icon ||
        "new-logo.svg";
      return (
        <div className="h-12 relative">
          <Image
            src={`/${channelLogo}`}
            alt="icon"
            fill
            className="object-contain p-2"
            unoptimized
          />
        </div>
        // <div className="text-center capitalize font-semibold">{row.original.from_marketplace ? row.original.from_marketplace : 'Prestige Home'}</div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: () => <div className="text-center w-full">DATE CREATED</div>,
    cell: ({ row }) => {
      let iso = row.original.created_at.toString();

      // 👉 Nếu backend không gửi Z, mình thêm vào để JS parse đúng UTC
      if (!iso.endsWith("Z")) {
        iso += "Z";
      }

      const date = new Date(iso);

      const time = date.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Europe/Berlin", // giờ Berlin
      });

      const day = date.toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Europe/Berlin",
      });

      return (
        <div className="flex flex-col items-center text-xs text-[#4D4D4D]">
          <span>{day}</span>
          <span>{time}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center w-full">STATUS</div>,
    cell: ({ row }) => {
      const raw = row.original.status?.toLowerCase() ?? "";
      const { text, bg, color } = getStatusStyle(raw);

      return (
        <div
          className={`mx-auto px-4 py-1 rounded-full text-sm font-medium capitalize ${bg} ${color}`}
          style={{ width: "fit-content" }}
        >
          {text}
        </div>
      );
    },
  },

  {
    accessorKey: "value",
    header: () => <div className="text-center w-full">INVOICE</div>,
    cell: ({ row }) => {
      return (
        <div className="flex gap-1 items-center justify-end">
          <div
            className={`${
              row.original.total_amount < 0 ? "text-red-500" : "text-[#4D4D4D]"
            }`}
          >
            €
            {row.original.total_amount.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          {/* {row.original.status === "Pending" ? (
            ""
          ) : (
            <ViewFileDialog checkoutId={row.original.id} type="invoice" />
          )} */}
        </div>
      );
    },
  },
  {
    accessorKey: "ext_invoice_id",
    header: () => <div className="text-center w-full">INVOICE NUMBER</div>,
    cell: ({ row }) => {
      const extInvoiceId = String(row.original.ext_invoice_id ?? "").trim();
      return <div className="text-center">{extInvoiceId || "-"}</div>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center w-full">ACTIONS</div>,
    cell: ({ row, table }) => (
      <ActionCell
        id={row.original.id}
        expandedRowId={table.options.meta?.expandedRowId || null}
        setExpandedRowId={table.options.meta?.setExpandedRowId || (() => {})}
        toggleExpandedRow={table.options.meta?.toggleExpandedRow}
        isRowExpanded={table.options.meta?.isRowExpanded}
        currentRowId={row.id}
        note={row.original.note}
        files={row.original.files}
        productRefund={row.original.product_refund}
        status={row.original.status}
        refundAmount={row.original.refund_amount}
        marketplaceOrderId={row.original.checkout_code}
      />
    ),
  },
];

export const getOrderChildColumns = (
  checkoutMainCode?: string | null,
): ColumnDef<CheckOut>[] => [
  {
    accessorKey: "id",
    header: "DELIVERY ORDER ID",
    cell: ({ row }) => {
      return <div>#{row.original.checkout_code}</div>;
    },
  },
  {
    accessorKey: "owner",
    header: ({}) => <div className="text-center">SUPPLIER</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.original?.supplier?.business_name
            ? row.original?.supplier?.business_name
            : "Prestige Home"}
        </div>
      );
    },
  },

  {
    accessorKey: "created_at",
    header: () => <div className="text-center w-full">SHIPPED DATE</div>,
    cell: ({ row }) => {
      const rawShipperDate = row.original?.shipment?.shipper_date;
      const isoRaw =
        rawShipperDate === null || rawShipperDate === undefined
          ? ""
          : String(rawShipperDate).trim();

      if (!isoRaw) return <div className="text-center">-</div>;

      let iso = isoRaw;

      // 👉 Nếu backend không gửi Z, mình thêm vào để JS parse đúng UTC
      if (!iso.endsWith("Z")) {
        iso += "Z";
      }

      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) {
        return <div className="text-center">-</div>;
      }

      const time = date.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Europe/Berlin", // giờ Berlin
      });

      const day = date.toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Europe/Berlin",
      });

      return (
        <div className="flex flex-col items-center text-xs text-[#4D4D4D]">
          <span>{day}</span>
          <span>{time}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "tracking_number",
    header: ({}) => <div className="text-center">TRACKING NUMBER</div>,
    cell: ({ row }) => {
      const trackingNumber = row.original?.shipment?.tracking_number;
      const shippingCarrier = (
        row.original?.shipment?.shipping_carrier ?? ""
      ).toLowerCase();
      const hasTrackingNumber =
        trackingNumber !== null &&
        trackingNumber !== undefined &&
        String(trackingNumber).trim() !== "";
      const encodedTrackingNumber = encodeURIComponent(String(trackingNumber));

      let trackingLink = `https://trackandtrace.cepra.de/Track/${encodedTrackingNumber}?language=de&culture=DE`;

      if (shippingCarrier === "dpd") {
        trackingLink = `https://tracking.dpd.de/status/de_DE/parcel/${encodedTrackingNumber}`;
      } else if (shippingCarrier === "dhl") {
        trackingLink = `https://www.dhl.de/de/privatkunden/dhl-sendungsverfolgung.html?piececode=${encodedTrackingNumber}`;
      } else if (shippingCarrier === "gls") {
        trackingLink = `https://www.gls-pakete.de/reach-sendungsverfolgung?trackingNumber=${encodedTrackingNumber}`;
      }

      return (
        <div className="flex items-center justify-center gap-1">
          <span className="select-text">
            {hasTrackingNumber ? String(trackingNumber) : "-"}
          </span>
          {hasTrackingNumber ? (
            <Link
              className="inline-flex items-center text-[#4D4D4D] hover:text-[#1a73e8]"
              href={trackingLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open tracking ${String(trackingNumber)}`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          ) : null}
        </div>
      );
    },
  },
  {
    accessorKey: "ship_code",
    header: ({}) => <div className="text-center">SHIPPING CODE</div>,
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.original?.shipment ? row.original?.shipment?.ship_code : ""}
        </div>
      );
    },
  },
  {
    accessorKey: "carrier",
    header: () => <div className="text-center w-full">CARRIER</div>,
    cell: ({ row }) => (
      <div className="text-center uppercase">
        {row.original.shipment
          ? row.original.shipment.shipping_carrier
          : row.original.carrier}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <div className="text-center w-full">STATUS</div>,
    cell: ({ row }) => {
      const checkoutStatus = row.original.status?.toLowerCase().trim() ?? "";
      const shipmentStatus =
        row.original.shipment?.status?.toLowerCase().trim() ?? "";

      const exchangeStatusToBaseStatus: Record<string, string> = {
        exchange: "payment received",
        cancel_exchange: "canceled",
        exchange_stock_reserved: "tock_reserved",
        exchange_shipped: "shipped",
        exchange_preparation_shipping: "preparation_shipping",
        exchange_cancel_no_stock: "canceled_no_stock",
      };

      const shouldUseCheckoutStatus = Object.prototype.hasOwnProperty.call(
        exchangeStatusToBaseStatus,
        checkoutStatus,
      );

      const displayStatus = shouldUseCheckoutStatus
        ? getStatusStyle(exchangeStatusToBaseStatus[checkoutStatus]).text
        : (shipmentStatus || "pending").replaceAll("_", " ");

      return <div className="text-center capitalize">{displayStatus}</div>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center w-full">ACTIONS</div>,
    cell: ({ row, table }) => (
      <ActionCellChild
        checkout={row.original}
        checkoutId={row.original.id}
        checkoutMainCode={checkoutMainCode}
        items={row.original.cart.items}
        expandedRowId={table.options.meta?.expandedRowId || null}
        setExpandedRowId={table.options.meta?.setExpandedRowId || (() => {})}
        toggleExpandedRow={table.options.meta?.toggleExpandedRow}
        isRowExpanded={table.options.meta?.isRowExpanded}
        currentRowId={row.id}
        status={row.original.status}
      />
    ),
  },
];

export const orderChildColumns = getOrderChildColumns();
