"use client";
export const ssr = false;

import DocumentTable from "@/components/layout/admin/orders/order-details/document/document-table";
import OrderDeliveryOrder from "@/components/layout/admin/orders/order-details/order-delivery-order";
import OrderSummary from "@/components/layout/admin/orders/order-details/order-summary";
import OrderDetailOverView from "@/components/layout/admin/orders/order-details/order-overview";
import OrderDetailUser from "@/components/layout/admin/orders/order-details/order-customer";
import { ProductTable } from "@/components/layout/admin/products/products-list/product-table";
import AdminBackButton from "@/components/layout/admin/admin-back-button";
import {
  useGetProductRefundByMainCheckoutId,
  useGetMainCheckOutByMainCheckOutId,
  useUploadCheckoutFiles,
  useUpdateIsClaimedFactoryMainCheckout,
  useUpdateIsClaimedMarketplaceMainCheckout,
  useUpdateNoteForMainCheckout,
} from "@/features/checkout/hook";
import { useUploadStaticFile } from "@/features/file/hook";
import { getInvoiceByCheckOut } from "@/features/invoice/api";
import { formatDate, formatDateTimeString } from "@/lib/date-formated";
import { CartItem } from "@/types/cart";
import { CheckOutMain } from "@/types/checkout";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import OrderDetailsSkeleton from "./skeleton";
import { calculateOrderTaxWithDiscount } from "@/lib/caculate-vat";
import { getOrderDetailColumns } from "@/components/layout/admin/orders/order-details/columns";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Factory,
  FileText,
  PackageSearch,
  RefreshCw,
  Store,
  Trash2,
  Upload,
} from "lucide-react";
import { StaticFile } from "@/types/products";

function extractCartItemsFromMain(checkOutMain: CheckOutMain): CartItem[] {
  if (!checkOutMain?.checkouts) return [];

  return (
    checkOutMain.checkouts
      // lọc bỏ exchange + cancel_exchange
      .filter((checkout) => {
        const status = checkout.status?.toLowerCase();
        return status !== "exchange" && status !== "cancel_exchange";
      })
      // sau đó mới lấy cart items
      .flatMap((checkout) =>
        checkout.cart.items.flatMap((cartGroup) => cartGroup),
      )
  );
}

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

function toSafeNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: unknown) {
  return `€${toSafeNumber(value).toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const OrderDetails = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [noteValue, setNoteValue] = useState("");
  const [isDragOverFiles, setIsDragOverFiles] = useState(false);
  const [orderFilesState, setOrderFilesState] = useState<StaticFile[]>([]);
  const [pendingDeleteFileUrl, setPendingDeleteFileUrl] = useState<
    string | null
  >(null);
  const [pendingClaimTarget, setPendingClaimTarget] = useState<
    "factory" | "marketplace" | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const params = useParams<{ id: string }>(); // type-safe
  const checkoutId = params?.id;
  const updateNoteMutation = useUpdateNoteForMainCheckout();
  const uploadStaticFileMutation = useUploadStaticFile();
  const uploadCheckoutFilesMutation = useUploadCheckoutFiles();
  const updateIsClaimedFactoryMutation = useUpdateIsClaimedFactoryMainCheckout();
  const updateIsClaimedMarketplaceMutation =
    useUpdateIsClaimedMarketplaceMainCheckout();

  const {
    data: order,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetMainCheckOutByMainCheckOutId(checkoutId);
  const { data: productRefundData, isLoading: isLoadingProductRefund } =
    useGetProductRefundByMainCheckoutId(checkoutId);

  const { data: invoice } = useQuery({
    queryKey: ["invoice-checkout", checkoutId],
    queryFn: () => getInvoiceByCheckOut(checkoutId as string),
    enabled: !!checkoutId,
    retry: false,
  });

  const cartItems = useMemo(() => {
    if (!order) return [];
    return extractCartItemsFromMain(order);
  }, [order]);
  const checkoutCountryCode = useMemo(
    () =>
      order?.checkouts?.[0]?.shipping_address?.country ??
      order?.checkouts?.[0]?.invoice_address?.country ??
      "DE",
    [order],
  );
  const checkoutTaxId = useMemo(
    () =>
      order?.checkouts?.[0]?.user?.tax_id ??
      invoice?.main_checkout?.checkouts?.[0]?.user?.tax_id ??
      "",
    [invoice?.main_checkout?.checkouts, order],
  );
  const orderTaxSummary = useMemo(
    () =>
      calculateOrderTaxWithDiscount(
        cartItems,
        Number(invoice?.voucher_amount ?? order?.voucher_amount ?? 0),
        checkoutCountryCode,
        checkoutTaxId,
        Number(order?.total_shipping ?? 0),
      ),
    [
      cartItems,
      checkoutCountryCode,
      checkoutTaxId,
      invoice?.voucher_amount,
      order?.total_shipping,
      order?.voucher_amount,
    ],
  );
  const orderVatRows = useMemo(() => {
    const rows = (orderTaxSummary?.buckets ?? [])
      .map((bucket) => {
        const rawRate = Number(bucket?.vatRate) || 0;
        const normalizedRate = rawRate > 1 ? rawRate / 100 : rawRate;
        const percent = normalizedRate * 100;
        const gross = Number(bucket?.gross) || 0;
        const netFromGross =
          normalizedRate > 0 ? gross / (1 + normalizedRate) : gross;
        const vatFromGross =
          normalizedRate > 0 ? netFromGross * normalizedRate : 0;

        return {
          percent,
          vat: Number.isFinite(vatFromGross) ? vatFromGross : 0,
        };
      })
      .filter((row) => Number.isFinite(row.percent))
      .sort((a, b) => b.percent - a.percent);

    if (rows.length > 0) return rows;

    return [
      {
        percent: 0,
        vat: Number(orderTaxSummary?.totalVat) || 0,
      },
    ];
  }, [orderTaxSummary]);
  const productRefunds = useMemo(
    () =>
      Array.isArray(productRefundData)
        ? productRefundData.filter((item) => item && typeof item === "object")
        : [],
    [productRefundData],
  );
  const totalProductRefundAmount = useMemo(
    () =>
      productRefunds.reduce(
        (sum, item) => sum + toSafeNumber(item?.refund_amount),
        0,
      ),
    [productRefunds],
  );
  const refundFileUrls = useMemo(
    () =>
      productRefunds.flatMap((item) => {
        const files = Array.isArray(item?.files) ? item.files : [];

        return files
          .map((file) => (file?.url ?? "").trim())
          .filter((url): url is string => Boolean(url));
      }),
    [productRefunds],
  );
  const orderFiles = useMemo(() => orderFilesState ?? [], [orderFilesState]);
  const checkoutFileEntries = useMemo(
    () =>
      orderFiles
        .map((file, index) => ({
          index,
          url: (file?.url ?? "").trim(),
          source: "checkout" as const,
        }))
        .filter((entry) => Boolean(entry.url)),
    [orderFiles],
  );
  const refundFileEntries = useMemo(
    () =>
      refundFileUrls.map((url) => ({
        index: -1,
        url,
        source: "refund" as const,
      })),
    [refundFileUrls],
  );
  const orderFileEntries = useMemo(() => {
    const dedupedEntries = new Map<
      string,
      { index: number; url: string; source: "checkout" | "refund" }
    >();

    refundFileEntries.forEach((entry) => {
      if (!dedupedEntries.has(entry.url)) dedupedEntries.set(entry.url, entry);
    });

    checkoutFileEntries.forEach((entry) => {
      dedupedEntries.set(entry.url, entry);
    });

    return Array.from(dedupedEntries.values());
  }, [checkoutFileEntries, refundFileEntries]);
  const imageOrderFiles = useMemo(
    () => orderFileEntries.filter((entry) => isImageUrl(entry.url)),
    [orderFileEntries],
  );
  const documentOrderFiles = useMemo(
    () => orderFileEntries.filter((entry) => !isImageUrl(entry.url)),
    [orderFileEntries],
  );
  const isUploadingFiles =
    uploadStaticFileMutation.isPending || uploadCheckoutFilesMutation.isPending;
  const isSavingFileList = uploadCheckoutFilesMutation.isPending;
  const isUpdatingClaim =
    updateIsClaimedFactoryMutation.isPending ||
    updateIsClaimedMarketplaceMutation.isPending;

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!checkoutId) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const uploadResult = await uploadStaticFileMutation.mutateAsync(formData);
      const uploadedUrls =
        uploadResult.results
          ?.map((item) => item.url)
          .filter((url): url is string => Boolean(url)) ?? [];

      if (uploadedUrls.length === 0) {
        toast.error("No uploaded file URL returned");
        return;
      }

      const existingUrls = orderFiles
        .map((file) => (file?.url ?? "").trim())
        .filter((url): url is string => Boolean(url));
      const nextUrls = [...existingUrls, ...uploadedUrls];

      await uploadCheckoutFilesMutation.mutateAsync({
        main_checkout_id: checkoutId,
        payload: nextUrls,
      });
      setOrderFilesState((prev) => [
        ...prev,
        ...uploadedUrls.map((url) => ({ url })),
      ]);
      toast.success("Files uploaded successfully");
    } catch (error) {
      const err = error as {
        response?: { data?: { detail?: unknown; message?: unknown } };
        message?: unknown;
      };

      const message =
        err.response?.data?.detail ??
        err.response?.data?.message ??
        err.message ??
        "Failed to upload files";

      toast.error("Failed to upload files", {
        description: String(message),
      });
    }
  };

  const handleConfirmDeleteOrderFile = async () => {
    if (!checkoutId || !pendingDeleteFileUrl) return;

    const nextFiles = orderFiles.filter(
      (file) => (file?.url ?? "").trim() !== pendingDeleteFileUrl,
    );
    const nextUrls = nextFiles
      .map((file) => (file?.url ?? "").trim())
      .filter((url): url is string => Boolean(url));

    try {
      await uploadCheckoutFilesMutation.mutateAsync({
        main_checkout_id: checkoutId,
        payload: nextUrls,
      });
      setOrderFilesState(nextFiles);
      setPendingDeleteFileUrl(null);
      toast.success("File deleted");
    } catch (error) {
      const err = error as {
        response?: { data?: { detail?: unknown; message?: unknown } };
        message?: unknown;
      };

      const message =
        err.response?.data?.detail ??
        err.response?.data?.message ??
        err.message ??
        "Failed to delete file";

      toast.error("Failed to delete file", {
        description: String(message),
      });
    }
  };

  const handleDropFiles = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOverFiles(false);
    if (isUploadingFiles) return;
    await handleUploadFiles(event.dataTransfer.files);
  };

  const hasNoteChanged = noteValue.trim() !== (order?.note ?? "").trim();
  const isFactoryClaimed = Boolean(order?.is_claimed_factory);
  const isMarketplaceClaimed = Boolean(order?.is_claimed_marketplace);

  const handleConfirmClaim = async () => {
    if (!checkoutId || !pendingClaimTarget) return;

    try {
      if (pendingClaimTarget === "factory") {
        await updateIsClaimedFactoryMutation.mutateAsync({
          main_checkout_id: checkoutId,
          is_claimed: true,
        });
        toast.success("Factory claimed successfully");
      } else {
        await updateIsClaimedMarketplaceMutation.mutateAsync({
          main_checkout_id: checkoutId,
          is_claimed: true,
        });
        toast.success("Marketplace claimed successfully");
      }

      setPendingClaimTarget(null);
    } catch (error) {
      const err = error as {
        response?: { data?: { detail?: unknown; message?: unknown } };
        message?: unknown;
      };

      const message =
        err.response?.data?.detail ??
        err.response?.data?.message ??
        err.message ??
        "Failed to update claimed status";

      toast.error("Failed to update claimed status", {
        description: String(message),
      });
    }
  };

  const handleSaveNote = () => {
    if (!checkoutId) return;

    updateNoteMutation.mutate(
      {
        main_checkout_id: checkoutId,
        note: noteValue.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Note updated");
        },
        onError: () => {
          toast.error("Failed to update note");
        },
      },
    );
  };

  useEffect(() => {
    setNoteValue(order?.note ?? "");
  }, [order?.note]);

  useEffect(() => {
    setOrderFilesState(Array.isArray(order?.files) ? order.files : []);
  }, [order?.files]);

  if (isLoading) return <OrderDetailsSkeleton />;
  if (isError)
    return (
      <div className="space-y-6 pb-10 mt-6">
        <AdminBackButton />
        <div className="flex min-h-[60vh] items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
          <div className="max-w-xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">
              Unable to load order details
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The request may have failed after a long idle period. You can try
              fetching the order again or reload this page.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                className="bg-secondary text-white hover:bg-secondary/90"
                onClick={() => {
                  void refetch();
                }}
                disabled={isFetching}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Reload page
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  if (!order)
    return (
      <div className="space-y-6 pb-10 mt-6">
        <AdminBackButton />
        <div className="flex min-h-[60vh] items-center justify-center rounded-2xl border bg-muted/20 p-6">
          <div className="max-w-xl text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10">
              <PackageSearch className="h-7 w-7 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">
              Order not found
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This order may no longer exist or does not match current filters.
              You can reload and try again.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Button
                type="button"
                className="bg-secondary text-white hover:bg-secondary/90"
                onClick={() => {
                  void refetch();
                }}
                disabled={isFetching}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload data
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Reload page
              </Button>
            </div>
          </div>
        </div>
      </div>
    );

  const createdAt = formatDate(order.created_at);
  const updatedAt = formatDateTimeString(order.updated_at);

  return (
    <div className="space-y-8 pb-20 mt-6">
      <AdminBackButton />

      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-[#fbfefc] to-white p-4 md:p-6 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-3">
          <OrderDetailOverView
            order={order}
            created_at={createdAt}
            updated_at={updatedAt}
            status={order.status}
          />
          <div className="lg:col-span-2 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <OrderDetailUser
              user={order.checkouts[0].user}
              shippingAddress={order.checkouts[0].shipping_address}
              invoiceAddress={order.checkouts[0].invoice_address}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-3 md:p-4 shadow-sm">
        <div className="mb-3 px-1">
          <h3 className="text-base font-semibold text-slate-900">
            Order items
          </h3>
        </div>
        <ProductTable
          data={cartItems}
          columns={getOrderDetailColumns({
            country_code: checkoutCountryCode,
            tax_id: checkoutTaxId,
          })}
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalItems={cartItems.length}
          totalPages={Math.ceil(
            extractCartItemsFromMain(order).length / pageSize,
          )}
          hasPagination={false}
          hasCount={false}
          hasHeaderBackGround
        />
      </section>

      {(isLoadingProductRefund || productRefunds.length > 0) && (
        <section>
          <Accordion
            type="single"
            collapsible
            defaultValue="refund-details"
            className="rounded-2xl border border-slate-200 bg-white px-4 shadow-sm"
          >
            <AccordionItem value="refund-details" className="border-none">
              <AccordionTrigger hasIcon className="py-4">
                <div className="flex w-full items-center justify-between pr-2 text-left">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Refund details
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Product refund information from marketplace response.
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-medium">
                      Items:{" "}
                      {isLoadingProductRefund ? "..." : productRefunds.length}
                    </div>
                    <div className="text-muted-foreground">
                      Total refund:{" "}
                      {isLoadingProductRefund
                        ? "..."
                        : formatCurrency(totalProductRefundAmount)}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant={isFactoryClaimed ? "secondary" : "outline"}
                    className="gap-2"
                    disabled={isUpdatingClaim || isFactoryClaimed}
                    onClick={() => setPendingClaimTarget("factory")}
                  >
                    <Factory className="h-4 w-4" />
                    Factory claimed
                  </Button>
                  <Button
                    type="button"
                    variant={isMarketplaceClaimed ? "secondary" : "outline"}
                    className="gap-2"
                    disabled={isUpdatingClaim || isMarketplaceClaimed}
                    onClick={() => setPendingClaimTarget("marketplace")}
                  >
                    <Store className="h-4 w-4" />
                    Marketplace claimed
                  </Button>
                </div>

                {isLoadingProductRefund ? (
                  <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                    Loading refund details...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    {productRefunds.map((item, index) => (
                      <div
                        key={`${item?.sku ?? "refund"}-${index}`}
                        className="col-span-1 rounded-xl border border-slate-200 bg-slate-50/50 p-3"
                      >
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium">Name:</span>{" "}
                            {item?.name ?? "-"}
                          </div>
                          <div>
                            <span className="font-medium">SKU:</span>{" "}
                            {item?.sku ?? "-"}
                          </div>
                          <div>
                            <span className="font-medium">Quantity:</span>{" "}
                            {toSafeNumber(item?.quantity)}
                          </div>
                          <div>
                            <span className="font-medium">Refund amount:</span>{" "}
                            {formatCurrency(item?.refund_amount)}
                          </div>
                          <div>
                            <span className="font-medium">Reason:</span>{" "}
                            {item?.reason ?? "-"}
                          </div>
                          <div>
                            <span className="font-medium">Type:</span>{" "}
                            {item?.type ?? "-"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      )}

      <Dialog
        open={Boolean(pendingClaimTarget)}
        onOpenChange={(open) => {
          if (!open) setPendingClaimTarget(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {pendingClaimTarget === "factory"
                ? "Confirm factory claimed"
                : "Confirm marketplace claimed"}
            </DialogTitle>
            <DialogDescription>
              {pendingClaimTarget === "factory"
                ? "Are you sure you want to mark this order as FACTORY claimed?"
                : "Are you sure you want to mark this order as MARKETPLACE claimed?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingClaimTarget(null)}
              disabled={isUpdatingClaim}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                void handleConfirmClaim();
              }}
              disabled={isUpdatingClaim}
            >
              {isUpdatingClaim ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          {order.status !== "Pending" ? (
            <div className="flex flex-col gap-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-slate-900">
                    Documents
                  </h3>
                </div>
                <DocumentTable order={order} invoiceCode={invoice?.invoice_code} />
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="space-y-2 w-full">
                  <div className="text-sm font-semibold text-slate-900">
                    Order note
                  </div>
                  <Textarea
                    placeholder="Type note and press Enter to save, or click Save"
                    value={noteValue}
                    disabled={updateNoteMutation.isPending}
                    onChange={(event) => setNoteValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" || event.shiftKey) return;
                      event.preventDefault();
                      handleSaveNote();
                    }}
                  />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      className="bg-secondary text-white hover:bg-secondary/90"
                      onClick={handleSaveNote}
                      disabled={!hasNoteChanged || updateNoteMutation.isPending}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="space-y-3 w-full">
                  <div className="text-sm font-semibold text-slate-900">
                    Order files ({orderFileEntries.length})
                  </div>

                  {orderFileEntries.length === 0 ? (
                    <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                      No files uploaded yet.
                    </div>
                  ) : (
                    <div className="space-y-5 rounded-xl border border-slate-200 p-3">
                      <div className="space-y-2">
                        <div className="text-sm font-semibold">Images</div>
                        {imageOrderFiles.length === 0 ? (
                          <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                            No images uploaded.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-4">
                            {imageOrderFiles.map((entry) => {
                              const url = entry.url;
                              const fileName = getFileNameFromUrl(url);

                              return (
                                <div
                                  key={`image-${url}-${entry.index}`}
                                  className="group relative overflow-hidden rounded-md border border-slate-200"
                                >
                                  <button
                                    type="button"
                                    className="absolute right-2 top-2 z-10 rounded-md bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                                    onClick={(event) => {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      setPendingDeleteFileUrl(url);
                                    }}
                                    disabled={isSavingFileList}
                                    aria-label="Delete file"
                                  >
                                    <Trash2 className="size-4" />
                                  </button>
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="block hover:bg-muted/20"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={url}
                                      alt={fileName}
                                      className="h-44 w-full object-cover"
                                    />
                                    <div className="border-t px-3 py-2 text-sm">
                                      {fileName}
                                    </div>
                                  </a>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="text-sm font-semibold">Files</div>
                        {documentOrderFiles.length === 0 ? (
                          <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                            No documents uploaded.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-4">
                            {documentOrderFiles.map((entry) => {
                              const url = entry.url;
                              const fileName = getFileNameFromUrl(url);

                              return (
                                <div
                                  key={`file-${url}-${entry.index}`}
                                  className="group relative rounded-md border border-slate-200"
                                >
                                  <button
                                    type="button"
                                    className="absolute right-2 top-2 z-10 rounded-md bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                                    onClick={(event) => {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      setPendingDeleteFileUrl(url);
                                    }}
                                    disabled={isSavingFileList}
                                    aria-label="Delete file"
                                  >
                                    <Trash2 className="size-4" />
                                  </button>
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 rounded-md px-3 py-4 hover:bg-muted/20"
                                  >
                                    <FileText className="size-4 text-muted-foreground" />
                                    <span className="line-clamp-2 text-sm">
                                      {fileName}
                                    </span>
                                  </a>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div
                    className={`rounded-md border border-dashed p-4 transition-colors ${
                      isDragOverFiles
                        ? "border-primary bg-primary/5"
                        : "border-input"
                    }`}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      if (isUploadingFiles) return;
                      setIsDragOverFiles(true);
                    }}
                    onDragEnter={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      if (isUploadingFiles) return;
                      setIsDragOverFiles(true);
                    }}
                    onDragLeave={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setIsDragOverFiles(false);
                    }}
                    onDrop={handleDropFiles}
                  >
                    <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
                      <Upload className="size-4" />
                      <span>Drag and drop files here</span>
                      <span>or</span>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isUploadingFiles}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {isUploadingFiles ? "Uploading..." : "Choose files"}
                      </Button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={async (event) => {
                        await handleUploadFiles(event.target.files);
                        event.currentTarget.value = "";
                      }}
                      disabled={isUploadingFiles}
                    />
                  </div>
                </div>
              </div>

              <Dialog
                open={Boolean(pendingDeleteFileUrl)}
                onOpenChange={(open) => {
                  if (!open) setPendingDeleteFileUrl(null);
                }}
              >
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Delete file</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this file?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPendingDeleteFileUrl(null)}
                      disabled={isSavingFileList}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleConfirmDeleteOrderFile}
                      disabled={isSavingFileList}
                    >
                      {isSavingFileList ? "Deleting..." : "Confirm"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          ) : (
            ""
          )}
        </div>
        <div className="lg:col-span-4">
          <OrderSummary
            language={order.checkouts[0].user.language ?? ""}
            sub_total={orderTaxSummary.totalNetWithoutShipping}
            shipping_amount={orderTaxSummary.shipping.net}
            discount_amount={Math.abs(order.voucher_amount)}
            tax={orderTaxSummary.totalVat}
            vat_rows={orderVatRows}
            total_amount={order.total_amount}
            payment_method={order.payment_method}
            entry_date={order.created_at}
            is_Ebay={order.from_marketplace === "ebay" ? true : false}
            refund_amount={order.refund_amount}
          />
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-3 md:p-4 shadow-sm">
        <div className="mb-3 px-1">
          <h3 className="text-base font-semibold text-slate-900">
            Delivery orders
          </h3>
        </div>
        <OrderDeliveryOrder data={order.checkouts} />
      </section>
    </div>
  );
};

export default OrderDetails;
