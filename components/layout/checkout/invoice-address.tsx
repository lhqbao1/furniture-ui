"use client";

import { useFormContext } from "react-hook-form";
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

interface InvoiceAddressValues {
  invoice_address_line: string;
  invoice_address_additional?: string;
  invoice_postal_code: string;
  invoice_city: string;
}

interface CheckOutInvoiceAddressProps {
  isAdmin?: boolean;
}

const CheckOutInvoiceAddress = ({ isAdmin = false }: CheckOutInvoiceAddressProps) => {
  const form = useFormContext();
  const t = useTranslations();

  const [isSameShipping, setIsSameShipping] = useState(true);

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
    form.setValue("invoice_address_additional", s.shipping_address_additional || "");
    form.setValue("invoice_postal_code", s.shipping_postal_code || "");
    form.setValue("invoice_city", s.shipping_city || "");
  }, [form]);

  // Logic xử lý toggle ON/OFF
  useEffect(() => {
    if (isSameShipping) {
      // Lưu lại invoice hiện tại
      invoiceSnapshot.current = {
        invoice_address_line: form.getValues("invoice_address_line"),
        invoice_address_additional: form.getValues("invoice_address_additional"),
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
                <FormControl><Input {...field} /></FormControl>
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
                <FormControl><Input {...field} /></FormControl>
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
                  <Input type="text" inputMode="numeric" autoComplete="postal-code" {...field} />
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
                <FormControl><Input {...field} /></FormControl>
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
