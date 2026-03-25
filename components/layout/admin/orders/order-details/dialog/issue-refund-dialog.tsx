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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ReturnConfirmDialogProps {
  id: string;
  order: CheckOutMain;
  open: boolean;
  onClose: () => void;
}

const REFUND_REASONS = [
  "Shipping not possible",
  "Customer return",
  "General account adjustment",
  "Shipment refused",
  "Buyer cancellation",
  "Different item",
  "Delay caused by carrier",
  "Item not as described",
  "Delivery address undeliverable",
  "Out of stock",
  "Item not received",
  "Delivery promise not met",
  "Pricing error.",
] as const;

type RefundMode = "full" | "partial";
type ItemQuality = "A-Goods" | "C-Goods" | "No return";

type RefundLine = {
  key: string;
  sourceItemId: string;
  idProvider: string;
  unitIndex: number;
  totalUnits: number;
  name: string;
  sku: string;
  image: string | null;
  quantity: number;
  unitPrice: number;
  maxAmount: number;
};

type RefundLineImage = {
  id: string;
  file: File;
  previewUrl: string | null;
  isImage: boolean;
};

type RefundLineFormState = {
  units: number;
  amountInput: string;
  reason: string;
  quality: ItemQuality;
  images: RefundLineImage[];
};

const ITEM_QUALITY_OPTIONS: ItemQuality[] = [
  "A-Goods",
  "C-Goods",
  "No return",
];

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
    const totalUnits = Math.max(0, Number(item.quantity) || 0);
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
      item.purchased_products?.id_provider ||
      item.products?.id_provider ||
      "";

    return Array.from({ length: totalUnits }, (_, unitIndex) => ({
      key: `${sourceItemId}-${index}-unit-${unitIndex + 1}`,
      sourceItemId,
      idProvider,
      unitIndex: unitIndex + 1,
      totalUnits,
      name,
      sku,
      image,
      quantity: 1,
      unitPrice,
      maxAmount: unitPrice,
    }));
  });

const IssueRefundDialog = ({
  id,
  order,
  open,
  onClose,
}: ReturnConfirmDialogProps) => {
  const createRefundMutation = useCreateRefundMainCheckout();
  const uploadCheckoutFilesMutation = useUploadCheckoutFiles();
  const uploadStaticFileMutation = useUploadStaticFile();
  const [refundMode, setRefundMode] = React.useState<RefundMode>("full");
  const [lineFormByKey, setLineFormByKey] = React.useState<
    Record<string, RefundLineFormState>
  >({});
  const [draggingLineKey, setDraggingLineKey] = React.useState<string | null>(
    null,
  );

  const [shippingUnits, setShippingUnits] = React.useState(0);
  const [shippingAmountInput, setShippingAmountInput] = React.useState("");

  const isSubmitting =
    createRefundMutation.isPending ||
    uploadStaticFileMutation.isPending ||
    uploadCheckoutFilesMutation.isPending;

  const refundLines = React.useMemo(() => buildRefundLines(order), [order]);
  const shippingMaxAmount = Math.max(0, Number(order.total_shipping ?? 0));
  const orderTotal = Math.max(0, Number(order.total_amount ?? 0));

  React.useEffect(() => {
    if (!open) return;

    const initialLineForms: Record<string, RefundLineFormState> = {};
    for (const line of refundLines) {
      initialLineForms[line.key] = {
        units: 0,
        amountInput: "",
        reason: "",
        quality: "No return",
        images: [],
      };
    }

    setRefundMode("full");
    setLineFormByKey((prev) => {
      for (const lineKey of Object.keys(prev)) {
        for (const image of prev[lineKey]?.images ?? []) {
          if (image.previewUrl) URL.revokeObjectURL(image.previewUrl);
        }
      }
      return initialLineForms;
    });
    setShippingUnits(0);
    setShippingAmountInput("");
  }, [open, refundLines]);

  const updateLineForm = React.useCallback(
    (lineKey: string, updater: (prev: RefundLineFormState) => RefundLineFormState) => {
      setLineFormByKey((prev) => {
        const previousLine = prev[lineKey] ?? {
          units: 0,
          amountInput: "",
          reason: "",
          quality: "No return" as ItemQuality,
          images: [],
        };

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
        const units = clamp(
          Math.floor(Number(lineForm?.units ?? 0)),
          0,
          line.quantity,
        );

        const partialAmount = clamp(
          parseAmountInput(lineForm?.amountInput ?? ""),
          0,
          line.maxAmount,
        );

        const amount = refundMode === "full" ? units * line.unitPrice : partialAmount;

        return {
          ...line,
          units,
          amount,
          reason: lineForm?.reason?.trim() ?? "",
          quality: lineForm?.quality ?? ("No return" as ItemQuality),
          images: lineForm?.images ?? [],
        };
      }),
    [lineFormByKey, refundLines, refundMode],
  );

  const shippingRefundAmount = React.useMemo(() => {
    if (refundMode === "full") {
      const unit = shippingUnits > 0 ? 1 : 0;
      return unit * shippingMaxAmount;
    }
    return clamp(parseAmountInput(shippingAmountInput), 0, shippingMaxAmount);
  }, [refundMode, shippingAmountInput, shippingMaxAmount, shippingUnits]);

  const totalRefundAmount = React.useMemo(
    () =>
      lineRefunds.reduce((sum, line) => sum + line.amount, 0) +
      shippingRefundAmount,
    [lineRefunds, shippingRefundAmount],
  );

  const amountAfterRefund = Math.max(orderTotal - totalRefundAmount, 0);

  const handleLineImageUpload = (lineKey: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

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
      const target = prev.images.find((img) => img.id === imageId);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);

      return {
        ...prev,
        images: prev.images.filter((img) => img.id !== imageId),
      };
    });
  };

  const handleClose = () => {
    for (const lineKey of Object.keys(lineFormByKey)) {
      for (const image of lineFormByKey[lineKey]?.images ?? []) {
        if (image.previewUrl) URL.revokeObjectURL(image.previewUrl);
      }
    }
    setDraggingLineKey(null);
    onClose();
  };

  const handleLineDragOver = (
    lineKey: string,
    event: React.DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    if (isSubmitting) return;
    setDraggingLineKey(lineKey);
  };

  const handleLineDragLeave = (
    event: React.DragEvent<HTMLDivElement>,
  ) => {
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
    if (isSubmitting) return;

    handleLineImageUpload(lineKey, event.dataTransfer.files);
  };

  const handleConfirm = async () => {
    const productRefundLines = lineRefunds.filter((line) => line.amount > 0);
    const hasShippingRefund = shippingRefundAmount > 0;

    if (productRefundLines.length === 0 && !hasShippingRefund) {
      toast.error("Please add refund amount for products or shipping");
      return;
    }

    const invalidRefundLines = productRefundLines
      .map((line) => {
        const missingFields: string[] = [];
        if (!line.reason) missingFields.push("reason");
        if (line.images.length === 0) missingFields.push("images");
        if (missingFields.length === 0) return null;

        return `${line.name} (unit ${line.unitIndex}/${line.totalUnits}): missing ${missingFields.join(", ")}`;
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
      const linesWithImages = lineRefunds.filter((line) => line.images.length > 0);

      await Promise.all(
        linesWithImages.map(async (line) => {
          const formData = new FormData();
          line.images.forEach((image) => {
            formData.append("files", image.file);
          });

          const uploadResult = await uploadStaticFileMutation.mutateAsync(formData);
          const urls =
            uploadResult.results?.map((result) => result.url).filter(Boolean) ?? [];
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
            quantity: refundMode === "full" ? line.units : line.amount > 0 ? 1 : 0,
            id_provider: line.idProvider,
            unit_price: Number(line.unitPrice.toFixed(2)),
            refund_amount: Number(line.amount.toFixed(2)),
            reason: line.reason,
            type: line.quality,
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
      const err = error as {
        response?: { data?: { detail?: unknown; message?: unknown } };
        message?: unknown;
      };

      const message =
        err.response?.data?.detail ??
        err.response?.data?.message ??
        err.message ??
        "Failed to issue refund";

      toast.error("Failed to issue refund", {
        description: String(message),
      });
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(nextOpen) => !nextOpen && handleClose()}
      direction="right"
    >
      <DrawerContent className="w-[1000px] max-w-none data-[vaul-drawer-direction=right]:sm:max-w-[1000px] overflow-y-auto p-0">
        <DrawerHeader className="border-b px-6 py-5">
          <DrawerTitle>Issue Refund</DrawerTitle>
          <DrawerDescription>
            Full refund uses units by quantity. Partial refund accepts direct
            amount per product and shipping.
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-6 px-6 py-5">
          <div className="inline-flex items-center gap-2 rounded-full border p-1">
            <Button
              type="button"
              variant={refundMode === "full" ? "secondary" : "ghost"}
              className="rounded-full px-4"
              disabled={isSubmitting}
              onClick={() => setRefundMode("full")}
            >
              Full refund
            </Button>
            <Button
              type="button"
              variant={refundMode === "partial" ? "secondary" : "ghost"}
              className="rounded-full px-4"
              disabled={isSubmitting}
              onClick={() => setRefundMode("partial")}
            >
              Partial refund
            </Button>
          </div>

          <div className="space-y-4">
            {lineRefunds.map((line) => (
              <div key={line.key} className="rounded-lg border p-4">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 flex items-start gap-3 md:col-span-6">
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
                        Unit: {line.unitIndex}/{line.totalUnits}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-6 md:col-span-2">
                    <div className="text-xs text-muted-foreground">Unit price</div>
                    <div className="font-medium">
                      €{normalizeCurrency(line.unitPrice)}
                    </div>
                  </div>

                  <div className="col-span-6 md:col-span-2">
                    {refundMode === "full" ? (
                      <>
                        <Label className="mb-1 block text-xs text-muted-foreground">
                          Units (0-{line.quantity})
                        </Label>
                        <Select
                          value={String(line.units)}
                          onValueChange={(value) =>
                            updateLineForm(line.key, (prev) => ({
                              ...prev,
                              units: Number(value),
                            }))
                          }
                          disabled={isSubmitting}
                        >
                          <SelectTrigger className="w-full border border-input">
                            <SelectValue placeholder="Select units" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from(
                              { length: line.quantity + 1 },
                              (_, index) => index,
                            ).map((option) => (
                              <SelectItem key={option} value={String(option)}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    ) : (
                      <>
                        <Label className="mb-1 block text-xs text-muted-foreground">
                          Amount (0-{normalizeCurrency(line.maxAmount)})
                        </Label>
                        <Input
                          type="number"
                          min={0}
                          max={line.maxAmount}
                          step="0.01"
                          value={lineFormByKey[line.key]?.amountInput ?? ""}
                          onChange={(event) => {
                            const rawValue = event.target.value;

                            if (!rawValue.trim()) {
                              updateLineForm(line.key, (prev) => ({
                                ...prev,
                                amountInput: "",
                              }));
                              return;
                            }

                            const parsedValue = Number(rawValue.replace(",", "."));
                            if (Number.isNaN(parsedValue)) return;

                            const clampedValue = clamp(parsedValue, 0, line.maxAmount);
                            updateLineForm(line.key, (prev) => ({
                              ...prev,
                              amountInput:
                                parsedValue === clampedValue
                                  ? rawValue
                                  : formatAmountInput(clampedValue),
                            }));
                          }}
                          disabled={isSubmitting}
                        />
                      </>
                    )}
                  </div>

                  <div className="col-span-12 md:col-span-2">
                    <div className="text-xs text-muted-foreground">Refund amount</div>
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
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full border border-input">
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {REFUND_REASONS.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-4">
                  <Label className="mb-2 block text-xs text-muted-foreground">
                    Item quality
                  </Label>
                  <RadioGroup
                    value={line.quality}
                    onValueChange={(value) =>
                      updateLineForm(line.key, (prev) => ({
                        ...prev,
                        quality: value as ItemQuality,
                      }))
                    }
                    className="grid grid-cols-2 gap-2 md:grid-cols-4"
                  >
                    {ITEM_QUALITY_OPTIONS.map((option) => (
                      <div key={option} className="flex items-center gap-2 rounded border px-3 py-2">
                        <RadioGroupItem value={option} id={`${line.key}-${option}`} />
                        <Label htmlFor={`${line.key}-${option}`} className="cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
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
                    className={`rounded-md border border-dashed p-4 transition-colors ${
                      draggingLineKey === line.key
                        ? "border-primary bg-primary/5"
                        : "border-input"
                    }`}
                  >
                    <label className="flex cursor-pointer flex-col items-center gap-2 text-sm text-muted-foreground">
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
                        disabled={isSubmitting}
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
                            onClick={() => handleRemoveLineImage(line.key, image.id)}
                            disabled={isSubmitting}
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
              </div>

              <div className="col-span-6 md:col-span-2">
                <div className="text-xs text-muted-foreground">Shipping cost</div>
                <div className="font-medium">
                  €{normalizeCurrency(shippingMaxAmount)}
                </div>
              </div>

              <div className="col-span-6 md:col-span-2">
                {refundMode === "full" ? (
                  <>
                    <Label className="mb-1 block text-xs text-muted-foreground">
                      Units (0-1)
                    </Label>
                    <Select
                      value={String(shippingUnits > 0 ? 1 : 0)}
                      onValueChange={(value) => setShippingUnits(Number(value))}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger className="w-full border border-input">
                        <SelectValue placeholder="Select units" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <>
                    <Label className="mb-1 block text-xs text-muted-foreground">
                      Amount (0-{normalizeCurrency(shippingMaxAmount)})
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      max={shippingMaxAmount}
                      step="0.01"
                      value={shippingAmountInput}
                      onChange={(event) => {
                        const rawValue = event.target.value;

                        if (!rawValue.trim()) {
                          setShippingAmountInput("");
                          return;
                        }

                        const parsedValue = Number(rawValue.replace(",", "."));
                        if (Number.isNaN(parsedValue)) return;

                        const clampedValue = clamp(parsedValue, 0, shippingMaxAmount);
                        setShippingAmountInput(
                          parsedValue === clampedValue
                            ? rawValue
                            : formatAmountInput(clampedValue),
                        );
                      }}
                      disabled={isSubmitting}
                    />
                  </>
                )}
              </div>

              <div className="col-span-12 md:col-span-2">
                <div className="text-xs text-muted-foreground">Refund amount</div>
                <div className="font-semibold">
                  €{normalizeCurrency(shippingRefundAmount)}
                </div>
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
