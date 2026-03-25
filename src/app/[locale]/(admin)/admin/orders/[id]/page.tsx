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
  DialogTrigger,
} from "@/components/ui/dialog";
import { FileText, Trash2, Upload } from "lucide-react";
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

function formatVietnamDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const OrderDetails = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [noteValue, setNoteValue] = useState("");
  const [isDragOverFiles, setIsDragOverFiles] = useState(false);
  const [isFilesDialogOpen, setIsFilesDialogOpen] = useState(false);
  const [orderFilesState, setOrderFilesState] = useState<StaticFile[]>([]);
  const [dialogOrderFiles, setDialogOrderFiles] = useState<StaticFile[]>([]);
  const [hasPendingFileDeletes, setHasPendingFileDeletes] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const params = useParams<{ id: string }>(); // type-safe
  const checkoutId = params?.id;
  const updateNoteMutation = useUpdateNoteForMainCheckout();
  const uploadStaticFileMutation = useUploadStaticFile();
  const uploadCheckoutFilesMutation = useUploadCheckoutFiles();

  const {
    data: order,
    isLoading,
    isError,
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
  const orderFiles = useMemo(() => orderFilesState ?? [], [orderFilesState]);
  const dialogOrderFileEntries = useMemo(
    () =>
      dialogOrderFiles
        .map((file, index) => ({
          file,
          index,
          url: (file?.url ?? "").trim(),
        }))
        .filter((entry) => Boolean(entry.url)),
    [dialogOrderFiles],
  );
  const imageOrderFiles = useMemo(
    () => dialogOrderFileEntries.filter((entry) => isImageUrl(entry.url)),
    [dialogOrderFileEntries],
  );
  const documentOrderFiles = useMemo(
    () => dialogOrderFileEntries.filter((entry) => !isImageUrl(entry.url)),
    [dialogOrderFileEntries],
  );
  const isUploadingFiles =
    uploadStaticFileMutation.isPending || uploadCheckoutFilesMutation.isPending;
  const isSavingFileList = uploadCheckoutFilesMutation.isPending;

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

  const handleStageDeleteOrderFile = (targetIndex: number) => {
    setDialogOrderFiles((prev) =>
      prev.filter((_, index) => index !== targetIndex),
    );
    setHasPendingFileDeletes(true);
  };

  const handleConfirmFileChanges = async () => {
    if (!checkoutId) return;
    if (!hasPendingFileDeletes) {
      setIsFilesDialogOpen(false);
      return;
    }

    const nextUrls = dialogOrderFiles
      .map((file) => (file?.url ?? "").trim())
      .filter((url): url is string => Boolean(url));

    try {
      await uploadCheckoutFilesMutation.mutateAsync({
        main_checkout_id: checkoutId,
        payload: nextUrls,
      });
      setOrderFilesState(dialogOrderFiles);
      setHasPendingFileDeletes(false);
      setIsFilesDialogOpen(false);
      toast.success("File list updated");
    } catch (error) {
      const err = error as {
        response?: { data?: { detail?: unknown; message?: unknown } };
        message?: unknown;
      };

      const message =
        err.response?.data?.detail ??
        err.response?.data?.message ??
        err.message ??
        "Failed to update file list";

      toast.error("Failed to update file list", {
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

  useEffect(() => {
    setNoteValue(order?.note ?? "");
  }, [order?.note]);

  useEffect(() => {
    setOrderFilesState(Array.isArray(order?.files) ? order.files : []);
  }, [order?.files]);

  useEffect(() => {
    if (!isFilesDialogOpen) return;
    setDialogOrderFiles(orderFiles);
    setHasPendingFileDeletes(false);
  }, [isFilesDialogOpen, orderFiles]);

  if (isLoading) return <OrderDetailsSkeleton />;
  if (isError) return <div>Error loading order</div>;
  if (!order) return <div>Error loading order</div>;

  const createdAt = formatDate(order.created_at);
  const updatedAt = formatDateTimeString(order.updated_at);

  return (
    <div className="space-y-12 pb-20 mt-6">
      <AdminBackButton />
      <div className="grid lg:grid-cols-4 grid-cols-2 lg:gap-12 gap-4">
        <OrderDetailOverView
          order={order}
          created_at={createdAt}
          updated_at={updatedAt}
          status={order.status}
        />
        <OrderDetailUser
          user={order.checkouts[0].user}
          shippingAddress={order.checkouts[0].shipping_address}
          invoiceAddress={order.checkouts[0].invoice_address}
        />
      </div>
      <ProductTable
        data={cartItems}
        columns={getOrderDetailColumns({
          country_code:
            order?.checkouts[0]?.shipping_address?.country ??
            order?.checkouts[0]?.invoice_address?.country ??
            "DE",
          tax_id: invoice?.main_checkout.checkouts[0].user.tax_id,
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
      {(isLoadingProductRefund || productRefunds.length > 0) && (
        <Accordion
          type="single"
          collapsible
          className="rounded-lg border bg-white px-4"
        >
          <AccordionItem value="refund-details" className="border-none">
            <AccordionTrigger hasIcon className="py-4">
              <div className="flex w-full items-center justify-between pr-2 text-left">
                <div>
                  <h3 className="text-base font-semibold">Refund details</h3>
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
              {isLoadingProductRefund ? (
                <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                  Loading refund details...
                </div>
              ) : (
                <div className="space-y-3">
                  {productRefunds.map((item, index) => {
                    const files = Array.isArray(item?.files) ? item.files : [];
                    const fileEntries = files
                      .map((file, fileIndex) => {
                        const fileUrl = (file?.url ?? "").trim();
                        if (!fileUrl) return null;

                        return {
                          file,
                          fileIndex,
                          fileUrl,
                          fileName: getFileNameFromUrl(fileUrl),
                          isImage: isImageUrl(fileUrl),
                        };
                      })
                      .filter(
                        (entry): entry is NonNullable<typeof entry> =>
                          entry !== null,
                      );
                    const photoFiles = fileEntries.filter((entry) => entry.isImage);
                    const documentFiles = fileEntries.filter(
                      (entry) => !entry.isImage,
                    );
                    const providerId = item?.id_provider ?? "-";

                    return (
                      <div
                        key={`${item?.sku ?? "refund"}-${index}`}
                        className="rounded-md border p-3"
                      >
                        <div className="grid gap-3 lg:grid-cols-2">
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
                              <span className="font-medium">ID provider:</span>{" "}
                              {providerId}
                            </div>
                            <div>
                              <span className="font-medium">Unit price:</span>{" "}
                              {formatCurrency(item?.unit_price)}
                            </div>
                            <div>
                              <span className="font-medium">
                                Refund amount:
                              </span>{" "}
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

                          <div className="space-y-3">
                            <div className="space-y-2">
                              <div className="text-sm font-medium">
                                Photos ({photoFiles.length})
                              </div>
                              {photoFiles.length === 0 ? (
                                <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                                  No photos
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                                  {photoFiles.map((entry) => (
                                    <div
                                      key={`photo-${entry.fileUrl}-${entry.file?.id ?? entry.fileIndex}`}
                                      className="rounded-md border"
                                    >
                                      <a
                                        href={entry.fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block"
                                      >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={entry.fileUrl}
                                          alt={entry.fileName}
                                          className="h-28 w-full rounded-t-md object-cover"
                                        />
                                      </a>
                                      <div className="border-t bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                                        <div>
                                          Created:{" "}
                                          {formatVietnamDateTime(
                                            entry.file?.created_at,
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="space-y-2">
                              <div className="text-sm font-medium">
                                Files ({documentFiles.length})
                              </div>
                              {documentFiles.length === 0 ? (
                                <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                                  No files
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
                                  {documentFiles.map((entry) => (
                                    <div
                                      key={`doc-${entry.fileUrl}-${entry.file?.id ?? entry.fileIndex}`}
                                      className="rounded-md border"
                                    >
                                      <a
                                        href={entry.fileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 px-3 py-3 text-sm hover:bg-muted/20"
                                      >
                                        <FileText className="size-4 text-muted-foreground" />
                                        <span className="line-clamp-2">
                                          {entry.fileName}
                                        </span>
                                      </a>
                                      <div className="border-t bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                                        <div>
                                          Created:{" "}
                                          {formatVietnamDateTime(
                                            entry.file?.created_at,
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
      <div className="flex justify-between w-full">
        {order.status !== "Pending" ? (
          <div className="flex flex-col gap-4">
            <DocumentTable order={order} invoiceCode={invoice?.invoice_code} />
            <div className="space-y-2 max-w-xl">
              <div className="text-sm font-semibold">Order note</div>
              <Textarea
                placeholder="Type note and press Enter to save"
                value={noteValue}
                disabled={updateNoteMutation.isPending}
                onChange={(event) => setNoteValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" || event.shiftKey) return;
                  event.preventDefault();

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
                }}
              />
              <div className="space-y-2 pt-2">
                <Dialog
                  open={isFilesDialogOpen}
                  onOpenChange={setIsFilesDialogOpen}
                >
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="text-sm font-semibold underline underline-offset-4 decoration-dotted hover:text-primary"
                    >
                      Order files ({orderFiles.length})
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Order files</DialogTitle>
                      <DialogDescription>
                        Uploaded images and documents for this order.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[70vh] overflow-y-auto">
                      {dialogOrderFiles.length === 0 ? (
                        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                          No files uploaded yet.
                        </div>
                      ) : (
                        <div className="space-y-5">
                          <div className="space-y-2">
                            <div className="text-sm font-semibold">Images</div>
                            {imageOrderFiles.length === 0 ? (
                              <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                                No images uploaded.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {imageOrderFiles.map((entry) => {
                                  const url = entry.url;
                                  const fileName = getFileNameFromUrl(url);

                                  return (
                                    <div
                                      key={`image-${url}-${entry.index}`}
                                      className="group relative overflow-hidden rounded-md border"
                                    >
                                      <button
                                        type="button"
                                        className="absolute right-2 top-2 z-10 rounded-md bg-black/60 p-1.5 text-white opacity-0 transition hover:bg-black/80 group-hover:opacity-100"
                                        onClick={(event) => {
                                          event.preventDefault();
                                          event.stopPropagation();
                                          handleStageDeleteOrderFile(
                                            entry.index,
                                          );
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
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                {documentOrderFiles.map((entry) => {
                                  const url = entry.url;
                                  const fileName = getFileNameFromUrl(url);

                                  return (
                                    <div
                                      key={`file-${url}-${entry.index}`}
                                      className="group relative rounded-md border"
                                    >
                                      <button
                                        type="button"
                                        className="absolute right-2 top-2 z-10 rounded-md bg-black/60 p-1.5 text-white opacity-0 transition hover:bg-black/80 group-hover:opacity-100"
                                        onClick={(event) => {
                                          event.preventDefault();
                                          event.stopPropagation();
                                          handleStageDeleteOrderFile(
                                            entry.index,
                                          );
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
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsFilesDialogOpen(false)}
                        disabled={isSavingFileList}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleConfirmFileChanges}
                        disabled={!hasPendingFileDeletes || isSavingFileList}
                      >
                        {isSavingFileList ? "Saving..." : "Confirm"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

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
          </div>
        ) : (
          ""
        )}
        <OrderSummary
          language={order.checkouts[0].user.language ?? ""}
          sub_total={order.total_amount_item}
          shipping_amount={order.total_shipping}
          discount_amount={Math.abs(order.voucher_amount)}
          tax={
            calculateOrderTaxWithDiscount(
              invoice?.main_checkout.checkouts
                .flatMap((c) => c.cart)
                .flatMap((c) => c.items) ?? [],
              invoice?.voucher_amount,
              order?.checkouts[0]?.shipping_address?.country ??
                order?.checkouts[0]?.invoice_address?.country ??
                "DE",
              invoice?.main_checkout.checkouts[0].user.tax_id,
              order.total_shipping,
            ).totalVat
          }
          total_amount={order.total_amount}
          payment_method={order.payment_method}
          entry_date={order.created_at}
          is_Ebay={order.from_marketplace === "ebay" ? true : false}
          refund_amount={order.refund_amount}
        />
      </div>
      <OrderDeliveryOrder data={order.checkouts} />
    </div>
  );
};

export default OrderDetails;
