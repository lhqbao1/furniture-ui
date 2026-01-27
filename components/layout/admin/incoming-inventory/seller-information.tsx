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
import AddUserDialog from "./dialog/add-user-dialog";
import { useGetAllCustomers } from "@/features/incoming-inventory/customer/hook";
import { Loader2 } from "lucide-react";

const SellerInformation = () => {
  const { control, setValue } = useFormContext();
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);

  const { data: seller, isLoading, isError } = useGetAllCustomers();

  const handleSelectSeller = (buyerId: string) => {
    if (buyerId === "__CLEAR__") {
      // ❌ Clear selection
      setSelectedBuyerId(null);

      setValue("name", "");
      setValue("address", "");
      setValue("city", "");
      setValue("country", "");
      setValue("postal_code", "");

      return;
    }

    setSelectedBuyerId(buyerId);

    const data = seller?.find((b) => b.id === buyerId);
    if (!data) return;

    // ✅ autofill fields
    setValue("name", data.name);
    setValue("address", data.address);
    setValue("city", data.city);
    setValue("country", data.country);
    setValue("postal_code", data.postal_code);
  };

  return (
    <Card className="col-span-3">
      <CardHeader className="text-xl text-secondary font-semibold flex gap-2 items-center">
        Seller Information
        <AddUserDialog />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 overflow-hidden">
          {/* ===== Select Seller ===== */}
          <FormItem className="grid gap-2 col-span-2 min-w-0">
            <FormLabel className="text-sm w-full">Select Seller</FormLabel>
            <div className="flex items-center gap-2 min-w-0">
              <Select onValueChange={handleSelectSeller}>
                <FormControl>
                  <SelectTrigger className="flex-1 min-w-0 border">
                    <SelectValue
                      className="truncate"
                      placeholder="Select a seller"
                    />
                  </SelectTrigger>
                </FormControl>

                <SelectContent className="pointer-events-auto">
                  {/* 🔹 Clear option */}
                  <SelectItem value="__CLEAR__">— Clear selection —</SelectItem>

                  {!seller || isLoading ? (
                    <div className="flex justify-center py-2">
                      <Loader2 className="animate-spin h-4 w-4" />
                    </div>
                  ) : (
                    seller.map((b) => (
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

          {/* ===== Seller Name ===== */}
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Seller Name</FormLabel>
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

          {/* ===== Seller Address ===== */}
          <FormField
            control={control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Seller Address</FormLabel>
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

          {/* ===== Seller City ===== */}
          <FormField
            control={control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seller City</FormLabel>
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

          {/* ===== Seller Country ===== */}
          <FormField
            control={control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seller Country</FormLabel>
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

          {/* ===== Seller Postal Code ===== */}
          <FormField
            control={control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seller Postal Code</FormLabel>
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

export default SellerInformation;
