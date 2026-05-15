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
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePostalCitySuggestions } from "@/hooks/checkout/usePostalCitySuggestions";
import { Loader2 } from "lucide-react";

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

  const [isSameShipping, setIsSameShipping] = useState(true);
  const invoicePostalCode = useWatch({
    control: form.control,
    name: "invoice_postal_code",
  });
  const { cities: invoiceCitySuggestions, isLoading: isLoadingInvoiceCity } =
    usePostalCitySuggestions(invoicePostalCode);

  useEffect(() => {
    const sanitizedPostalCode = String(invoicePostalCode ?? "")
      .replace(/\D/g, "")
      .slice(0, 5);

    if (sanitizedPostalCode.length !== 5) {
      form.setValue("invoice_city", "");
      return;
    }

    form.setValue("invoice_city", invoiceCitySuggestions[0] ?? "");
  }, [invoicePostalCode, invoiceCitySuggestions, form]);

  // Lưu invoice gốc để restore khi user tắt switch
  const invoiceSnapshot = useRef<InvoiceAddressValues | null>(null);

  // Hàm sync shipping -> invoice
  const syncFromShipping = useCallback(() => {
    const s = form.getValues();

    const hasShipping =
      s.shipping_address_line ||
      s.shipping_address_additional ||
      s.shipping_postal_code ||
      s.shipping_city;

    if (!hasShipping) return; // shipping chưa có dữ liệu → không sync

    form.setValue("invoice_address_line", s.shipping_address_line || "");
    form.setValue(
      "invoice_address_additional",
      s.shipping_address_additional || "",
    );
    form.setValue("invoice_postal_code", s.shipping_postal_code || "");
    form.setValue("invoice_city", s.shipping_city || "");
  }, [form]);

  // Logic xử lý toggle ON/OFF
  useEffect(() => {
    if (isSameShipping) {
      // Lưu lại invoice hiện tại
      invoiceSnapshot.current = {
        invoice_address_line: form.getValues("invoice_address_line"),
        invoice_address_additional: form.getValues(
          "invoice_address_additional",
        ),
        invoice_postal_code: form.getValues("invoice_postal_code"),
        invoice_city: form.getValues("invoice_city"),
      };

      // Đồng bộ invoice ngay lập tức
      syncFromShipping();
    } else {
      // Restore invoice khi user tắt switch
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
  }, [isSameShipping, syncFromShipping, form]);

  // Sync khi shipping thay đổi NHƯNG chỉ khi toggle = ON
  useEffect(() => {
    if (!isSameShipping) return;

    // watch theo từng shipping field
    const subscription = form.watch((values, { name }) => {
      if (
        isSameShipping &&
        name &&
        name.startsWith("shipping_") // chỉ sync khi shipping thay đổi
      ) {
        syncFromShipping();
      }
    });

    return () => subscription.unsubscribe();
  }, [isSameShipping, syncFromShipping, form]);

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

      {!isSameShipping && (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="invoice_address_line"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>{t("streetAndHouse")}</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>{t("addressSupplement")}</FormLabel>
                <FormControl>
                  <Input {...field} />
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
                <FormLabel>{t("postalCode")}</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={5}
                    value={field.value ?? ""}
                    onChange={(event) => {
                      const sanitized = event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 5);
                      field.onChange(sanitized);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
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
                <FormLabel>{t("city")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    list="invoice-city-suggestion-list-secondary"
                  />
                </FormControl>
                <datalist id="invoice-city-suggestion-list-secondary">
                  {invoiceCitySuggestions.map((city) => (
                    <option
                      key={city}
                      value={city}
                    />
                  ))}
                </datalist>
                {isLoadingInvoiceCity && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Stadt wird gesucht...</span>
                  </div>
                )}
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
