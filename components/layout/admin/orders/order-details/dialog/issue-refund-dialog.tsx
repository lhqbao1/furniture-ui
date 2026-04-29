"use client";

import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
  useCreateRefundMainCheckout,
  useUpdateReasonForMainCheckout,
  useUploadCheckoutFiles,
} from "@/features/checkout/hook";
import { useUploadStaticFile } from "@/features/file/hook";
import { Input } from "@/components/ui/input";
import { CheckOutMain } from "@/types/checkout";
import { CartItem } from "@/types/cart";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface ReturnConfirmDialogProps {
  id: string;
  order: CheckOutMain;
  open: boolean;
  onClose: () => void;
}

const ELIGIBLE_SHIPPING_REFUND_REASONS = [
  "Incorrect item received",
  "Item not as described",
  "Damaged or defective item",
  "Item out of stock",
  "Pricing or listing error",
  "Cancelled by customer",
  "Shipping unavailable to customer location",
  "Carrier delay / delivery timeframe not met",
  "Item not received (lost in transit)",
] as const;

const NOT_ELIGIBLE_SHIPPING_REFUND_REASONS = [
  "Customer-initiated return",
  "Shipment refused by customer",
  "Freight No-Show: No response to delivery Avis",
  "Invalid or undeliverable shipping address",
  "Account adjustment (Goodwill)",
] as const;

const REFUND_REASON_GROUPS = [
  {
    label: "Eligible for Shipping Cost Refund",
    options: ELIGIBLE_SHIPPING_REFUND_REASONS,
  },
  {
    label: "Not Eligible for Shipping Cost Refund",
    options: NOT_ELIGIBLE_SHIPPING_REFUND_REASONS,
  },
] as const;

const SHIPPING_REFUND_ELIGIBLE_REASON_SET = new Set<string>(
  ELIGIBLE_SHIPPING_REFUND_REASONS,
);

type RefundLine = {
  key: string;
  idProvider: string;
  name: string;
  sku: string;
  image: string | null;
  originalQuantity: number;
  unitIndex: number;
  unitPrice: number;
};

type RefundLineImage = {
  id: string;
  file: File;
  previewUrl: string | null;
  isImage: boolean;
};

type RefundLineFormState = {
  units: number;
  reason: string;
  images: RefundLineImage[];
};

type ShippingRefundFormState = {
  units: number;
};

type RefundApiErrorPayload = {
  detail?: unknown;
  message?: unknown;
};

type RefundApiError = {
  response?: {
    data?: RefundApiErrorPayload;
  };
  message?: unknown;
};

const normalizeCurrency = (amount: number) =>
  amount.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatAmountInput = (amount: number) => String(Number(amount.toFixed(2)));

const parseAmountInput = (value: string) => {
  const normalized = value.replace(",", ".").trim();
  if (!normalized) return 0;
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const isImageFile = (file: File) => file.type.startsWith("image/");

const extractRefundErrorMessage = (error: unknown) => {
  const err = error as RefundApiError;
  const responseData = err.response?.data;
  const detail = responseData?.detail;

  if (typeof detail === "object" && detail !== null) {
    const detailObj = detail as {
      details?: Array<{ description?: unknown }>;
      message?: unknown;
    };
    const paypalDescription = detailObj.details?.find(
      (item) =>
        typeof item?.description === "string" && item.description.trim(),
    )?.description;

    if (typeof paypalDescription === "string") {
      return paypalDescription;
    }

    if (typeof detailObj.message === "string" && detailObj.message.trim()) {
      return detailObj.message;
    }
  }

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (
    typeof responseData?.message === "string" &&
    responseData.message.trim()
  ) {
    return responseData.message;
  }

  if (typeof err.message === "string" && err.message.trim()) {
    return err.message;
  }

  return "Failed to issue refund";
};

const getUnitPrice = (item: CartItem) => {
  if (item.purchased_products?.final_price)
    return item.purchased_products.final_price;
  if (item.products?.final_price) return item.products.final_price;
  if (item.final_price) return item.final_price;
  return item.item_price ?? 0;
};

const getOrderCartItems = (order: CheckOutMain): CartItem[] => {
  if (!order?.checkouts) return [];

  return order.checkouts
    .filter((checkout) => {
      const status = checkout.status?.toLowerCase();
      return status !== "exchange" && status !== "cancel_exchange";
    })
    .flatMap((checkout) => {
      const items = checkout?.cart?.items ?? [];
      return items.flatMap((entry) =>
        Array.isArray(entry) ? entry : [entry],
      ) as CartItem[];
    });
};

const buildRefundLines = (order: CheckOutMain): RefundLine[] =>
  getOrderCartItems(order).flatMap((item, index) => {
    const originalQuantity = Math.max(0, Number(item.quantity) || 0);
    if (originalQuantity <= 0) return [];

    const unitPrice = getUnitPrice(item);
    const name =
      item.purchased_products?.name || item.products?.name || "Unnamed product";
    const sku =
      item.purchased_products?.sku ||
      item.products?.sku ||
      item.products?.id_provider ||
      "-";
    const image =
      item.image_url ||
      item.purchased_products?.image ||
      item.products?.static_files?.[0]?.url ||
      null;
    const sourceItemId = String(item.id ?? `item-${index}`);
    const idProvider =
      item.purchased_products?.id_provider || item.products?.id_provider || "";

    return Array.from({ length: originalQuantity }, (_, unitIndex) => ({
      key: `${sourceItemId}-${index}-${unitIndex + 1}`,
      idProvider,
      name,
      sku,
      image,
      originalQuantity,
      unitIndex: unitIndex + 1,
      unitPrice,
    }));
  });

const createInitialLineFormState = (): RefundLineFormState => ({
  units: 0,
  reason: "",
  images: [],
});

const buildInitialLineFormMap = (lines: RefundLine[]) =>
  Object.fromEntries(
    lines.map((line) => [line.key, createInitialLineFormState()]),
  ) as Record<string, RefundLineFormState>;

const createInitialShippingRefundFormState = (): ShippingRefundFormState => ({
  units: 0,
});

const revokeLineFormPreviewUrls = (
  forms: Record<string, RefundLineFormState>,
) => {
  Object.values(forms).forEach((form) => {
    form.images.forEach((image) => {
      if (image.previewUrl) {
        URL.revokeObjectURL(image.previewUrl);
      }
    });
  });
};

const renderRefundReasonOptions = () =>
  REFUND_REASON_GROUPS.map((group, groupIndex) => (
    <React.Fragment key={group.label}>
      <SelectGroup>
        <SelectLabel className="px-2 py-2 text-xs font-bold uppercase tracking-wide text-foreground">
          {group.label}
        </SelectLabel>
        {group.options.map((reason) => (
          <SelectItem key={reason} value={reason}>
            {reason}
          </SelectItem>
        ))}
      </SelectGroup>
      {groupIndex < REFUND_REASON_GROUPS.length - 1 ? <SelectSeparator /> : null}
    </React.Fragment>
  ));

const IssueRefundDialog = ({
  id,
  order,
  open,
  onClose,
}: ReturnConfirmDialogProps) => {
  const createRefundMutation = useCreateRefundMainCheckout();
  const updateReasonMutation = useUpdateReasonForMainCheckout();
  const uploadCheckoutFilesMutation = useUploadCheckoutFiles();
  const uploadStaticFileMutation = useUploadStaticFile();
  const [lineFormByKey, setLineFormByKey] = React.useState<
    Record<string, RefundLineFormState>
  >({});
  const [draggingLineKey, setDraggingLineKey] = React.useState<string | null>(
    null,
  );
  const [shippingForm, setShippingForm] = React.useState<ShippingRefundFormState>(
    createInitialShippingRefundFormState(),
  );
  const [moneyRefundInput, setMoneyRefundInput] = React.useState("0");
  const [moneyRefundReason, setMoneyRefundReason] = React.useState("");

  const isSubmitting =
    createRefundMutation.isPending ||
    updateReasonMutation.isPending ||
    uploadStaticFileMutation.isPending ||
    uploadCheckoutFilesMutation.isPending;

  const refundLines = React.useMemo(() => buildRefundLines(order), [order]);
  const shippingMaxAmount = Math.max(0, Number(order.total_shipping ?? 0));
  const orderTotal = Math.max(0, Number(order.total_amount ?? 0));

  React.useEffect(() => {
    if (!open) return;

    setLineFormByKey((prev) => {
      revokeLineFormPreviewUrls(prev);
      return buildInitialLineFormMap(refundLines);
    });
    setShippingForm(createInitialShippingRefundFormState());
    setMoneyRefundInput("0");
    setMoneyRefundReason("");
    setDraggingLineKey(null);
  }, [open, refundLines]);

  const updateLineForm = React.useCallback(
    (
      lineKey: string,
      updater: (prev: RefundLineFormState) => RefundLineFormState,
    ) => {
      setLineFormByKey((prev) => {
        const previousLine = prev[lineKey] ?? createInitialLineFormState();

        return {
          ...prev,
          [lineKey]: updater(previousLine),
        };
      });
    },
    [],
  );

  const lineRefunds = React.useMemo(
    () =>
      refundLines.map((line) => {
        const lineForm = lineFormByKey[line.key];
        const units = clamp(Math.floor(Number(lineForm?.units ?? 0)), 0, 1);
        const amount = units * line.unitPrice;

        return {
          ...line,
          units,
          amount,
          reason: lineForm?.reason?.trim() ?? "",
          images: lineForm?.images ?? [],
        };
      }),
    [lineFormByKey, refundLines],
  );

  const hasSelectedItemRefund = React.useMemo(
    () => lineRefunds.some((line) => line.units > 0),
    [lineRefunds],
  );

  const isShippingRefundAllowed = React.useMemo(
    () =>
      lineRefunds.some(
        (line) =>
          line.units > 0 && SHIPPING_REFUND_ELIGIBLE_REASON_SET.has(line.reason),
      ),
    [lineRefunds],
  );

  React.useEffect(() => {
    if (isShippingRefundAllowed) return;
    if (shippingForm.units === 0) return;

    setShippingForm(createInitialShippingRefundFormState());
  }, [isShippingRefundAllowed, shippingForm.units]);

  const shippingRefundAmount = React.useMemo(() => {
    if (!isShippingRefundAllowed) return 0;
    return shippingForm.units > 0 ? shippingMaxAmount : 0;
  }, [isShippingRefundAllowed, shippingForm.units, shippingMaxAmount]);

  const moneyRefundAmount = React.useMemo(
    () => clamp(parseAmountInput(moneyRefundInput), 0, orderTotal),
    [moneyRefundInput, orderTotal],
  );

  const moneyRefundPercentage = React.useMemo(() => {
    if (orderTotal <= 0) return 0;
    return (moneyRefundAmount / orderTotal) * 100;
  }, [moneyRefundAmount, orderTotal]);

  const productAndShippingRefundAmount = React.useMemo(
    () =>
      lineRefunds.reduce((sum, line) => sum + line.amount, 0) +
      shippingRefundAmount,
    [lineRefunds, shippingRefundAmount],
  );

  const standardRefundActive = hasSelectedItemRefund || shippingRefundAmount > 0;
  const fixedAmountActive = moneyRefundAmount > 0;
  const itemSectionDisabled = fixedAmountActive;
  const fixedAmountSectionDisabled = standardRefundActive;

  const totalRefundAmount = standardRefundActive
    ? productAndShippingRefundAmount
    : fixedAmountActive
      ? moneyRefundAmount
      : 0;

  const amountAfterRefund = Math.max(orderTotal - totalRefundAmount, 0);

  const handleLineImageUpload = (lineKey: string, files: FileList | null) => {
    if (itemSectionDisabled || !files || files.length === 0) return;

    const incomingImages: RefundLineImage[] = Array.from(files).map(
      (file, idx) => {
        const canPreviewAsImage = isImageFile(file);

        return {
          id: `${lineKey}-${Date.now()}-${idx}`,
          file,
          previewUrl: canPreviewAsImage ? URL.createObjectURL(file) : null,
          isImage: canPreviewAsImage,
        };
      },
    );

    updateLineForm(lineKey, (prev) => ({
      ...prev,
      images: [...prev.images, ...incomingImages],
    }));
  };

  const handleRemoveLineImage = (lineKey: string, imageId: string) => {
    updateLineForm(lineKey, (prev) => {
      const target = prev.images.find((image) => image.id === imageId);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return {
        ...prev,
        images: prev.images.filter((image) => image.id !== imageId),
      };
    });
  };

  const handleClose = () => {
    revokeLineFormPreviewUrls(lineFormByKey);
    setDraggingLineKey(null);
    onClose();
  };

  const handleLineDragOver = (
    lineKey: string,
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (isSubmitting || itemSectionDisabled) return;
    setDraggingLineKey(lineKey);
  };

  const handleLineDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDraggingLineKey(null);
  };

  const handleLineDrop = (
    lineKey: string,
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setDraggingLineKey(null);
    if (isSubmitting || itemSectionDisabled) return;

    handleLineImageUpload(lineKey, event.dataTransfer.files);
  };

  const handleConfirm = async () => {
    if (standardRefundActive) {
      const productRefundLines = lineRefunds.filter((line) => line.units > 0);

      const invalidRefundLines = productRefundLines
        .map((line) => {
          if (line.reason) return null;

          return `${line.name} (unit ${line.unitIndex}/${line.originalQuantity}): missing reason`;
        })
        .filter((line): line is string => Boolean(line));

      if (invalidRefundLines.length > 0) {
        const previewMessages = invalidRefundLines.slice(0, 3).join(" | ");
        const restCount = invalidRefundLines.length - 3;

        toast.error("Missing required fields", {
          description:
            restCount > 0
              ? `${previewMessages} | +${restCount} more item(s)`
              : previewMessages,
        });
        return;
      }

      if (totalRefundAmount <= 0) {
        toast.error("Refund amount must be greater than 0");
        return;
      }

      try {
        const uploadedCheckoutUrls: string[] = [];
        const linesWithImages = productRefundLines.filter(
          (line) => line.images.length > 0,
        );

        await Promise.all(
          linesWithImages.map(async (line) => {
            const formData = new FormData();
            line.images.forEach((image) => {
              formData.append("files", image.file);
            });

            const uploadResult =
              await uploadStaticFileMutation.mutateAsync(formData);
            const urls =
              uploadResult.results
                ?.map((result) => result.url)
                .filter(Boolean) ?? [];
            uploadedCheckoutUrls.push(...urls);
          }),
        );

        await createRefundMutation.mutateAsync({
          main_checkout_id: id,
          payload: {
            amount: Number(totalRefundAmount.toFixed(2)),
            products: productRefundLines.map((line) => ({
              name: line.name,
              sku: line.sku,
              quantity: 1,
              id_provider: line.idProvider,
              unit_price: Number(line.unitPrice.toFixed(2)),
              refund_amount: Number(line.amount.toFixed(2)),
              reason: line.reason,
              type: "No return",
              file: [],
            })),
          },
        });

        if (uploadedCheckoutUrls.length > 0) {
          const existingCheckoutUrls = (order.files ?? [])
            .map((file) => file?.url)
            .filter((url): url is string => Boolean(url));
          const mergedCheckoutUrls = Array.from(
            new Set([...existingCheckoutUrls, ...uploadedCheckoutUrls]),
          );

          await uploadCheckoutFilesMutation.mutateAsync({
            main_checkout_id: id,
            payload: mergedCheckoutUrls,
          });
        }

        toast.success("Issue refund successfully");
        handleClose();
      } catch (error) {
        const message = extractRefundErrorMessage(error);
        toast.error("Failed to issue refund", {
          description: message,
        });
      }
      return;
    }

    if (fixedAmountActive) {
      const amount = Number(moneyRefundAmount.toFixed(2));

      if (amount <= 0) {
        toast.error("Refund amount must be greater than 0");
        return;
      }

      if (!moneyRefundReason.trim()) {
        toast.error("Please select reason for refund");
        return;
      }

      try {
        await createRefundMutation.mutateAsync({
          main_checkout_id: id,
          payload: {
            amount,
          },
        });

        try {
          await updateReasonMutation.mutateAsync({
            main_checkout_id: id,
            reason: moneyRefundReason.trim(),
          });
        } catch (reasonError) {
          const reasonMessage = extractRefundErrorMessage(reasonError);
          toast.error("Refund created but failed to update reason", {
            description: reasonMessage,
          });
        }

        toast.success("Issue refund successfully");
        handleClose();
      } catch (error) {
        const message = extractRefundErrorMessage(error);
        toast.error("Failed to issue refund", {
          description: message,
        });
      }
      return;
    }

    toast.error("Please select item units or enter a fixed amount");
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => !nextOpen && handleClose()}
      direction="right"
    >
      <DrawerContent className="w-[1000px] max-w-none overflow-y-auto p-0 data-[vaul-drawer-direction=right]:sm:max-w-[1000px]">
        <DrawerHeader className="border-b px-6 py-5">
          <DrawerTitle>Issue Refund</DrawerTitle>
          <DrawerDescription>
            Refund item units individually or use a fixed amount. Fixed amount
            cannot be combined with item or shipping refunds.
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-6 px-6 py-5">
          <div
            className={cn(
              "space-y-4",
              itemSectionDisabled &&
                "rounded-xl border border-muted-foreground/20 bg-muted/20 p-4",
            )}
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="font-semibold">Item refund</h3>
                <p className="text-sm text-muted-foreground">
                  Each ordered quantity is split into its own row. Select 0 or 1
                  unit per row.
                </p>
              </div>
              {itemSectionDisabled ? (
                <p className="max-w-xs text-sm text-muted-foreground md:text-right">
                  Clear the fixed amount below to enable item and shipping refund.
                </p>
              ) : null}
            </div>

            <div className="space-y-4">
              {lineRefunds.map((line) => (
                <div
                  key={line.key}
                  className={cn(
                    "rounded-lg border p-4 transition-colors",
                    line.units > 0 && !itemSectionDisabled
                      ? "border-secondary/30 bg-secondary/5"
                      : "bg-background",
                  )}
                >
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 flex items-start gap-3 md:col-span-5">
                      {line.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={line.image}
                          alt={line.name}
                          className="h-16 w-16 rounded-md border object-cover"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-md border bg-muted" />
                      )}
                      <div className="min-w-0">
                        <div className="line-clamp-2 font-medium">{line.name}</div>
                        <div className="text-sm text-muted-foreground">
                          SKU: {line.sku}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Unit {line.unitIndex} of {line.originalQuantity}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-6 md:col-span-2">
                      <div className="text-xs text-muted-foreground">
                        Unit price
                      </div>
                      <div className="font-medium">
                        €{normalizeCurrency(line.unitPrice)}
                      </div>
                    </div>

                    <div className="col-span-6 md:col-span-2">
                      <Label className="mb-1 block text-xs text-muted-foreground">
                        Units (0-1)
                      </Label>
                      <Select
                        value={String(line.units)}
                        onValueChange={(value) =>
                          updateLineForm(line.key, (prev) => {
                            const nextUnits = clamp(Number(value), 0, 1);

                            if (nextUnits === 0) {
                              prev.images.forEach((image) => {
                                if (image.previewUrl) {
                                  URL.revokeObjectURL(image.previewUrl);
                                }
                              });

                              return createInitialLineFormState();
                            }

                            return {
                              ...prev,
                              units: nextUnits,
                            };
                          })
                        }
                        disabled={isSubmitting || itemSectionDisabled}
                      >
                        <SelectTrigger className="w-full border border-input">
                          <SelectValue placeholder="Select units" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0</SelectItem>
                          <SelectItem value="1">1</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-12 md:col-span-3">
                      <div className="text-xs text-muted-foreground">
                        Refund amount
                      </div>
                      <div className="font-semibold">
                        €{normalizeCurrency(line.amount)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label className="mb-1 block text-xs text-muted-foreground">
                      Reason for refund
                    </Label>
                    <Select
                      value={line.reason || undefined}
                      onValueChange={(value) =>
                        updateLineForm(line.key, (prev) => ({
                          ...prev,
                          reason: value,
                        }))
                      }
                      disabled={
                        isSubmitting || itemSectionDisabled || line.units <= 0
                      }
                    >
                      <SelectTrigger className="w-full border border-input">
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>{renderRefundReasonOptions()}</SelectContent>
                    </Select>
                  </div>

                  <div className="mt-4">
                    <Label className="mb-2 block text-xs text-muted-foreground">
                      Upload files
                    </Label>
                    <div
                      onDragOver={(event) => handleLineDragOver(line.key, event)}
                      onDragEnter={(event) => handleLineDragOver(line.key, event)}
                      onDragLeave={handleLineDragLeave}
                      onDrop={(event) => handleLineDrop(line.key, event)}
                      className={cn(
                        "rounded-md border border-dashed p-4 transition-colors",
                        draggingLineKey === line.key
                          ? "border-primary bg-primary/5"
                          : "border-input",
                        (itemSectionDisabled || line.units <= 0) && "bg-muted/10",
                      )}
                    >
                      <label
                        className={cn(
                          "flex flex-col items-center gap-2 text-sm text-muted-foreground",
                          isSubmitting || itemSectionDisabled || line.units <= 0
                            ? "cursor-not-allowed"
                            : "cursor-pointer",
                        )}
                      >
                        <Upload className="size-4" />
                        <span>Drag and drop files here</span>
                        <span>or click to browse</span>
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          onChange={(event) => {
                            handleLineImageUpload(line.key, event.target.files);
                            event.currentTarget.value = "";
                          }}
                          disabled={
                            isSubmitting || itemSectionDisabled || line.units <= 0
                          }
                        />
                      </label>
                    </div>

                    {line.images.length > 0 ? (
                      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                        {line.images.map((image) => (
                          <div
                            key={image.id}
                            className="relative overflow-hidden rounded-md border bg-muted/20"
                          >
                            {image.isImage && image.previewUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={image.previewUrl}
                                alt={image.file.name}
                                className="h-24 w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-24 w-full items-center gap-2 px-3">
                                <FileText className="size-4 text-muted-foreground" />
                                <span className="line-clamp-2 text-xs">
                                  {image.file.name}
                                </span>
                              </div>
                            )}
                            <button
                              type="button"
                              className="absolute right-1 top-1 rounded bg-black/60 p-1 text-white hover:bg-black/80"
                              onClick={() =>
                                handleRemoveLineImage(line.key, image.id)
                              }
                              disabled={isSubmitting || itemSectionDisabled}
                              aria-label="Remove image"
                            >
                              <X className="size-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg border p-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-6">
                  <div className="font-medium">Shipping fee</div>
                  <div className="text-sm text-muted-foreground">
                    Max refundable shipping: €{normalizeCurrency(shippingMaxAmount)}
                  </div>
                  {!isShippingRefundAllowed ? (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Select at least one refunded item with a shipping-eligible
                      refund reason to enable shipping refund.
                    </div>
                  ) : null}
                </div>

                <div className="col-span-6 md:col-span-2">
                  <div className="text-xs text-muted-foreground">
                    Shipping cost
                  </div>
                  <div className="font-medium">
                    €{normalizeCurrency(shippingMaxAmount)}
                  </div>
                </div>

                <div className="col-span-6 md:col-span-2">
                  <Label className="mb-1 block text-xs text-muted-foreground">
                    Units (0-1)
                  </Label>
                  <Select
                    value={String(shippingForm.units > 0 ? 1 : 0)}
                    onValueChange={(value) =>
                      setShippingForm({
                        units: clamp(Number(value), 0, 1),
                      })
                    }
                    disabled={
                      isSubmitting || itemSectionDisabled || !isShippingRefundAllowed
                    }
                  >
                    <SelectTrigger className="w-full border border-input">
                      <SelectValue placeholder="Select units" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-12 md:col-span-2">
                  <div className="text-xs text-muted-foreground">
                    Refund amount
                  </div>
                  <div className="font-semibold">
                    €{normalizeCurrency(shippingRefundAmount)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "rounded-lg border p-4",
              fixedAmountSectionDisabled &&
                "border-muted-foreground/20 bg-muted/20 opacity-60",
            )}
          >
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="font-semibold">Fixed amount</h3>
                <p className="text-sm text-muted-foreground">
                  Use a single refund amount for the order. This follows the same
                  logic as the previous fixed amount refund.
                </p>
              </div>
              {fixedAmountSectionDisabled ? (
                <p className="max-w-xs text-sm text-muted-foreground md:text-right">
                  Clear selected item units and shipping to enable fixed amount.
                </p>
              ) : null}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label className="mb-1 block text-xs text-muted-foreground">
                  Refund amount
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={orderTotal}
                  step="0.01"
                  value={moneyRefundInput}
                  onChange={(event) => {
                    const rawValue = event.target.value;

                    if (!rawValue.trim()) {
                      setMoneyRefundInput("0");
                      return;
                    }

                    const parsedValue = Number(rawValue.replace(",", "."));
                    if (Number.isNaN(parsedValue)) return;

                    const clampedValue = clamp(parsedValue, 0, orderTotal);
                    setMoneyRefundInput(
                      parsedValue === clampedValue
                        ? rawValue
                        : formatAmountInput(clampedValue),
                    );
                  }}
                  disabled={isSubmitting || fixedAmountSectionDisabled}
                />
              </div>

              <div className="self-end space-y-1 text-sm text-muted-foreground">
                <div>Max refundable amount: €{normalizeCurrency(orderTotal)}</div>
                <div>
                  Refund percentage: {" "}
                  {moneyRefundPercentage.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  %
                </div>
              </div>

              <div className="md:col-span-2">
                <Label className="mb-1 block text-xs text-muted-foreground">
                  Reason for refund
                </Label>
                <Select
                  value={moneyRefundReason || undefined}
                  onValueChange={setMoneyRefundReason}
                  disabled={isSubmitting || fixedAmountSectionDisabled}
                >
                  <SelectTrigger className="w-full border border-input">
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent>{renderRefundReasonOptions()}</SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="ml-auto w-full max-w-md rounded-lg border bg-muted/20 p-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Order total</span>
                <span>€{normalizeCurrency(orderTotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Remaining after refund</span>
                <span>€{normalizeCurrency(amountAfterRefund)}</span>
              </div>
              <div className="flex items-center justify-between rounded-md bg-red-50 px-3 py-2 font-semibold text-red-600">
                <span>Refund amount</span>
                <span>€{normalizeCurrency(totalRefundAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        <DrawerFooter className="border-t px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            className="bg-gray-400 text-white hover:bg-gray-500"
            disabled={isSubmitting}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            hasEffect
            variant="secondary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Confirm refund"
            )}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default IssueRefundDialog;
