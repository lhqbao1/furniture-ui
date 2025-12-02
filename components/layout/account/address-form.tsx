"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  addressDefaultValues,
  AddressFormValues,
  addressSchema,
} from "@/lib/schema/address";
import {
  useCreateAddress,
  useCreateInvoiceAddress,
  useUpdateAddress,
  useUpdateInvoiceAddress,
} from "@/features/address/hook";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Address } from "@/types/address";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { COUNTRY_OPTIONS } from "@/data/data";

// 🧩 Extend schema để thêm first_name + last_name (chỉ dùng ở UI)
const extendedAddressSchema = addressSchema.extend({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
});

type ExtendedAddressFormValues = z.infer<typeof extendedAddressSchema>;

interface AddressFormProps {
  setOpen: (open: boolean) => void;
  open: boolean;
  userId: string;
  currentAddress?: Address;
  isInvoice?: boolean;
}

export default function AddressForm({
  setOpen,
  open,
  userId,
  currentAddress,
  isInvoice,
}: AddressFormProps) {
  const createAddressMutation = useCreateAddress();
  const updateAddressMutation = useUpdateAddress();
  const createInvoiceAddressMutation = useCreateInvoiceAddress();
  const updateInvoiceAddressMutation = useUpdateInvoiceAddress();
  const t = useTranslations();
  const [openCountry, setOpenCountry] = useState(false);

  const form = useForm<ExtendedAddressFormValues>({
    resolver: zodResolver(extendedAddressSchema),
    defaultValues: {
      ...addressDefaultValues,
      first_name: "",
      last_name: "",
    },
  });

  // 🔹 Khi load address cũ, tách recipient_name thành first/last
  useEffect(() => {
    if (currentAddress) {
      let first = "";
      let last = "";

      if (currentAddress.recipient_name) {
        const fullName = currentAddress.recipient_name.trim();
        const lastSpaceIndex = fullName.lastIndexOf(" ");

        if (lastSpaceIndex !== -1) {
          first = fullName.slice(0, lastSpaceIndex);
          last = fullName.slice(lastSpaceIndex + 1);
        } else {
          // chỉ có 1 từ → coi là first_name
          first = fullName;
          last = "";
        }
      }

      form.reset({
        ...currentAddress,
        first_name: first,
        last_name: last,
      });
    }
  }, [currentAddress, form]);

  const handleSubmit = (data: ExtendedAddressFormValues) => {
    const payload: AddressFormValues = {
      ...data,
      user_id: userId,
      recipient_name:
        `${data.first_name.trim()} ${data.last_name.trim()}`.trim(),
    };

    if (currentAddress && isInvoice) {
      updateInvoiceAddressMutation.mutate(
        { addressId: currentAddress.id, address: payload },
        {
          onSuccess: () => {
            toast.success(t("invoiceAddressUpdateSuccess"));
            form.reset();
            setOpen(false);
          },
          onError: () => {
            toast.error(t("invoiceAddressUpdateFail"));
          },
        },
      );
    } else if (currentAddress) {
      updateAddressMutation.mutate(
        { addressId: currentAddress.id, address: payload },
        {
          onSuccess: () => {
            toast.success(t("shippingAddressUpdateSuccess"));
            form.reset();
            setOpen(false);
          },
          onError: () => {
            toast.error(t("shippingAddressUpdateFail"));
          },
        },
      );
    } else if (isInvoice) {
      createInvoiceAddressMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t("invoiceAddressCreateSuccess"));
          form.reset();
          setOpen(false);
        },
        onError: () => {
          toast.error(t("invoiceAddressCreateFail"));
        },
      });
    } else {
      createAddressMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(t("shippingAddressCreateSuccess"));
          form.reset();
          setOpen(false);
        },
        onError: () => {
          toast.error(t("shippingAddressCreateFail"));
        },
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(
          (values) => {
            handleSubmit(values);
          },
          (errors) => {
            console.log(errors);
            toast.error("Please check the form for errors");
          },
        )}
        className="grid grid-cols-2 gap-6"
      >
        {/* First Name */}
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem className="col-span-2 lg:col-span-1">
              <FormLabel>{t("first_name")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("first_name")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Last Name */}
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem className="col-span-2 lg:col-span-1">
              <FormLabel>{t("last_name")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("last_name")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone */}
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem className="col-span-2 lg:col-span-1">
              <FormLabel>{t("phone_number")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address */}
        <FormField
          control={form.control}
          name="address_line"
          render={({ field }) => (
            <FormItem className="col-span-2 lg:col-span-1">
              <FormLabel>{t("streetAndHouse")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Additional Address */}
        <FormField
          control={form.control}
          name="additional_address_line"
          render={({ field }) => (
            <FormItem className="col-span-2 lg:col-span-2">
              <FormLabel>{t("additionalAddressLine")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* City */}
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem className="col-span-2 lg:col-span-1">
              <FormLabel>{t("city")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Postal Code */}
        <FormField
          control={form.control}
          name="postal_code"
          render={({ field }) => (
            <FormItem className="col-span-2 lg:col-span-1">
              <FormLabel>{t("postalCode")}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-black text-sm">
                {t("country")}
              </FormLabel>

              <Popover
                open={openCountry}
                onOpenChange={setOpenCountry}
              >
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                      onClick={() => setOpenCountry(!openCountry)}
                    >
                      {field.value
                        ? COUNTRY_OPTIONS.find((c) => c.value === field.value)
                            ?.label
                        : "Select country"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>

                <PopoverContent className="w-full p-0 h-[150px] pointer-events-auto">
                  <Command>
                    <CommandInput placeholder="" />
                    <CommandList>
                      <CommandEmpty>{t("noCountry")}</CommandEmpty>
                      <CommandGroup>
                        {COUNTRY_OPTIONS.map((c) => (
                          <CommandItem
                            key={c.value}
                            value={c.label}
                            onSelect={() => {
                              field.onChange(c.value);
                              setOpenCountry(false); // 🔥 đóng popover sau khi chọn
                            }}
                            className="cursor-pointer"
                          >
                            {c.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <div className="col-span-2 flex justify-center">
          <Button
            type="submit"
            className="bg-secondary hover:bg-secondary w-full lg:w-fit"
            disabled={
              createAddressMutation.isPending ||
              updateAddressMutation.isPending ||
              createInvoiceAddressMutation.isPending ||
              updateInvoiceAddressMutation.isPending
            }
          >
            {createAddressMutation.isPending ||
            updateAddressMutation.isPending ||
            createInvoiceAddressMutation.isPending ||
            updateInvoiceAddressMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              t("save")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
