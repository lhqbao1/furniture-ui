"use client";
import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import React, { useEffect, useRef, useState } from "react";
import "react-phone-input-2/lib/style.css";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface InvoiceAddressValues {
  invoice_address_line: string;
  invoice_address_additional?: string;
  invoice_postal_code: string;
  invoice_city: string;
}

interface CheckOutInvoiceAddressProps {
  isAdmin?: boolean;
}

const CheckOutInvoiceAddress = ({
  isAdmin = false,
}: CheckOutInvoiceAddressProps) => {
  const form = useFormContext();
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [isSameShipping, setIsSameShipping] = useState(true);

  // Watch shipping fields
  const shippingAddressLine = useWatch({
    name: "shipping_address_line",
    control: form.control,
  });
  const shippingPostalCode = useWatch({
    name: "shipping_postal_code",
    control: form.control,
  });
  const shippingCity = useWatch({
    name: "shipping_city",
    control: form.control,
  });
  const shippingAddressAdditional = useWatch({
    name: "shipping_address_additional",
    control: form.control,
  });

  // Dùng ref lưu snapshot invoice gốc
  const invoiceSnapshot = useRef<InvoiceAddressValues | null>(null);

  useEffect(() => {
    if (isSameShipping) {
      // Lưu lại dữ liệu invoice hiện tại
      invoiceSnapshot.current = {
        invoice_address_line: form.getValues("invoice_address_line"),
        invoice_address_additional: form.getValues(
          "invoice_address_additional",
        ),
        invoice_postal_code: form.getValues("invoice_postal_code"),
        invoice_city: form.getValues("invoice_city"),
      };

      // Copy shipping → invoice
      form.setValue("invoice_address_line", shippingAddressLine);
      form.setValue("invoice_address_additional", shippingAddressAdditional);
      form.setValue("invoice_postal_code", shippingPostalCode);
      form.setValue("invoice_city", shippingCity);
    } else {
      // Restore lại snapshot nếu có
      if (invoiceSnapshot.current) {
        form.setValue(
          "invoice_address_line",
          invoiceSnapshot.current.invoice_address_line,
        );
        form.setValue(
          "invoice_address_additional",
          invoiceSnapshot.current.invoice_address_additional ?? "",
        );
        form.setValue(
          "invoice_postal_code",
          invoiceSnapshot.current.invoice_postal_code,
        );
        form.setValue("invoice_city", invoiceSnapshot.current.invoice_city);
      }
    }
  }, [
    isSameShipping,
    shippingAddressLine,
    shippingAddressAdditional,
    shippingPostalCode,
    shippingCity,
    form,
  ]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between flex-col bg-secondary/10 p-2">
        <h2 className="text-lg text-black font-semibold">
          {isAdmin ? "Invoice Address" : t("invoiceAddress")}
        </h2>
        <div className="flex items-center space-x-2">
          <Label htmlFor="same-invoice">
            {isAdmin ? "Same as Shipping" : t("sameAsShipping")}
          </Label>
          <Switch
            id="same-invoice"
            checked={isSameShipping}
            onCheckedChange={setIsSameShipping}
            className="data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-secondary"
          />
        </div>
      </div>
      {isSameShipping === true ? (
        ""
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="invoice_address_line"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>
                  {isAdmin ? "Address line" : t("streetAndHouse")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                    disabled={isSameShipping}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="invoice_address_additional"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>
                  {isAdmin ? "Additional Address" : t("addressSupplement")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                    disabled={isSameShipping}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="invoice_postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {isAdmin ? "Postal Code" : t("postalCode")}
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    {...field}
                    disabled={isSameShipping}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="invoice_city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{isAdmin ? "City" : t("city")}</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    disabled={isSameShipping}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(CheckOutInvoiceAddress);
