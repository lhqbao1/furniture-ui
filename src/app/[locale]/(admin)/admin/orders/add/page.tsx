"use client";

import React, { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCreateCheckOutManual } from "@/features/checkout/hook";
import { useTranslations } from "next-intl";
import z from "zod";
import { AdminCheckOutUserInformation } from "@/components/layout/admin/orders/order-create/admin-user-information";
import {
  manualCheckoutDefaultValues,
  ManualCreateOrderFormValues,
  ManualCreateOrderSchema,
} from "@/lib/schema/manual-checkout";
import dynamic from "next/dynamic";
import { ProductItem } from "@/types/products";

// Shipping Address
const ManualCheckOutShippingAddress = dynamic(
  () =>
    import("@/components/layout/admin/orders/order-create/shipping-address"),
  {
    ssr: false,
  },
);

// Additional Info
const ManualAdditionalInformation = dynamic(
  () =>
    import(
      "@/components/layout/admin/orders/order-create/manual-additional-details"
    ),
  {
    ssr: false,
  },
);

// Select Products
const SelectOrderItems = dynamic(
  () => import("@/components/layout/admin/orders/order-create/select-product"),
  {
    ssr: false,
  },
);

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
}

export default function CreateCheckoutpage() {
  const t = useTranslations();
  const createOrderManualMutation = useCreateCheckOutManual();
  const [listProducts, setListProducts] = useState<SelectedProduct[]>([]);

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
        recipient_name: values.recipient_name
          ? values.recipient_name
          : values.first_name + values.last_name,
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
            const firstError = Object.values(errors)[0]?.message;
            if (firstError) toast.error(firstError);
          },
        )}
        className="flex flex-col gap-8 pb-12"
      >
        <h2 className="section-header">Create Order</h2>

        {/* Main container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* User information and address */}
          <div className="col-span-1 space-y-4 lg:space-y-12">
            <AdminCheckOutUserInformation isAdmin />
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
