"use client";

import React from "react";
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

  const handleSelectBuyer = (buyerId: string) => {
    const buyer = MOCK_BUYERS.find((b) => b.id === buyerId);
    if (!buyer) return;

    // 👉 autofill fields
    setValue("buyer_name", buyer.name);
    setValue("buyer_address", buyer.address);
    setValue("buyer_city", buyer.city);
    setValue("buyer_country", buyer.country);
    setValue("buyer_postal_code", buyer.postal_code);
  };

  return (
    <Card className="col-span-4">
      <CardHeader className="text-xl text-secondary font-semibold">
        Buyer Information
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* ===== Select Buyer ===== */}
          <FormItem className="col-span-2">
            <FormLabel className="text-sm">Select Buyer</FormLabel>
            <Select onValueChange={handleSelectBuyer}>
              <FormControl>
                <SelectTrigger className="border">
                  <SelectValue placeholder="Select a buyer" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {MOCK_BUYERS.map((buyer) => (
                  <SelectItem
                    key={buyer.id}
                    value={buyer.id}
                  >
                    {buyer.name} – {buyer.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>

          {/* ===== Buyer Name ===== */}
          <FormField
            control={control}
            name="buyer_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buyer Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
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
              <FormItem>
                <FormLabel>Buyer Address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    value={field.value ?? ""}
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
