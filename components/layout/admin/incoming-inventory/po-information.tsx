import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

function FormErrorSpace() {
  return (
    <div className="min-h-[20px]">
      <FormMessage />
    </div>
  );
}

const POInformation = () => {
  const { control } = useFormContext();
  return (
    <Card className="col-span-8">
      <CardHeader className="text-xl text-secondary font-semibold">
        PO Information
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {/* ===== PO Number ===== */}
          <FormField
            control={control}
            name="po_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PO Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>

                <FormErrorSpace />
              </FormItem>
            )}
          />

          {/* ===== PI Number ===== */}
          <FormField
            control={control}
            name="pi_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PI Number</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormErrorSpace />
              </FormItem>
            )}
          />

          {/* ===== Loading Port ===== */}
          <FormField
            control={control}
            name="loading_port"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loading Port</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormErrorSpace />
              </FormItem>
            )}
          />

          {/* ===== Shipping Method ===== */}
          <FormField
            control={control}
            name="shipping_method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shipping Method</FormLabel>
                <Select
                  value={field.value ?? "__CLEAR__"}
                  onValueChange={(val) => {
                    if (val === "__CLEAR__") {
                      field.onChange(undefined);
                    } else {
                      field.onChange(val);
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger className="border">
                      <SelectValue placeholder="Select shipping method" />
                    </SelectTrigger>
                  </FormControl>

                  <SelectContent>
                    <SelectItem value="sea">Sea</SelectItem>
                    <SelectItem value="train">Train</SelectItem>
                    <SelectItem value="air">Air</SelectItem>
                    <SelectItem value="courier">Courier</SelectItem>
                  </SelectContent>
                </Select>

                <FormErrorSpace />
              </FormItem>
            )}
          />

          {/* ===== Customer PO Number ===== */}
          <FormField
            control={control}
            name="customer_po_order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer PO Number (Optional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormErrorSpace />
              </FormItem>
            )}
          />

          {/* ===== Delivery Condition ===== */}
          <FormField
            control={control}
            name="delivery_conditions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Condition</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormErrorSpace />
              </FormItem>
            )}
          />

          {/* ===== Type Of Billing ===== */}
          <FormField
            control={control}
            name="type_of_bill_of_lading"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type Of Billing</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormErrorSpace />
              </FormItem>
            )}
          />

          {/* ===== Destination ===== */}
          <FormField
            control={control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormErrorSpace />
              </FormItem>
            )}
          />

          {/* ===== Note ===== */}
          <FormField
            control={control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note (Optional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormErrorSpace />
              </FormItem>
            )}
          />

          {/* ===== Payment Term ===== */}
          <FormField
            control={control}
            name="payment_terms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Terms</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={4}
                    placeholder={`By T/T
Deposit 30% within 03 days after the order confirmed
Balance 70% will be paid within 20 days after shipment`}
                  />
                </FormControl>
                <FormErrorSpace />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default POInformation;
