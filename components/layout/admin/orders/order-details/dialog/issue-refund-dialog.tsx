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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useReturnIssueOrder,
  useUpdateReasonForMainCheckout,
} from "@/features/checkout/hook";
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

type RefundLine = {
  key: string;
  name: string;
  sku: string;
  image: string | null;
  quantity: number;
  unitPrice: number;
  maxAmount: number;
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
    return {
      key: `${item.id}-${index}`,
      name: item.purchased_products?.name || item.products?.name || "Unnamed product",
      sku:
        item.purchased_products?.sku ||
        item.products?.sku ||
        item.products?.id_provider ||
        "-",
      image:
        item.image_url ||
        item.purchased_products?.image ||
        item.products?.static_files?.[0]?.url ||
        null,
      quantity,
      unitPrice,
      maxAmount: quantity * unitPrice,
    };
  });

const IssueRefundDialog = ({
  id,
  order,
  open,
  onClose,
}: ReturnConfirmDialogProps) => {
  const returnIssueMutation = useReturnIssueOrder();
  const updateReasonMutation = useUpdateReasonForMainCheckout();
  const [refundMode, setRefundMode] = React.useState<RefundMode>("full");

  const [unitsByLine, setUnitsByLine] = React.useState<Record<string, number>>(
    {},
  );
  const [amountByLine, setAmountByLine] = React.useState<Record<string, string>>(
    {},
  );
  const [reasonByLine, setReasonByLine] = React.useState<Record<string, string>>(
    {},
  );

  const [shippingUnits, setShippingUnits] = React.useState(0);
  const [shippingAmountInput, setShippingAmountInput] = React.useState("");

  const isSubmitting =
    returnIssueMutation.isPending || updateReasonMutation.isPending;

  const refundLines = React.useMemo(() => buildRefundLines(order), [order]);
  const shippingMaxAmount = Math.max(0, Number(order.total_shipping ?? 0));
  const orderTotal = Math.max(0, Number(order.total_amount ?? 0));

  React.useEffect(() => {
    if (!open) return;

    const initialUnits: Record<string, number> = {};
    const initialAmounts: Record<string, string> = {};
    for (const line of refundLines) {
      initialUnits[line.key] = line.quantity;
      initialAmounts[line.key] = "";
    }

    setRefundMode("full");
    setUnitsByLine(initialUnits);
    setAmountByLine(initialAmounts);
    setReasonByLine({});
    setShippingUnits(0);
    setShippingAmountInput("");
  }, [open, refundLines]);

  const lineRefunds = React.useMemo(
    () =>
      refundLines.map((line) => {
        const units = clamp(
          Math.floor(Number(unitsByLine[line.key] ?? 0)),
          0,
          line.quantity,
        );

        const partialAmount = clamp(
          parseAmountInput(amountByLine[line.key] ?? ""),
          0,
          line.maxAmount,
        );

        const amount = refundMode === "full" ? units * line.unitPrice : partialAmount;

        return {
          ...line,
          units,
          amount,
          reason: reasonByLine[line.key]?.trim() ?? "",
        };
      }),
    [amountByLine, reasonByLine, refundLines, refundMode, unitsByLine],
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

  const handleClose = () => {
    onClose();
  };

  const handleConfirm = async () => {
    const productRefundLines = lineRefunds.filter((line) => line.amount > 0);
    const hasShippingRefund = shippingRefundAmount > 0;

    if (productRefundLines.length === 0 && !hasShippingRefund) {
      toast.error("Please add refund amount for products or shipping");
      return;
    }

    const missingProductReason = productRefundLines.find((line) => !line.reason);
    if (missingProductReason) {
      toast.error(`Reason is required for ${missingProductReason.name}`);
      return;
    }

    if (totalRefundAmount <= 0) {
      toast.error("Refund amount must be greater than 0");
      return;
    }

    const reasonParts = productRefundLines.map((line) =>
      refundMode === "full"
        ? `${line.sku} x${line.units}: ${line.reason}`
        : `${line.sku} €${normalizeCurrency(line.amount)}: ${line.reason}`,
    );

    if (hasShippingRefund) {
      reasonParts.push(`SHIPPING €${normalizeCurrency(shippingRefundAmount)}`);
    }

    const refundReason = reasonParts.join(" | ");

    try {
      await updateReasonMutation.mutateAsync({
        main_checkout_id: id,
        reason: refundReason,
      });

      await returnIssueMutation.mutateAsync({
        main_checkout_id: id,
        amount_refund: Number(totalRefundAmount.toFixed(2)),
      });

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
                        Quantity: {line.quantity}
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
                            setUnitsByLine((prev) => ({
                              ...prev,
                              [line.key]: Number(value),
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
                          value={amountByLine[line.key] ?? ""}
                          onChange={(event) => {
                            const rawValue = event.target.value;

                            if (!rawValue.trim()) {
                              setAmountByLine((prev) => ({
                                ...prev,
                                [line.key]: "",
                              }));
                              return;
                            }

                            const parsedValue = Number(rawValue.replace(",", "."));
                            if (Number.isNaN(parsedValue)) return;

                            const clampedValue = clamp(parsedValue, 0, line.maxAmount);
                            setAmountByLine((prev) => ({
                              ...prev,
                              [line.key]:
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
                      setReasonByLine((prev) => ({
                        ...prev,
                        [line.key]: value,
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
