"use client";

import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import AddUserDialog from "./dialog/add-user-dialog";
import { useGetAllCustomers } from "@/features/incoming-inventory/customer/hook";

const BuyerInformation = () => {
  const { control, setValue } = useFormContext();
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);

  const { data: buyer, isLoading, isError } = useGetAllCustomers();

  const handleSelectBuyer = (buyerId: string) => {
    if (buyerId === "__CLEAR__") {
      // ❌ Clear selection
      setSelectedBuyerId(null);

      setValue("buyer_name", "");
      setValue("buyer_address", "");
      setValue("buyer_city", "");
      setValue("buyer_country", "");
      setValue("buyer_postal_code", "");

      return;
    }

    setSelectedBuyerId(buyerId);

    const data = buyer?.find((b) => b.id === buyerId);
    if (!data) return;

    // ✅ autofill fields
    setValue("buyer_name", data.name);
    setValue("buyer_address", data.address);
    setValue("buyer_city", data.city);
    setValue("buyer_country", data.country);
    setValue("buyer_postal_code", data.postal_code);
  };

  return (
    <Card className="col-span-3">
      <CardHeader className="text-xl text-secondary font-semibold flex gap-2 items-center">
        Buyer Information
        <AddUserDialog />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 overflow-hidden">
          {/* ===== Select Buyer ===== */}
          <FormItem className="grid gap-2 col-span-2 min-w-0">
            <FormLabel className="text-sm w-full">Select Buyer</FormLabel>

            <div className="flex items-center gap-2 overflow-hidden">
              <Select onValueChange={handleSelectBuyer}>
                <FormControl>
                  <SelectTrigger className="border flex-1">
                    <SelectValue placeholder="Select a buyer" />
                  </SelectTrigger>
                </FormControl>

                <SelectContent className="pointer-events-auto">
                  {/* 🔹 Clear option */}
                  <SelectItem value="__CLEAR__">— Clear selection —</SelectItem>

                  {!buyer || isLoading ? (
                    <div className="flex justify-center py-2">
                      <Loader2 className="animate-spin h-4 w-4" />
                    </div>
                  ) : (
                    buyer.map((b) => (
                      <SelectItem
                        key={b.id}
                        value={b.id}
                      >
                        {b.name} – {b.city}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedBuyerId && <AddUserDialog user_id={selectedBuyerId} />}
              {/* 🔹 Edit button */}
            </div>
          </FormItem>

          {/* ===== Buyer Name ===== */}
          <FormField
            control={control}
            name="buyer_name"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Buyer Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ===== Buyer Address ===== */}
          <FormField
            control={control}
            name="buyer_address"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Buyer Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ===== Buyer City ===== */}
          <FormField
            control={control}
            name="buyer_city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buyer City</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ===== Buyer Country ===== */}
          <FormField
            control={control}
            name="buyer_country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buyer Country</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ===== Buyer Postal Code ===== */}
          <FormField
            control={control}
            name="buyer_postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buyer Postal Code</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BuyerInformation;
