"use client";

import { useEffect, useMemo, useState, type ComponentProps } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  aggregatePackages,
  calcDeliveryCost,
} from "@/lib/shipping/delivery-cost";
import { BundleInput } from "@/lib/schema/product";

interface ProductPricingFieldsProps {
  isDsp?: boolean;
}

const germanNumberFormatter = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const germanCurrencyFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatGermanNumber = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "";
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "";

  return germanNumberFormatter.format(numericValue);
};

const parseGermanCurrencyInput = (value: string) => {
  const cleanedValue = value.replace(/[€\s\u00a0]/g, "").trim();
  if (!cleanedValue) return null;

  let normalizedValue = cleanedValue;
  if (normalizedValue.includes(",")) {
    normalizedValue = normalizedValue.replace(/\./g, "").replace(",", ".");
  } else {
    const dotCount = (normalizedValue.match(/\./g) ?? []).length;
    const looksLikeGermanThousands = /^\d{1,3}\.\d{3}$/.test(normalizedValue);

    if (dotCount > 1 || looksLikeGermanThousands) {
      normalizedValue = normalizedValue.replace(/\./g, "");
    }
  }

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : null;
};

type GermanCurrencyInputProps = Omit<
  ComponentProps<typeof Input>,
  "type" | "value" | "onChange"
> & {
  value: unknown;
  isDirty?: boolean;
  onValueChange: (value: number | null) => void;
};

function GermanCurrencyInput({
  value,
  isDirty = false,
  onValueChange,
  onBlur,
  onFocus,
  ...props
}: GermanCurrencyInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [draftValue, setDraftValue] = useState(() =>
    formatGermanNumber(value),
  );
  const displayValue =
    isFocused || isDirty ? draftValue : formatGermanNumber(value);

  useEffect(() => {
    if (isFocused) return;

    const formattedValue = formatGermanNumber(value);
    if (!isDirty || draftValue === "") {
      setDraftValue(formattedValue);
    }
  }, [draftValue, isDirty, isFocused, value]);

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      value={displayValue}
      onFocus={(event) => {
        setDraftValue((currentDraft) =>
          isDirty && currentDraft ? currentDraft : formatGermanNumber(value),
        );
        setIsFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setIsFocused(false);
        onBlur?.(event);
      }}
      onChange={(event) => {
        const nextValue = event.target.value;
        setDraftValue(nextValue);
        onValueChange(parseGermanCurrencyInput(nextValue));
      }}
    />
  );
}

export function ProductPricingFields({ isDsp }: ProductPricingFieldsProps) {
  const form = useFormContext();
  const packages = useWatch({
    control: form.control,
    name: "packages",
  });
  const bundles = useWatch({
    control: form.control,
    name: "bundles",
  });
  const costValue = useWatch({
    control: form.control,
    name: "cost",
  });
  const carrier = useWatch({
    control: form.control,
    name: "carrier",
  });
  const mergedPackage = aggregatePackages(packages ?? [], bundles ?? []);
  const { cost, error } = calcDeliveryCost(
    mergedPackage ? [mergedPackage] : [],
    carrier,
  );
  const hasBundles = Array.isArray(bundles) && bundles.length > 0;

  const bundleCost = useMemo(() => {
    if (!hasBundles) return null;

    return bundles.reduce((sum: number, item: BundleInput) => {
      if (!item) return sum;
      const quantity =
        typeof item.quantity === "number"
          ? item.quantity
          : Number(item.quantity ?? 0);
      const unitCost =
        typeof item.cost === "number" ? item.cost : Number(item.cost ?? 0);
      if (!Number.isFinite(quantity) || !Number.isFinite(unitCost)) return sum;
      if (quantity <= 0 || unitCost <= 0) return sum;
      return sum + unitCost * quantity;
    }, 0);
  }, [bundles, hasBundles]);

  useEffect(() => {
    if (bundleCost == null) return;
    const nextCost = Math.round(bundleCost * 100) / 100;
    const current = Number(costValue ?? 0) || 0;
    if (Math.abs(current - nextCost) < 0.005) return;

    form.setValue("cost", nextCost, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [bundleCost, costValue, form]);

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="lg:col-span-3 col-span-12">
        <FormField
          control={form.control}
          name="cost"
          render={({ field, fieldState }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-black font-semibold text-sm">
                {isDsp ? "Purchase Price" : "Purchase Cost"}
              </FormLabel>
              <FormControl>
                <div className="relative flex items-center w-full">
                  <GermanCurrencyInput
                    name={field.name}
                    ref={field.ref}
                    className="pl-7"
                    value={field.value}
                    isDirty={fieldState.isDirty}
                    disabled={hasBundles}
                    aria-disabled={hasBundles}
                    onBlur={field.onBlur}
                    onValueChange={field.onChange}
                  />
                  <span className="absolute left-3 text-gray-500">€</span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="lg:col-span-3 col-span-12">
        <FormField
          control={form.control}
          name="delivery_cost"
          render={({ field, fieldState }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-black font-semibold text-sm">
                Delivery cost
              </FormLabel>
              <FormControl>
                <div className="relative flex items-center w-full">
                  <GermanCurrencyInput
                    name={field.name}
                    ref={field.ref}
                    className="pl-7"
                    value={field.value}
                    isDirty={fieldState.isDirty}
                    onBlur={field.onBlur}
                    onValueChange={field.onChange}
                  />
                  <span className="absolute left-3 text-gray-500">€</span>
                </div>
              </FormControl>
              <p
                className={
                  error
                    ? "text-xs text-red-600"
                    : "text-xs text-muted-foreground"
                }
              >
                {error
                  ? error
                  : cost != null
                    ? `Suggested: ${germanCurrencyFormatter.format(cost)}`
                    : "Suggested: —"}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {isDsp && (
        <FormField
          control={form.control}
          name="return_cost"
          render={({ field, fieldState }) => (
            <FormItem className="flex flex-col lg:col-span-3 col-span-12">
              <FormLabel className="text-black font-semibold text-sm">
                Return cost
              </FormLabel>
              <FormControl>
                <div className="relative flex items-center w-full">
                  <GermanCurrencyInput
                    name={field.name}
                    ref={field.ref}
                    className="pl-7"
                    value={field.value}
                    isDirty={fieldState.isDirty}
                    onBlur={field.onBlur}
                    onValueChange={field.onChange}
                  />
                  <span className="absolute left-3 text-gray-500">€</span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {isDsp ? (
        ""
      ) : (
        <>
          {/* Price */}
          <div className="lg:col-span-3 col-span-12">
            <FormField
              control={form.control}
              name="price"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-black font-semibold text-sm">
                    UVP
                  </FormLabel>
                  <FormControl>
                    <div className="relative flex items-center">
                      <GermanCurrencyInput
                        name={field.name}
                        ref={field.ref}
                        className="pl-7"
                        value={field.value}
                        isDirty={fieldState.isDirty}
                        onBlur={field.onBlur}
                        onValueChange={field.onChange}
                      />
                      <span className="absolute left-3 text-gray-500">€</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Final Price */}
          <div className="lg:col-span-3 col-span-12">
            <FormField
              control={form.control}
              name="final_price"
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-black font-semibold text-sm">
                    Sale Price
                  </FormLabel>
                  <FormControl>
                    <div className="relative flex items-center">
                      <GermanCurrencyInput
                        name={field.name}
                        ref={field.ref}
                        className="pl-7"
                        value={field.value}
                        isDirty={fieldState.isDirty}
                        onBlur={field.onBlur}
                        onValueChange={field.onChange}
                      />
                      <span className="absolute left-3 text-gray-500">€</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </>
      )}
    </div>
  );
}
