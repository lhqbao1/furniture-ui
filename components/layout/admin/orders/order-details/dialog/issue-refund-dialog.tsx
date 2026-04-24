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

type RefundMode = "full" | "partial" | "money";
type ProductRefundMode = Exclude<RefundMode, "money">;

type RefundLine = {
  key: string;
  sourceItemId: string;
  idProvider: string;
  name: string;
  sku: string;
  image: string | null;
  quantity: number;
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
  amountInput: string;
  reason: string;
  images: RefundLineImage[];
};

type ShippingRefundFormState = {
  units: number;
  amountInput: string;
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
  getOrderCartItems(order).map((item, index) => {
    const quantity = Math.max(0, Number(item.quantity) || 0);
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

    return {
      key: `${sourceItemId}-${index}`,
      sourceItemId,
      idProvider,
      name,
      sku,
      image,
      quantity,
      unitPrice,
    };
  });

const createInitialLineFormState = (): RefundLineFormState => ({
  units: 0,
  amountInput: "",
  reason: "",
  images: [],
});

const buildInitialLineFormMap = (lines: RefundLine[]) =>
  Object.fromEntries(
    lines.map((line) => [line.key, createInitialLineFormState()]),
  ) as Record<string, RefundLineFormState>;

const createInitialShippingRefundFormState = (): ShippingRefundFormState => ({
  units: 0,
  amountInput: "0",
});

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
  const [refundMode, setRefundMode] = React.useState<RefundMode>("full");
  const [lineFormByMode, setLineFormByMode] = React.useState<
    Record<ProductRefundMode, Record<string, RefundLineFormState>>
  >({
    full: {},
    partial: {},
  });
  const [draggingLineKey, setDraggingLineKey] = React.useState<string | null>(
    null,
  );
  const [shippingFormByMode, setShippingFormByMode] = React.useState<
    Record<ProductRefundMode, ShippingRefundFormState>
  >({
    full: createInitialShippingRefundFormState(),
    partial: createInitialShippingRefundFormState(),
  });
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
  const activeProductRefundMode = refundMode === "money" ? null : refundMode;
  const activeLineFormByKey = React.useMemo(
    () =>
      activeProductRefundMode
        ? lineFormByMode[activeProductRefundMode] ?? {}
        : {},
    [activeProductRefundMode, lineFormByMode],
  );
  const activeShippingForm = React.useMemo(
    () =>
      activeProductRefundMode
        ? shippingFormByMode[activeProductRefundMode]
        : createInitialShippingRefundFormState(),
    [activeProductRefundMode, shippingFormByMode],
  );

  React.useEffect(() => {
    if (!open) return;

    setRefundMode("full");
    setLineFormByMode((prev) => {
      for (const mode of Object.keys(prev) as ProductRefundMode[]) {
        for (const lineKey of Object.keys(prev[mode] ?? {})) {
          for (const image of prev[mode][lineKey]?.images ?? []) {
            if (image.previewUrl) URL.revokeObjectURL(image.previewUrl);
          }
        }
      }

      return {
        full: buildInitialLineFormMap(refundLines),
        partial: buildInitialLineFormMap(refundLines),
      };
    });
    setShippingFormByMode({
      full: createInitialShippingRefundFormState(),
      partial: createInitialShippingRefundFormState(),
    });
    setMoneyRefundInput("0");
    setMoneyRefundReason("");
  }, [open, refundLines]);

  const updateLineForm = React.useCallback(
    (
      mode: ProductRefundMode,
      lineKey: string,
      updater: (prev: RefundLineFormState) => RefundLineFormState,
    ) => {
      setLineFormByMode((prev) => {
        const previousLine =
          prev[mode]?.[lineKey] ?? createInitialLineFormState();

        return {
          ...prev,
          [mode]: {
            ...prev[mode],
            [lineKey]: updater(previousLine),
          },
        };
      });
    },
    [],
  );

  const updateActiveLineForm = React.useCallback(
    (
      lineKey: string,
      updater: (prev: RefundLineFormState) => RefundLineFormState,
    ) => {
      if (!activeProductRefundMode) return;
      updateLineForm(activeProductRefundMode, lineKey, updater);
    },
    [activeProductRefundMode, updateLineForm],
  );

  const updateShippingForm = React.useCallback(
    (
      mode: ProductRefundMode,
      updater: (prev: ShippingRefundFormState) => ShippingRefundFormState,
    ) => {
      setShippingFormByMode((prev) => ({
        ...prev,
        [mode]: updater(prev[mode] ?? createInitialShippingRefundFormState()),
      }));
    },
    [],
  );

  const updateActiveShippingForm = React.useCallback(
    (updater: (prev: ShippingRefundFormState) => ShippingRefundFormState) => {
      if (!activeProductRefundMode) return;
      updateShippingForm(activeProductRefundMode, updater);
    },
    [activeProductRefundMode, updateShippingForm],
  );

  const lineRefunds = React.useMemo(
    () =>
      refundLines.map((line) => {
        const lineForm = activeLineFormByKey[line.key];
        const units = clamp(
          Math.floor(Number(lineForm?.units ?? 0)),
          0,
          line.quantity,
        );

        const partialMaxAmount = units * line.unitPrice;
        const partialAmount = clamp(
          parseAmountInput(lineForm?.amountInput ?? ""),
          0,
          partialMaxAmount,
        );

        const amount =
          refundMode === "full" ? units * line.unitPrice : partialAmount;

        return {
          ...line,
          units,
          amount,
          partialMaxAmount,
          reason: lineForm?.reason?.trim() ?? "",
          images: lineForm?.images ?? [],
        };
      }),
    [activeLineFormByKey, refundLines, refundMode],
  );

  const isShippingRefundAllowed = React.useMemo(
    () =>
      Object.values(activeLineFormByKey).some((lineForm) =>
        SHIPPING_REFUND_ELIGIBLE_REASON_SET.has(lineForm.reason?.trim() ?? ""),
      ),
    [activeLineFormByKey],
  );

  React.useEffect(() => {
    if (!activeProductRefundMode || isShippingRefundAllowed) return;

    if (
      activeShippingForm.units === 0 &&
      activeShippingForm.amountInput === "0"
    ) {
      return;
    }

    updateShippingForm(
      activeProductRefundMode,
      createInitialShippingRefundFormState,
    );
  }, [
    activeProductRefundMode,
    activeShippingForm.amountInput,
    activeShippingForm.units,
    isShippingRefundAllowed,
    updateShippingForm,
  ]);

  const shippingRefundAmount = React.useMemo(() => {
    if (!isShippingRefundAllowed) return 0;

    if (refundMode === "full") {
      const unit = activeShippingForm.units > 0 ? 1 : 0;
      return unit * shippingMaxAmount;
    }
    return clamp(
      parseAmountInput(activeShippingForm.amountInput),
      0,
      shippingMaxAmount,
    );
  }, [
    activeShippingForm.amountInput,
    activeShippingForm.units,
    isShippingRefundAllowed,
    refundMode,
    shippingMaxAmount,
  ]);

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

  const totalRefundAmount =
    refundMode === "money" ? moneyRefundAmount : productAndShippingRefundAmount;

  const amountAfterRefund = Math.max(orderTotal - totalRefundAmount, 0);

  const handleLineImageUpload = (lineKey: string, files: FileList | null) => {
    if (!activeProductRefundMode || !files || files.length === 0) return;

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

    updateLineForm(activeProductRefundMode, lineKey, (prev) => ({
      ...prev,
      images: [...prev.images, ...incomingImages],
    }));
  };

  const handleRemoveLineImage = (lineKey: string, imageId: string) => {
    if (!activeProductRefundMode) return;

    updateLineForm(activeProductRefundMode, lineKey, (prev) => {
      const target = prev.images.find((img) => img.id === imageId);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);

      return {
        ...prev,
        images: prev.images.filter((img) => img.id !== imageId),
      };
    });
  };

  const handleClose = () => {
    for (const mode of Object.keys(lineFormByMode) as ProductRefundMode[]) {
      for (const lineKey of Object.keys(lineFormByMode[mode] ?? {})) {
        for (const image of lineFormByMode[mode][lineKey]?.images ?? []) {
          if (image.previewUrl) URL.revokeObjectURL(image.previewUrl);
        }
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
    if (isSubmitting) return;

    handleLineImageUpload(lineKey, event.dataTransfer.files);
  };

  const handleConfirm = async () => {
    if (refundMode === "money") {
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

    const productRefundLines = lineRefunds.filter((line) => line.amount > 0);
    const hasShippingRefund = shippingRefundAmount > 0;

    if (productRefundLines.length === 0 && !hasShippingRefund) {
      toast.error("Please add refund amount for products or shipping");
      return;
    }

    const invalidRefundLines = productRefundLines
      .map((line) => {
        const missingFields: string[] = [];
        if (line.units <= 0) missingFields.push("units");
        if (!line.reason) missingFields.push("reason");
        if (missingFields.length === 0) return null;

        return `${line.name}: missing ${missingFields.join(", ")}`;
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
      const linesWithImages = lineRefunds.filter(
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
            uploadResult.results?.map((result) => result.url).filter(Boolean) ??
            [];
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
            quantity: line.units,
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
            amount per product and shipping. Money refund accepts only a single
            amount and reason.
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
            <Button
              type="button"
              variant={refundMode === "money" ? "secondary" : "ghost"}
              className="rounded-full px-4"
              disabled={isSubmitting}
              onClick={() => setRefundMode("money")}
            >
              Fixed amount
            </Button>
          </div>

          {refundMode === "money" ? (
            <div className="rounded-lg border p-4">
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
                    disabled={isSubmitting}
                  />
                </div>

                <div className="self-end space-y-1 text-sm text-muted-foreground">
                  <div>Max refundable amount: €{normalizeCurrency(orderTotal)}</div>
                  <div>
                    Refund percentage:{" "}
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
                    key="money-reason"
                    value={moneyRefundReason || undefined}
                    onValueChange={setMoneyRefundReason}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full border border-input">
                      <SelectValue placeholder="Select a reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {REFUND_REASON_GROUPS.map((group, groupIndex) => (
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
                          {groupIndex < REFUND_REASON_GROUPS.length - 1 ? (
                            <SelectSeparator />
                          ) : null}
                        </React.Fragment>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ) : null}

          {refundMode !== "money" ? (
            <div className="space-y-4">
              {lineRefunds.map((line) => (
                <div key={line.key} className="rounded-lg border p-4">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-12 flex items-start gap-3 md:col-span-4">
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
                        <div className="line-clamp-2 font-medium">
                          {line.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          SKU: {line.sku}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Quantity: {line.quantity}
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
                        Units (0-{line.quantity})
                      </Label>
                      <Select
                        key={`${refundMode}-${line.key}-units`}
                        value={String(line.units)}
                        onValueChange={(value) =>
                          updateActiveLineForm(line.key, (prev) => ({
                            ...prev,
                            units: Number(value),
                            amountInput:
                              refundMode === "partial"
                                ? formatAmountInput(
                                    clamp(
                                      parseAmountInput(prev.amountInput),
                                      0,
                                      Number(value) * line.unitPrice,
                                    ),
                                  )
                                : prev.amountInput,
                          }))
                        }
                            disabled={isSubmitting}
                      >
                        <SelectTrigger className="w-full border border-input">
                          <SelectValue placeholder="Select units" />
                        </SelectTrigger>
                        <SelectContent>
                          {(
                            refundMode === "full"
                              ? [0, line.quantity]
                              : Array.from(
                                  { length: line.quantity + 1 },
                                  (_, index) => index,
                                )
                          ).map((option) => (
                            <SelectItem key={option} value={String(option)}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-6 md:col-span-2">
                      {refundMode === "partial" ? (
                        <>
                          <Label className="mb-1 block text-xs text-muted-foreground">
                            Amount (0-{normalizeCurrency(line.partialMaxAmount)})
                          </Label>
                          <Input
                            type="number"
                            min={0}
                            max={line.partialMaxAmount}
                            step="0.01"
                            value={
                              activeLineFormByKey[line.key]?.amountInput ?? ""
                            }
                            onChange={(event) => {
                              const rawValue = event.target.value;

                              if (!rawValue.trim()) {
                                updateActiveLineForm(line.key, (prev) => ({
                                  ...prev,
                                  amountInput: "",
                                }));
                                return;
                              }

                              const parsedValue = Number(
                                rawValue.replace(",", "."),
                              );
                              if (Number.isNaN(parsedValue)) return;

                              const clampedValue = clamp(
                                parsedValue,
                                0,
                                line.partialMaxAmount,
                              );
                              updateActiveLineForm(line.key, (prev) => ({
                                ...prev,
                                amountInput:
                                  parsedValue === clampedValue
                                    ? rawValue
                                    : formatAmountInput(clampedValue),
                              }));
                            }}
                            disabled={isSubmitting || line.units <= 0}
                          />
                        </>
                      ) : null}
                    </div>

                    <div className="col-span-12 md:col-span-2">
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
                      key={`${refundMode}-${line.key}-reason`}
                      value={line.reason || undefined}
                      onValueChange={(value) =>
                        updateActiveLineForm(line.key, (prev) => ({
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
                        {REFUND_REASON_GROUPS.map((group, groupIndex) => (
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
                            {groupIndex < REFUND_REASON_GROUPS.length - 1 ? (
                              <SelectSeparator />
                            ) : null}
                          </React.Fragment>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="mt-4">
                    <Label className="mb-2 block text-xs text-muted-foreground">
                      Upload files
                    </Label>
                    <div
                      onDragOver={(event) =>
                        handleLineDragOver(line.key, event)
                      }
                      onDragEnter={(event) =>
                        handleLineDragOver(line.key, event)
                      }
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
                              onClick={() =>
                                handleRemoveLineImage(line.key, image.id)
                              }
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
          ) : null}

          {refundMode !== "money" ? (
            <div className="rounded-lg border p-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-6">
                  <div className="font-medium">Shipping fee</div>
                  <div className="text-sm text-muted-foreground">
                    Max refundable shipping: €
                    {normalizeCurrency(shippingMaxAmount)}
                  </div>
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
                  {refundMode === "full" ? (
                    <>
                      <Label className="mb-1 block text-xs text-muted-foreground">
                        Units (0-1)
                      </Label>
                      <Select
                        key={`${refundMode}-shipping-units`}
                        value={String(activeShippingForm.units > 0 ? 1 : 0)}
                        onValueChange={(value) =>
                          updateActiveShippingForm((prev) => ({
                            ...prev,
                            units: Number(value),
                          }))
                        }
                        disabled={isSubmitting || !isShippingRefundAllowed}
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
                        value={
                          isShippingRefundAllowed
                            ? activeShippingForm.amountInput
                            : "0"
                        }
                        onChange={(event) => {
                          const rawValue = event.target.value;

                          if (!rawValue.trim()) {
                            updateActiveShippingForm((prev) => ({
                              ...prev,
                              amountInput: "0",
                            }));
                            return;
                          }

                          const parsedValue = Number(
                            rawValue.replace(",", "."),
                          );
                          if (Number.isNaN(parsedValue)) return;

                          const clampedValue = clamp(
                            parsedValue,
                            0,
                            shippingMaxAmount,
                          );
                          updateActiveShippingForm((prev) => ({
                            ...prev,
                            amountInput:
                              parsedValue === clampedValue
                                ? rawValue
                                : formatAmountInput(clampedValue),
                          }));
                        }}
                        disabled={isSubmitting || !isShippingRefundAllowed}
                      />
                    </>
                  )}
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
          ) : null}

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
