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
import AddBankDialog from "./dialog/add-bank-dialog";
import AddContactPersonDialog from "./dialog/add-contact-person-dialog";
import { se } from "date-fns/locale";

const SellerInformation = () => {
  const { control, setValue } = useFormContext();
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [selectedContactPersonId, setSelectedContactPersonId] = useState<
    string | null
  >(null);

  const { data: seller, isLoading, isError } = useGetAllCustomers();

  const handleSelectSeller = (buyerId: string) => {
    if (buyerId === "__CLEAR__") {
      // ❌ Clear selection
      setSelectedBuyerId(null);
      setSelectedBankId(null);
      setSelectedContactPersonId(null);

      setValue("name", "");
      setValue("address", "");
      setValue("city", "");
      setValue("country", "");
      setValue("postal_code", "");

      setValue("bank_name", "");
      setValue("bank_address", "");
      setValue("bank_account_no", "");
      setValue("bank_account_name", "");
      setValue("bank_swift", "");
      setValue("bank_currency", "");

      setValue("contact_person_name", "");
      setValue("contact_person_email", "");
      setValue("contact_person_phone_number", "");
      return;
    }

    setSelectedBuyerId(buyerId);

    const data = seller?.find((b) => b.id === buyerId);
    if (!data) return;

    setSelectedBankId(data.bank_info.id);
    setSelectedContactPersonId(data.contact_person.id);
    console.log(data);

    // ✅ autofill fields
    setValue("name", data.name);
    setValue("address", data.address);
    setValue("city", data.city);
    setValue("country", data.country);
    setValue("postal_code", data.postal_code);

    setValue("bank_name", data.bank_info.bank_name ?? "");
    setValue("bank_address", data.bank_info.address ?? "");
    setValue("bank_account_no", data.bank_info.account_no ?? "");
    setValue("bank_account_name", data.bank_info.account_name ?? "");
    setValue("bank_swift", data.bank_info.swift_code ?? "");
    setValue("bank_currency", data.bank_info.currency ?? "");

    setValue("contact_person_name", data.contact_person.name);
    setValue("contact_person_email", data.contact_person.email);
    setValue("contact_person_phone_number", data.contact_person.phone_number);
  };

  return (
    <Card className="col-span-9">
      <CardContent className="grid grid-cols-12 gap-8">
        <div className="col-span-6 flex flex-col gap-4">
          <div className="flex gap-2 items-center">
            <h4 className="text-xl text-secondary mb-0">Seller Information</h4>
            <AddUserDialog />
          </div>
          <div className="grid grid-cols-6 gap-4 overflow-hidden">
            {/* ===== Select Seller ===== */}
            <FormItem className="grid gap-2 col-span-6 min-w-0">
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
                    <SelectItem value="__CLEAR__">
                      — Clear selection —
                    </SelectItem>

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
                <FormItem className="col-span-6">
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
                <FormItem className="col-span-3">
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
                <FormItem className="col-span-3">
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
                <FormItem className="col-span-3">
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
                <FormItem className="col-span-3">
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
        </div>

        <div className="col-span-6">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 items-center">
              <h4 className="text-xl text-secondary mb-0">Bank Information</h4>
              <AddBankDialog />
              {selectedBankId && (
                <AddBankDialog bank_info_id={selectedBankId} />
              )}
            </div>
            <div className="grid grid-cols-6 gap-4 overflow-hidden mt-1.5">
              {/* ===== Bank Name ===== */}
              <FormField
                control={control}
                name="bank_name"
                render={({ field }) => (
                  <FormItem className="col-span-3">
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ===== Bank Address ===== */}
              <FormField
                control={control}
                name="bank_address"
                render={({ field }) => (
                  <FormItem className="col-span-3">
                    <FormLabel>Bank Address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ===== Bank City ===== */}
              <FormField
                control={control}
                name="bank_account_no"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Bank Account Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ===== Bank Country ===== */}
              <FormField
                control={control}
                name="bank_swift"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Bank Swift Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ===== Bank Postal Code ===== */}
              <FormField
                control={control}
                name="bank_currency"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Currecy</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            <div className="flex gap-2 items-center">
              <h4 className="text-xl text-secondary mb-0">
                Contact Person Information
              </h4>
              <AddContactPersonDialog />
              {selectedContactPersonId && (
                <AddContactPersonDialog
                  contact_person_id={selectedContactPersonId}
                />
              )}
            </div>
            <div className="grid grid-cols-6 gap-4 overflow-hidden mt-3">
              {/* ===== Contact Person Name ===== */}
              <FormField
                control={control}
                name="contact_person_name"
                render={({ field }) => (
                  <FormItem className="col-span-3">
                    <FormLabel>Contact Person Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ===== Contact Person Email ===== */}
              <FormField
                control={control}
                name="contact_person_email"
                render={({ field }) => (
                  <FormItem className="col-span-3">
                    <FormLabel>Contact Person Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ===== Contact Person Phone ===== */}
              <FormField
                control={control}
                name="contact_person_phone_number"
                render={({ field }) => (
                  <FormItem className="col-span-3">
                    <FormLabel>Contact Person Phone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerInformation;
