import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FileDigit, Loader2 } from "lucide-react";
import { SupplierInput, SupplierResponse } from "@/types/supplier";
import { defaultSupplier, supplierSchema } from "@/lib/schema/supplier";
import { useCreateSupplier, useEditSupplier } from "@/features/supplier/hook";
import { VoucherItem } from "@/types/voucher";
import {
  voucherDefaultValues,
  VoucherFormValues,
  voucherSchema,
} from "@/lib/schema/voucher";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

type AddOrEditVouchersFormProps = {
  submitText?: string;
  onClose?: () => void;
  voucherValues?: VoucherItem;
};

export default function AddOrEditVouchersForm({
  submitText,
  onClose,
  voucherValues,
}: AddOrEditVouchersFormProps) {
  const form = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherSchema),
    defaultValues: voucherValues ? voucherValues : voucherDefaultValues,
  });

  const createVoucherMutation = useCreateSupplier();
  const editVoucherMutation = useEditSupplier();

  async function handleSubmit(values: VoucherFormValues) {
    // if (voucherValues) {
    //   editVoucherMutation.mutate(
    //     {
    //       id: voucherValues.id,
    //       input: values,
    //     },
    //     {
    //       onSuccess(data, variables, context) {
    //         toast.success("Create supplier successful");
    //         form.reset();
    //         onClose?.();
    //       },
    //       onError(error, variables, context) {
    //         toast.error("Create supplier fail");
    //       },
    //     },
    //   );
    // } else {
    //   createVoucherMutation.mutate(values, {
    //     onSuccess(data, variables, context) {
    //       toast.success("Create supplier successful");
    //       form.reset();
    //       onClose?.();
    //     },
    //     onError(error, variables, context) {
    //       toast.error("Create supplier fail");
    //     },
    //   });
    // }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(
          (values) => {
            handleSubmit(values);
          },
          (errors) => {
            toast.error("Please check the form for errors");
          },
        )}
        className="space-y-6"
      >
        {/* Business name */}
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voucher Code</FormLabel>
              <FormControl>
                <Input
                  placeholder="Voucher Code"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* VAT ID */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Voucher Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Voucher Name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Type</FormLabel>

              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-1 gap-2"
                >
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <RadioGroupItem value="order" />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Order</FormLabel>
                  </FormItem>

                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <RadioGroupItem value="product" />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Product</FormLabel>
                  </FormItem>

                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <RadioGroupItem value="user_specific" />
                    </FormControl>
                    <FormLabel className="cursor-pointer">
                      User Specific
                    </FormLabel>
                  </FormItem>

                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <RadioGroupItem value="shipping" />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Shipping</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="discount_type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Discount Type</FormLabel>

              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="grid grid-cols-1 gap-3"
                >
                  {/* Percent */}
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <RadioGroupItem value="percent" />
                    </FormControl>
                    <FormLabel className="cursor-pointer">
                      Percent (%)
                    </FormLabel>
                  </FormItem>

                  {/* Fixed Amount */}
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <RadioGroupItem value="fixed" />
                    </FormControl>
                    <FormLabel className="cursor-pointer">
                      Fixed Amount
                    </FormLabel>
                  </FormItem>

                  {/* Free Shipping */}
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <RadioGroupItem value="freeship" />
                    </FormControl>
                    <FormLabel className="cursor-pointer">
                      Free Shipping
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-3 gap-2">
          {/* Discount Value */}
          <FormField
            control={form.control}
            name="discount_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discount Value</FormLabel>
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

          {/*Max Discount Value */}
          <FormField
            control={form.control}
            name="max_discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Discount</FormLabel>
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

          {/* Discount Value */}
          <FormField
            control={form.control}
            name="min_order_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Order Value</FormLabel>
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_at"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>

                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP") // Hiển thị đẹp nhưng value vẫn là ISO
                        ) : (
                          <span>Select a start date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>

                  <PopoverContent className="p-0 pointer-events-auto">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        field.onChange(date?.toISOString() ?? null); // ✔️ trả về ISO date
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_at"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>

                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {field.value ? (
                          format(new Date(field.value), "PPP") // Hiển thị đẹp nhưng value vẫn là ISO
                        ) : (
                          <span>Select a expired date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>

                  <PopoverContent className="p-0 pointer-events-auto">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        field.onChange(date?.toISOString() ?? null); // ✔️ trả về ISO date
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Amount */}
          <FormField
            control={form.control}
            name="total_usage_limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Voucher Amount</FormLabel>
                <FormControl>
                  <div className="relative flex items-center w-full">
                    <Input
                      {...field}
                      type="number"
                      min={0}
                      className="pl-10"
                      step="1"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? null : e.target.valueAsNumber,
                        )
                      }
                    />
                    <span className="absolute left-3 text-gray-500">
                      <FileDigit />
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* User limit usage */}
          <FormField
            control={form.control}
            name="user_usage_limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Limit usage per user</FormLabel>
                <FormControl>
                  <div className="relative flex items-center w-full">
                    <Input
                      {...field}
                      type="number"
                      min={0}
                      className="pl-10"
                      step="1"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? null : e.target.valueAsNumber,
                        )
                      }
                    />
                    <span className="absolute left-3 text-gray-500">
                      <FileDigit />
                    </span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Delivery Cost Type */}
        <div className="flex items-center justify-end">
          <Button
            type="submit"
            disabled={
              voucherValues
                ? editVoucherMutation.isPending
                : createVoucherMutation.isPending
            }
            className="bg-primary hover:bg-primary font-semibold"
          >
            {voucherValues ? (
              editVoucherMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </>
              ) : (
                submitText ?? "Update Supplier"
              )
            ) : createVoucherMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              submitText ?? "Create Supplier"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
