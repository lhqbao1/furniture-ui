"use client";
import { Form } from "@/components/ui/form";
import { getFirstErrorMessage } from "@/lib/get-first-error";
import { incomingInventorySchema } from "@/lib/schema/incoming-inventory";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import BuyerInformation from "./buyer-information";
import SellerInformation from "./seller-information";
import POInformation from "./po-information";
import { Button } from "@/components/ui/button";
import { useCreatePurchaseOrder } from "@/features/incoming-inventory/po/hook";

const AddIncomingInventoryForm = () => {
  const [selectedsellerId, setSelectedsellerId] = useState<string | null>(null);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);
  const [syncKey, setSyncKey] = useState(0);

  const createPOMutation = useCreatePurchaseOrder();
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
      note: "",
      bank_id: "",
    },
  });

  function handleSubmit(data: z.infer<typeof incomingInventorySchema>) {
    createPOMutation.mutate(data, {
      onSuccess(data, variables, context) {
        toast.success("Create purchase order success");
        form.reset();
        setSelectedsellerId(null);
        setSelectedBuyerId(null);
        setSyncKey((prev) => prev + 1);
        // setSelectedWarehouseId(null);
      },
      onError(error, variables, context) {
        toast.error("Create purchase order fail");
      },
    });
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
        {" "}
        <div className="grid grid-cols-12 gap-6">
          <BuyerInformation
            selectedBuyerId={selectedBuyerId}
            setSelectedBuyerId={setSelectedBuyerId}
            syncKey={syncKey}
          />
          <SellerInformation
            selectedsellerId={selectedsellerId}
            setSelectedsellerId={setSelectedsellerId}
            syncKey={syncKey}
          />
          {/* <WarehouseInformation
            selectedWarehouseId={selectedWarehouseId}
            setSelectedWarehouseId={setSelectedWarehouseId}
          /> */}
          <POInformation />
        </div>
        <Button type="submit" className="mt-4">
          Create PO
        </Button>
      </form>
    </Form>
  );
};

export default AddIncomingInventoryForm;
