"use client";
import { Form } from "@/components/ui/form";
import { getFirstErrorMessage } from "@/lib/get-first-error";
import { incomingInventorySchema } from "@/lib/schema/incoming-inventory";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import BuyerInformation from "./buyer-information";
import SellerInformation from "./seller-information";
import POInformation from "./po-information";
import WarehouseInformation from "./warehouse-information";
import { Button } from "@/components/ui/button";
import {
  useCreatePurchaseOrder,
  useGetPurchaseOrderDetail,
  useUpdatePurchaseOrder,
} from "@/features/incoming-inventory/po/hook";
import { useRouter } from "@/src/i18n/navigation";

interface EditIncomingInventoryFormProps {
  id: string;
}

const EditIncomingInventoryForm = ({ id }: EditIncomingInventoryFormProps) => {
  const router = useRouter();

  const { data, isLoading, isError } = useGetPurchaseOrderDetail(id);

  const [selectedsellerId, setSelectedsellerId] = useState<string | null>(null);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);
  // const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(
  //   null,
  // );

  const editPOMutation = useUpdatePurchaseOrder();
  const form = useForm<z.infer<typeof incomingInventorySchema>>({
    resolver: zodResolver(incomingInventorySchema),
    defaultValues: {
      po_number: "",
      pi_number: "",
      loading_port: "",
      shipping_method: "",
      delivery_conditions: "",
      type_of_bill_of_lading: "",
      destination: "",
      payment_terms: "",
      buyer_id: "",
      seller_id: "",
      created_by: "admin",
      bank_id: "",
    },
  });

  useEffect(() => {
    if (!data) return;

    // 1️⃣ reset toàn bộ form
    form.reset({
      po_number: data.po_number ?? "",
      pi_number: data.pi_number ?? "",
      loading_port: data.loading_port ?? "",
      shipping_method: data.shipping_method ?? "",
      delivery_conditions: data.delivery_conditions ?? "",
      type_of_bill_of_lading: data.type_of_bill_of_lading ?? "",
      destination: data.destination ?? "",
      payment_terms: data.payment_terms ?? "",
      buyer_id: data.buyer.id,
      seller_id: data.seller.id,
      created_by: "admin",
      bank_id: data.seller.bank_info?.id ?? "",
    });

    // 2️⃣ sync state cho các select
    setSelectedBuyerId(data.buyer.id);
    setSelectedsellerId(data.seller.id);
    // setSelectedWarehouseId(data.warehouse.id);
  }, [data, form]);

  function handleSubmit(data: z.infer<typeof incomingInventorySchema>) {
    editPOMutation.mutate(
      {
        data: data,
        purchaseOrderId: id,
      },
      {
        onSuccess(data, variables, context) {
          toast.success("Edit purchase order success");
          //   form.reset();
          //   setSelectedsellerId(null);
          //   setSelectedBuyerId(null);
          //   setSelectedWarehouseId(null);
        },
        onError(error, variables, context) {
          toast.error("Edit purchase order fail");
        },
      },
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit, (errors) => {
          console.log(errors);
          const message = getFirstErrorMessage(errors);

          toast.error("Form validation error", {
            description:
              message ?? "Please fix the highlighted fields and try again.",
          });
        })}
      >
        <div className="grid grid-cols-12 gap-6">
          <BuyerInformation
            selectedBuyerId={selectedBuyerId}
            setSelectedBuyerId={setSelectedBuyerId}
          />
          <SellerInformation
            selectedsellerId={selectedsellerId}
            setSelectedsellerId={setSelectedsellerId}
          />
          {/* <WarehouseInformation
            selectedWarehouseId={selectedWarehouseId}
            setSelectedWarehouseId={setSelectedWarehouseId}
          /> */}
          <POInformation />
        </div>
        <div className="mt-4 flex gap-2">
          <Button type="submit">Edit PO</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Back
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditIncomingInventoryForm;
