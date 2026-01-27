"use client";
import { Form } from "@/components/ui/form";
import { getFirstErrorMessage } from "@/lib/get-first-error";
import { incomingInventorySchema } from "@/lib/schema/incoming-inventory";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import BuyerInformation from "./buyer-information";
import SellerInformation from "./seller-information";
import POInformation from "./po-information";
import SellerBankingInformation from "./seller-banking-information";
import WarehouseInformation from "./warehouse-information";
import ContactPersonInformation from "./contact-person";

const AddIncomingInventoryForm = () => {
  const form = useForm<z.infer<typeof incomingInventorySchema>>({
    resolver: zodResolver(incomingInventorySchema),
    defaultValues: {},
  });

  function handleSubmit(data: z.infer<typeof incomingInventorySchema>) {
    // Do something with the form values.
    console.log(data);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit, (errors) => {
          const message = getFirstErrorMessage(errors);

          toast.error("Form validation error", {
            description:
              message ?? "Please fix the highlighted fields and try again.",
          });
        })}
      >
        {" "}
        <div className="grid grid-cols-12 gap-6">
          <BuyerInformation />
          <SellerInformation />
          <POInformation />
          <WarehouseInformation />
        </div>
      </form>
    </Form>
  );
};

export default AddIncomingInventoryForm;
