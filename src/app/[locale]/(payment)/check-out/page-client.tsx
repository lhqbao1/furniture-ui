"use client";

import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  checkoutDefaultValues,
  CreateOrderFormValues,
  CreateOrderSchema,
} from "@/lib/schema/checkout";
import CheckOutFormSection from "@/components/layout/checkout/check-out-form-section";

export default function CheckOutPageClient() {
  const t = useTranslations();

  const schema = CreateOrderSchema(t);
  const form = useForm<CreateOrderFormValues>({
    resolver: zodResolver(schema),
    defaultValues: checkoutDefaultValues,
    mode: "onSubmit",
  });

  return (
    <FormProvider {...form}>
      <CheckOutFormSection />
    </FormProvider>
  );
}
