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
import { Loader2, PlusCircle } from "lucide-react";
import AddUserDialog from "./dialog/add-user-dialog";
import {
  useGetAllCustomers,
  useGetCustomer,
} from "@/features/incoming-inventory/customer/hook";
import { Button } from "@/components/ui/button";

/**
 * Mock buyers data (tạm thời, sau này thay bằng API)
 */
const MOCK_BUYERS = [
  {
    id: "1",
    name: "John Doe",
    address: "123 Main Street",
    city: "Berlin",
    country: "DE",
    postal_code: "10115",
  },
  {
    id: "2",
    name: "Anna Schmidt",
    address: "Bahnhofstraße 45",
    city: "Munich",
    country: "DE",
    postal_code: "80335",
  },
];

const BuyerInformation = () => {
  const { control, setValue } = useFormContext();
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);

  const { data: buyer, isLoading, isError } = useGetAllCustomers();

  const handleSelectBuyer = (buyerId: string) => {
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

    const data = buyer?.find((b) => b.id === buyerId);
    if (!data) return;

    // ✅ autofill fields
    setValue("name", data.name);
    setValue("address", data.address);
    setValue("city", data.city);
    setValue("country", data.country);
    setValue("postal_code", data.postal_code);
  };

  const handleEditBuyer = (buyerId: string) => {
    console.log(buyerId);
  };

  return (
    <Card className="col-span-3">
      <CardHeader className="text-xl text-secondary font-semibold flex gap-2 items-center">
        Buyer Information
        <AddUserDialog />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* ===== Select Buyer ===== */}
          <FormItem className="col-span-2">
            <FormLabel className="text-sm">Select Buyer</FormLabel>

            <div className="flex items-center gap-2">
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

              {/* 🔹 Edit button */}
              {selectedBuyerId && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleEditBuyer(selectedBuyerId)}
                >
                  ✏️
                </Button>
              )}
            </div>
          </FormItem>

          {/* ===== Buyer Name ===== */}
          <FormField
            control={control}
            name="name"
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
            name="address"
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
            name="city"
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
            name="country"
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
            name="postal_code"
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
