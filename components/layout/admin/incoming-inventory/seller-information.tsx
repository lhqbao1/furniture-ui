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
import AddUserDialog from "./dialog/add-user-dialog";

/**
 * Mock sellers data (tạm thời, sau này thay bằng API)
 */
const MOCK_SELLERS = [
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

const SellerInformation = () => {
  const { control, setValue } = useFormContext();

  const handleSelectseller = (sellerId: string) => {
    const seller = MOCK_SELLERS.find((b) => b.id === sellerId);
    if (!seller) return;

    // 👉 autofill fields
    setValue("seller_name", seller.name);
    setValue("seller_address", seller.address);
    setValue("seller_city", seller.city);
    setValue("seller_country", seller.country);
    setValue("seller_postal_code", seller.postal_code);
  };

  return (
    <Card className="col-span-3">
      <CardHeader className="text-xl text-secondary font-semibold flex gap-2 items-center">
        Seller Information
        <AddUserDialog />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2  gap-4">
          {/* ===== Select Seller ===== */}
          <FormItem className="col-span-2">
            <FormLabel className="text-sm">Select Seller</FormLabel>
            <Select onValueChange={handleSelectseller}>
              <FormControl>
                <SelectTrigger className="border">
                  <SelectValue placeholder="Select a seller" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {MOCK_SELLERS.map((seller) => (
                  <SelectItem
                    key={seller.id}
                    value={seller.id}
                  >
                    {seller.name} – {seller.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>

          {/* ===== Seller Name ===== */}
          <FormField
            control={control}
            name="seller_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seller Name</FormLabel>
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

          {/* ===== Seller Address ===== */}
          <FormField
            control={control}
            name="seller_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seller Address</FormLabel>
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

          {/* ===== Seller City ===== */}
          <FormField
            control={control}
            name="seller_city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seller City</FormLabel>
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

          {/* ===== Seller Country ===== */}
          <FormField
            control={control}
            name="seller_country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seller Country</FormLabel>
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

          {/* ===== Seller Postal Code ===== */}
          <FormField
            control={control}
            name="seller_postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seller Postal Code</FormLabel>
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

export default SellerInformation;
