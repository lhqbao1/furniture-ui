"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShipmentFormValues, shipmentSchema } from "@/lib/schema/shipment";
import { useSendSupplierTracking } from "@/features/supplier/hook";
import CarrierSelect from "./carrier-select";

interface ShipmentInputProps {
  checkoutId: string;
}

const ShipmentInput = ({ checkoutId }: ShipmentInputProps) => {
  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      tracking_number: "",
      shipping_carrier: "",
    },
  });

  const { mutate, isPending } = useSendSupplierTracking();

  const onSubmit = (values: ShipmentFormValues) => {
    const shippedDate = new Date().toISOString().replace("Z", "");
    const payload = {
      ...values,
      shipped_date: shippedDate,
    };

    mutate({
      checkoutId,
      payload,
    });
  };

  return (
    <Card className="border">
      <CardHeader>
        <CardTitle>Shipment Information</CardTitle>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (errors) => {
              console.log("Shipment form errors", errors);
              const firstError = Object.values(errors)[0];
              if (firstError?.message) {
                alert(firstError.message);
              }
            })}
            className="space-y-4"
          >
            {/* Tracking number */}
            <FormField
              control={form.control}
              name="tracking_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tracking Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tracking number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Shipping carrier */}
            <FormField
              control={form.control}
              name="shipping_carrier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Shipping Carrier</FormLabel>
                  <FormControl>
                    <CarrierSelect
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Sending..." : "Send Tracking"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ShipmentInput;
