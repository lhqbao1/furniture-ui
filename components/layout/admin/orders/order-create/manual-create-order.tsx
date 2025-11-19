"use client";

import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

export function AdminManualCreateOrder() {
  const form = useFormContext();
  const t = useTranslations();

  return (
    <div className="space-y-4">
      <div className="flex justify-between bg-secondary/10 p-2">
        <h2 className="text-lg text-black font-semibold ">Manual Fields</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="user_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Code</FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="created_at"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Created Date</FormLabel>
              <FormControl>
                <Input
                  placeholder="dd/mm/yyyy"
                  {...field}
                  onBlur={(e) => {
                    const value = e.target.value.trim();
                    // ✅ Match định dạng dd/mm/yyyy
                    const match = value.match(
                      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
                    );
                    if (match) {
                      const [_, day, month, year] = match;
                      const date = new Date(
                        Number(year),
                        Number(month) - 1,
                        Number(day),
                      );
                      const formatted = date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                      // Gán lại vào form (dạng “Oct 6, 2025”)
                      field.onChange(formatted);
                    } else {
                      field.onChange(value);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shipping_cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shipping Cost</FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  {...field}
                  type="number"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="total_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Amount</FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  {...field}
                  type="number"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="total_vat"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total VAT</FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  {...field}
                  type="number"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="invoice_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Invoice Code</FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="net_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Net Amount</FormLabel>
              <FormControl>
                <Input
                  placeholder=""
                  {...field}
                  type="number"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
