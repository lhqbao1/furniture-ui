"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCreateCheckOutManual } from "@/features/checkout/hook";
import { useCreateInformationManualOrder } from "@/features/user-order/hook";
import { useTranslations } from "next-intl";
import z from "zod";
import {
  manualCheckoutDefaultValues,
  ManualCreateOrderFormValues,
  ManualCreateOrderSchema,
} from "@/lib/schema/manual-checkout";
import { UserOrderFormValues } from "@/lib/schema/user-order";
import { ProductItem } from "@/types/products";

import { AdminCheckOutUserInformation } from "@/components/layout/admin/orders/order-create/admin-user-information";
import ManualCheckOutShippingAddress from "@/components/layout/admin/orders/order-create/shipping-address";
import ManualAdditionalInformation from "@/components/layout/admin/orders/order-create/manual-additional-details";
import SelectOrderItems from "@/components/layout/admin/orders/order-create/select-product";
import { useManualCheckoutLogic } from "@/hooks/admin/order-create/useOrderCreate";
import {
  calculateProductVATFromNet,
  calculateShippingCostManual,
  calculateShippingGrossFromNet,
} from "@/lib/caculate-vat";
import { getCountryCode } from "@/components/shared/getCountryNameDe";
import { getCarrierFromItems } from "@/lib/get-carrier";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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
  const createInformationManualOrderMutation = useCreateInformationManualOrder();
  const [listProducts, setListProducts] = useState<SelectedProduct[]>([]);
  const [disabledFields, setDisabledFields] = useState<string[]>([]);
  const [saveUserInformation, setSaveUserInformation] = useState(false);
  const [hasSelectedSavedUser, setHasSelectedSavedUser] = useState(false);
  const prevProductIdsRef = React.useRef<string[]>([]);

  const form = useForm<ManualCreateOrderFormValues>({
    resolver: zodResolver(ManualCreateOrderSchema),
    defaultValues: manualCheckoutDefaultValues,
  });

  const listItems = form.watch("items");
  const priceMode = form.watch("price_mode") ?? "gross";
  const countryCode = getCountryCode(form.watch("country"));
  const taxId = form.watch("tax_id") || null;

  const shippingResult = calculateShippingCostManual(
    listItems,
    countryCode,
    taxId,
  );
  const shipping = priceMode === "net" ? shippingResult.net : shippingResult.gross;

  useEffect(() => {
    const productIds = listProducts.map((item) => item.product.id);
    const prevIds = prevProductIdsRef.current;
    const idsChanged =
      productIds.length !== prevIds.length ||
      productIds.some((id, index) => id !== prevIds[index]);

    if (!idsChanged) return;

    prevProductIdsRef.current = productIds;

    // guard item empty
    if (!listProducts || listProducts.length === 0) {
      form.setValue("total_shipping", 0);
      form.setValue("carrier", undefined); // hoặc "" tùy schema
      return;
    }

    const currentItems = form.getValues("items") ?? [];
    const result = calculateShippingCostManual(
      currentItems,
      countryCode,
      taxId,
    );

    const autoShipping = priceMode === "net" ? result.net : result.gross;
    const autoCarrier = getCarrierFromItems(
      listProducts.map((item) => ({
        id_provider: item.product.id_provider,
        quantity: item.quantity,
        final_price: item.final_price,
        carrier: item.carrier,
        title: item.product.name,
        sku: item.product.sku ?? "",
      })),
    );

    const currentShipping = form.getValues("total_shipping");
    const currentCarrier = form.getValues("carrier");

    // chỉ override nếu user chưa nhập
    if (currentShipping == null || currentShipping === 0) {
      form.setValue("total_shipping", autoShipping, { shouldDirty: true });
    }

    if (autoCarrier && autoCarrier !== currentCarrier) {
      form.setValue("carrier", autoCarrier, { shouldDirty: true });
    }
  }, [listProducts, countryCode, taxId, form, priceMode]);

  useManualCheckoutLogic(form, setDisabledFields, {
    skipMarketplacePreset: hasSelectedSavedUser,
  });

  function mapToUserOrderPayload(
    values: z.infer<typeof ManualCreateOrderSchema>,
  ): UserOrderFormValues {
    const getString = (value: string | null | undefined) => value ?? "";
    const genderValue =
      (form.getValues("gender" as never) as string | null | undefined) ?? "";
    const sameAsInvoiceFromToggle =
      (form.getValues("same_as_invoice" as never) as boolean | undefined) ??
      undefined;
    const invoiceFullName = [values.first_name, values.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();

    const sameAsInvoice =
      getString(values.address) === getString(values.invoice_address) &&
      getString(values.additional_address) ===
        getString(values.invoice_additional_address) &&
      getString(values.city) === getString(values.invoice_city) &&
      getString(values.postal_code) === getString(values.invoice_postal_code) &&
      getString(values.country) === getString(values.invoice_country);

    return {
      first_name: getString(values.first_name),
      last_name: getString(values.last_name),
      email: getString(values.email),
      gender: getString(genderValue),
      company: getString(values.company_name),
      tax_id: getString(values.tax_id),
      phone_number: getString(values.phone_number),
      address: getString(values.invoice_address),
      additional_address: getString(values.invoice_additional_address),
      city: getString(values.invoice_city),
      postal_code: getString(values.invoice_postal_code),
      country: getString(values.invoice_country),
      recipient_name:
        getString(values.recipient_name).trim() || invoiceFullName,
      recipient_email:
        getString(values.email_shipping).trim() || getString(values.email),
      recipient_phone_number:
        getString(values.phone).trim() || getString(values.phone_number),
      recipient_address:
        getString(values.address).trim() || getString(values.invoice_address),
      recipient_additional_address:
        getString(values.additional_address).trim() ||
        getString(values.invoice_additional_address),
      recipient_city:
        getString(values.city).trim() || getString(values.invoice_city),
      recipient_postal_code:
        getString(values.postal_code).trim() ||
        getString(values.invoice_postal_code),
      recipient_country:
        getString(values.country).trim() || getString(values.invoice_country),
      same_as_invoice: sameAsInvoiceFromToggle ?? sameAsInvoice,
    };
  }

  function handleSubmit(values: z.infer<typeof ManualCreateOrderSchema>) {
    const { price_mode: priceMode, ...restValues } = values;
    const itemTaxByIdProvider = new Map(
      listProducts.map((item) => [
        String(item.product.id_provider ?? ""),
        item.product.tax ?? null,
      ]),
    );

    const normalizedItems = values.items.map((item) => {
      if (priceMode !== "net") return item;

      const vatInfo = calculateProductVATFromNet(
        Number(item.final_price) || 0,
        itemTaxByIdProvider.get(String(item.id_provider ?? "")) ?? null,
        countryCode,
        taxId,
      );

      return {
        ...item,
        final_price: Number(vatInfo.gross) || 0,
      };
    });

    const shippingInputValue =
      Number(values.total_shipping ?? shipping ?? 0) || 0;
    const normalizedShipping =
      priceMode === "net"
        ? calculateShippingGrossFromNet(
            values.items.map((item) => ({
              unitNet: Number(item.final_price) || 0,
              quantity: Number(item.quantity) || 0,
              tax:
                itemTaxByIdProvider.get(String(item.id_provider ?? "")) ?? null,
            })),
            shippingInputValue,
            countryCode,
            taxId,
          ).gross
        : shippingInputValue;

    createOrderManualMutation.mutate(
      {
        ...restValues,
        items: normalizedItems,
        total_shipping: normalizedShipping,
        carrier: values.carrier?.toUpperCase(),
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
        note: values.note?.trim() ? values.note.trim() : null,
      },
      {
        onSuccess() {
          if (saveUserInformation) {
            createInformationManualOrderMutation.mutate(
              mapToUserOrderPayload(values),
              {
                onError: () => {
                  toast.error("Save user information fail");
                },
              },
            );
          }

          toast.success("Create order successfully");
          form.reset();
          setListProducts([]);
          setHasSelectedSavedUser(false);
          setSaveUserInformation(false);
        },
        onError() {
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
            const firstError = Object.values(errors)[0];
            const message =
              typeof firstError?.message === "string"
                ? firstError.message
                : undefined;

            if (message) {
              toast.error(message);
            }
          },
        )}
        className="mx-auto flex w-full max-w-[1800px] flex-col gap-8 pb-12"
      >
        <div className="rounded-2xl border border-secondary/20 bg-gradient-to-r from-secondary/5 via-background to-secondary/5 px-6 py-5">
          <h2 className="section-header mb-1">Create Order</h2>
          <p className="text-center text-sm text-muted-foreground">
            Create a manual order with clear customer type and complete checkout
            information.
          </p>
        </div>

        {/* Main container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* User information and address */}
          <div className="col-span-1 space-y-6">
            <div className="rounded-2xl border border-secondary/15 bg-white p-4 shadow-sm">
              <AdminCheckOutUserInformation
                isAdmin
                disabledFields={disabledFields}
                saveUserInformation={saveUserInformation}
                onSaveUserInformationChange={setSaveUserInformation}
                onSavedUserSelectionChange={setHasSelectedSavedUser}
              />
            </div>

            <div className="rounded-2xl border border-secondary/15 bg-white p-4 shadow-sm">
              <ManualCheckOutShippingAddress isAdmin />
            </div>
            {/* <ManualCheckOutInvoiceAddress isAdmin /> */}
          </div>

          {/* Table cart and total */}
          <div className="col-span-1 space-y-4 rounded-2xl border border-secondary/15 bg-white p-4 shadow-sm">
            <ManualAdditionalInformation listProducts={listProducts} />
            <SelectOrderItems
              listProducts={listProducts}
              setListProducts={setListProducts}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black font-semibold text-sm">
                    Note
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add note..."
                      value={field.value ?? ""}
                      onChange={(event) => {
                        const value = event.target.value;
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-1 flex lg:justify-end justify-center gap-2">
              <Button
                type="submit"
                className="text-lg lg:w-1/3 w-1/2 py-6 shadow-sm"
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
