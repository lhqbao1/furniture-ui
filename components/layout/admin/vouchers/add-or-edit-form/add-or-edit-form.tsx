import React, { useEffect } from "react";
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
import {
  useCreateVoucher,
  useCreateVoucherShipping,
  useUpdateVoucher,
} from "@/features/vouchers/hook";
import { Switch } from "@/components/ui/switch";

type AddOrEditVouchersFormProps = {
  submitText?: string;
  onClose?: () => void;
  voucherValues?: VoucherItem;
};

function removeZ(dateString?: string) {
  if (!dateString) return dateString;
  return dateString.replace(/Z$/, "");
}

export default function AddOrEditVouchersForm({
  submitText,
  onClose,
  voucherValues,
}: AddOrEditVouchersFormProps) {
  const form = useForm<VoucherFormValues>({
    resolver: zodResolver(voucherSchema),
    defaultValues: voucherValues ? voucherValues : voucherDefaultValues,
  });

  const createVoucherMutation = useCreateVoucher();
  const editVoucherMutation = useUpdateVoucher();
  const createShippingVoucherMutation = useCreateVoucherShipping();

  const watchType = form.watch("type");
  const watchDiscountType = form.watch("discount_type");
  const watchCarrier = form.watch("shipping_method");

  useEffect(() => {
    if (watchType === "shipping" && watchDiscountType === "freeship") {
      if (watchCarrier === "dpd") {
        form.setValue("discount_value", 5.95);
        form.setValue("max_discount", 5.95);
      }

      if (watchCarrier === "amm") {
        form.setValue("discount_value", 35.95);
        form.setValue("max_discount", 35.95);
      }
    }
  }, [watchType, watchDiscountType, watchCarrier, form]);

  useEffect(() => {
    if (watchType !== "shipping") {
      form.setValue("shipping_method", null);
    }
  }, [watchType, form]);

  async function handleSubmit(values: VoucherFormValues) {
    const payload = {
      ...values,
      start_at: removeZ(values.start_at) ?? "",
      end_at: removeZ(values.end_at) ?? "",
    };

    if (voucherValues) {
      editVoucherMutation.mutate(
        {
          voucher_id: voucherValues.id,
          input: {
            discount_value: payload.discount_value,
            end_at: payload.end_at ?? "",
            is_active: payload.is_active,
            max_discount: payload.max_discount,
            min_order_value: payload.min_order_value,
            name: payload.name,
            start_at: payload.start_at ?? "",
            total_usage_limit: payload.total_usage_limit,
            user_usage_limit: payload.user_usage_limit,
          },
        },
        {
          onSuccess() {
            toast.success("Edit voucher successful");
            form.reset();
            onClose?.();
          },
          onError() {
            toast.error("Edit voucher fail");
          },
        },
      );
    } else {
      createVoucherMutation.mutate(payload, {
        onSuccess(data, variables) {
          toast.success("Create voucher successful");
          if (variables.type === "shipping") {
            createShippingVoucherMutation.mutate({
              max_shipping_discount: variables.discount_value,
              voucher_id: data.id,
              shipping_method: variables.shipping_method ?? "",
            });
          }
          form.reset();
          onClose?.();
        },
        onError() {
          toast.error("Create voucher fail");
        },
      });
    }
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
        {/* Voucher status */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-start gap-2 w-fit">
              <div className="space-y-1">
                <FormLabel>Status</FormLabel>
              </div>

              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-secondary"
                />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />
        {/* Voucher Code */}
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

        {/* Voucher Name */}
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

        {/* Voucher Type */}
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
                      <RadioGroupItem value="product" />
                    </FormControl>
                    <FormLabel className="cursor-pointer">Product</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <RadioGroupItem value="user_specific" />
                    </FormControl>
                    <FormLabel className="cursor-pointer">User</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <RadioGroupItem
                        value="shipping"
                        // disabled={watchDiscountType === "freeship"}
                      />
                    </FormControl>
                    <FormLabel
                      // className={`cursor-pointer
                      //   ${
                      //     watchDiscountType === "freeship"
                      //       ? "text-gray-300"
                      //       : ""
                      //   }
                      // `}
                      className="curosr-pointer"
                    >
                      Shipping
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Voucher Discount Type */}
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
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchType === "shipping" && (
          <FormField
            control={form.control}
            name="shipping_method"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Carrier</FormLabel>

                <FormControl>
                  <RadioGroup
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    className="flex gap-6"
                  >
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <RadioGroupItem value="dpd" />
                      </FormControl>
                      <FormLabel className="cursor-pointer">DPD</FormLabel>
                    </FormItem>

                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <RadioGroupItem value="amm" />
                      </FormControl>
                      <FormLabel className="cursor-pointer">
                        Spedition
                      </FormLabel>
                    </FormItem>

                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <RadioGroupItem value="all" />
                      </FormControl>
                      <FormLabel className="cursor-pointer">All</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-3 gap-2">
          {/* Voucher Discount Value */}
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
                      disabled={
                        watchDiscountType === "freeship" &&
                        watchType === "shipping"
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
                <FormLabel>Max Discount (Optional)</FormLabel>
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
                      disabled={
                        watchDiscountType === "freeship" &&
                        watchType === "shipping"
                      }
                    />
                    <span className="absolute left-3 text-gray-500">€</span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/*Min Order Value */}
          <FormField
            control={form.control}
            name="min_order_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Min Order Value (Optional)</FormLabel>
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
          {/* Voucher Start Date */}
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

          {/* Voucher Expired Date */}
          <FormField
            control={form.control}
            name="end_at"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expired Date</FormLabel>

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
          {/* <FormField
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
          /> */}
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
                submitText ?? "Update Voucher"
              )
            ) : createVoucherMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              submitText ?? "Create Voucher"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
