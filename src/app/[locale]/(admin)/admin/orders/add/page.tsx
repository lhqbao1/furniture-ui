"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCreateCheckOutManual } from "@/features/checkout/hook";
import { useTranslations } from "next-intl";
import z from "zod";
import ProductSearch from "@/components/shared/product-search";
import { CheckOutUserInformation } from "@/components/layout/checkout/admin-user-information";
import { ProductManual } from "@/components/layout/pdf/manual-invoice";
import {
  manualCheckoutDefaultValues,
  ManualCreateOrderFormValues,
  ManualCreateOrderSchema,
} from "@/lib/schema/manual-checkout";
import ManualCheckOutShippingAddress from "@/components/layout/admin/orders/order-create/shipping-address";
import ManualCheckOutInvoiceAddress from "@/components/layout/admin/orders/order-create/invoice-address";
import ManualAdditionalInformation from "@/components/layout/admin/orders/order-create/manual-additional-details";
import SelectOrderItems from "@/components/layout/admin/orders/order-create/select-product";

export interface CartItem {
  id: number;
  name: string;
  color: string;
  size: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
}

export default function CreateCheckoutpage() {
  const t = useTranslations();
  const createOrderManualMutation = useCreateCheckOutManual();

  const form = useForm<ManualCreateOrderFormValues>({
    resolver: zodResolver(ManualCreateOrderSchema),
    defaultValues: manualCheckoutDefaultValues,
  });

  function handleSubmit(values: z.infer<typeof ManualCreateOrderSchema>) {
    const total_shipping = values.carrier === "spedition" ? 35.95 : 5.95;

    if (
      (values.carrier === "spedition" && !values.phone_number) ||
      values.phone_number === ""
    ) {
      toast.error("Phone number is required for SPEDITION carrier");
      return;
    }

    createOrderManualMutation.mutate(
      {
        ...values,
        total_shipping: total_shipping,
        email: values.email
          ? values.email
          : `${values.first_name}${values.last_name}`,
      },
      {
        onSuccess(data, variables, context) {
          toast.success("Create order successfully");
          form.reset();
        },
        onError(error, variables, context) {
          toast.error("Create order fail");
        },
      },
    );
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(
          (values) => {
            handleSubmit(values);
          },
          (errors) => {
            console.log(errors);
            toast.error(t("checkFormError"));
          },
        )}
        className="flex flex-col gap-8 pb-12"
      >
        <h2 className="section-header">Create Order</h2>

        {/* Main container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* User information and address */}
          <div className="col-span-1 space-y-4 lg:space-y-12">
            {/* <AdminManualCreateOrder /> */}
            <CheckOutUserInformation isAdmin />
            <ManualAdditionalInformation />
            <ManualCheckOutShippingAddress isAdmin />
            <ManualCheckOutInvoiceAddress isAdmin />
          </div>

          {/* Table cart and total */}
          <div className="col-span-1 space-y-4 lg:space-y-4">
            <SelectOrderItems />
            <div className="flex lg:justify-end justify-center gap-2">
              <Button
                type="submit"
                className="text-lg lg:w-1/3 w-1/2 py-6"
              >
                {t("continue")}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
