"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCreateCheckOutManual } from "@/features/checkout/hook";
import { useTranslations } from "next-intl";
import z from "zod";
import {
  manualCheckoutDefaultValues,
  ManualCreateOrderFormValues,
  ManualCreateOrderSchema,
} from "@/lib/schema/manual-checkout";
import { ProductItem } from "@/types/products";

import { AdminCheckOutUserInformation } from "@/components/layout/admin/orders/order-create/admin-user-information";
import ManualCheckOutShippingAddress from "@/components/layout/admin/orders/order-create/shipping-address";
import ManualAdditionalInformation from "@/components/layout/admin/orders/order-create/manual-additional-details";
import SelectOrderItems from "@/components/layout/admin/orders/order-create/select-product";
import { useManualCheckoutLogic } from "@/hooks/admin/order-create/useOrderCreate";
import { calculateShippingCost } from "@/hooks/caculate-shipping";

export interface CartItem {
  id: number;
  name: string;
  color: string;
  size: string;
  unitPrice: number;
  quantity: number;
  imageUrl: string;
}

interface SelectedProduct {
  product: ProductItem;
  quantity: number;
  final_price: number;
  carrier: string;
}

export default function CreateOrderPageClient() {
  const t = useTranslations();
  const createOrderManualMutation = useCreateCheckOutManual();
  const [listProducts, setListProducts] = useState<SelectedProduct[]>([]);
  const [disabledFields, setDisabledFields] = useState<string[]>([]);

  const form = useForm<ManualCreateOrderFormValues>({
    resolver: zodResolver(ManualCreateOrderSchema),
    defaultValues: manualCheckoutDefaultValues,
  });

  useManualCheckoutLogic(form, setDisabledFields);

  function handleSubmit(values: z.infer<typeof ManualCreateOrderSchema>) {
    const totalShipping = values.items.find((i) => i.carrier === "amm")
      ? 35.95
      : 5.95;

    const orderCarrier = totalShipping === 35.95 ? "spedition" : "dpd";

    if (
      orderCarrier === "spedition" &&
      (!values.phone || values.phone.trim() === "")
    ) {
      toast.error("Phone number is required for SPEDITION carrier");
      return;
    }
    createOrderManualMutation.mutate(
      {
        ...values,
        total_shipping: totalShipping,
        carrier: orderCarrier,
        email:
          values.email && values.email?.length > 0 ? values.email : "guest",
        company_name:
          values.company_name?.trim() === "" ? null : values.company_name,
        additional_address:
          values.additional_address?.trim() === ""
            ? null
            : values.additional_address,
        invoice_additional_address:
          values.invoice_additional_address?.trim() === ""
            ? null
            : values.invoice_additional_address,
        tax: 0,
      },
      {
        onSuccess(data, variables, context) {
          toast.success("Create order successfully");
          form.reset();
          setListProducts([]);
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
            // Lấy message lỗi đầu tiên nếu có
            const firstError: any = Object.values(errors)[0];
            const message =
              typeof firstError?.message === "string"
                ? firstError.message
                : undefined;

            if (message) {
              toast.error(message);
            }
          },
        )}
        className="flex flex-col gap-8 pb-12"
      >
        <h2 className="section-header">Create Order</h2>

        {/* Main container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* User information and address */}
          <div className="col-span-1 space-y-4 lg:space-y-12">
            <AdminCheckOutUserInformation
              isAdmin
              disabledFields={disabledFields}
            />
            <ManualCheckOutShippingAddress isAdmin />
            {/* <ManualCheckOutInvoiceAddress isAdmin /> */}
          </div>

          {/* Table cart and total */}
          <div className="col-span-1 space-y-4 lg:space-y-4">
            <ManualAdditionalInformation />
            <SelectOrderItems
              listProducts={listProducts}
              setListProducts={setListProducts}
            />
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
