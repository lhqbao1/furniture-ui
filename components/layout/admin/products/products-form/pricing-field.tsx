"use client";

import { useFormContext, UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface ProductPricingFieldsProps {
  isDsp?: boolean;
}

export function ProductPricingFields({ isDsp }: ProductPricingFieldsProps) {
  const form = useFormContext();

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="lg:col-span-3 col-span-12">
        <FormField
          control={form.control}
          name="cost"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-black font-semibold text-sm">
                {isDsp ? "Purchase Price" : "Cost"}
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
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

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
