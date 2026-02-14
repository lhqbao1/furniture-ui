"use client";

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

interface ProductPricingFieldsProps {
  isDsp?: boolean;
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
  const carrier = useWatch({
    control: form.control,
    name: "carrier",
  });
  const mergedPackage = aggregatePackages(packages ?? [], bundles ?? []);
  const { cost, error } = calcDeliveryCost(
    mergedPackage ? [mergedPackage] : [],
    carrier,
  );

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="lg:col-span-3 col-span-12">
        <FormField
          control={form.control}
          name="cost"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-black font-semibold text-sm">
                {isDsp ? "Purchase Price" : "Purchase Cost"}
              </FormLabel>
              <FormControl>
                <div className="relative flex items-center w-full">
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    className="pl-7"
                    step="0.01"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : e.target.valueAsNumber,
                      )
                    }
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
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-black font-semibold text-sm">
                Delivery cost
              </FormLabel>
              <FormControl>
                <div className="relative flex items-center w-full">
                  <Input
                    {...field}
                    type="number"
                    // min={0}
                    className="pl-7"
                    step="0.01" // hoặc "any" để cho phép mọi số thập phân
                    inputMode="decimal" // hint cho bàn phím mobile
                    value={field.value ?? ""} // tránh uncontrolled / NaN
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : e.target.valueAsNumber,
                      )
                    }
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
                    ? `Suggested: €${cost}`
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
          render={({ field }) => (
            <FormItem className="flex flex-col lg:col-span-3 col-span-12">
              <FormLabel className="text-black font-semibold text-sm">
                Return cost
              </FormLabel>
              <FormControl>
                <div className="relative flex items-center w-full">
                  <Input
                    {...field}
                    type="number"
                    // min={0}
                    className="pl-7"
                    step="0.01" // hoặc "any" để cho phép mọi số thập phân
                    inputMode="decimal" // hint cho bàn phím mobile
                    value={field.value ?? ""} // tránh uncontrolled / NaN
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : e.target.valueAsNumber,
                      )
                    }
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
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-black font-semibold text-sm">
                    UVP
                  </FormLabel>
                  <FormControl>
                    <div className="relative flex items-center">
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        className="pl-7"
                        step="0.01"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? null
                              : e.target.valueAsNumber,
                          )
                        }
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
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-black font-semibold text-sm">
                    Sale Price
                  </FormLabel>
                  <FormControl>
                    <div className="relative flex items-center">
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        className="pl-7"
                        step="0.01"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? null
                              : e.target.valueAsNumber,
                          )
                        }
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
