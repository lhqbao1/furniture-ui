"use client";

import React, { useEffect, useState } from "react";
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
import { toast } from "sonner";
import { CustomerDetail } from "@/types/po";

interface SellerInformationProps {
  selectedsellerId: string | null;
  setSelectedsellerId: React.Dispatch<React.SetStateAction<string | null>>;
}
const SellerInformation = ({
  selectedsellerId,
  setSelectedsellerId,
}: SellerInformationProps) => {
  const { control, setValue } = useFormContext();
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);
  const [selectedContactPersonId, setSelectedContactPersonId] = useState<
    string | null
  >(null);
  const [selectedSeller, setSelectedSeller] = useState<CustomerDetail>();

  const { data: seller, isLoading, dataUpdatedAt } = useGetAllCustomers();

  const clearBankAndContact = () => {
    setSelectedBankId(null);
    setSelectedContactPersonId(null);

    // bank
    setValue("bank_id", "");
    setValue("bank_name", "");
    setValue("bank_address", "");
    setValue("bank_account_no", "");
    setValue("bank_account_name", "");
    setValue("bank_swift", "");
    setValue("bank_currency", "");

    // contact person
    setValue("contact_person_id", "");
    setValue("contact_person_name", "");
    setValue("contact_person_email", "");
    setValue("contact_person_phone_number", "");
  };

  const handleSelectSeller = (sellerId: string) => {
    if (sellerId === "__CLEAR__") {
      setSelectedsellerId(null);
      setSelectedSeller(undefined);

      clearBankAndContact();

      setValue("seller_id", "");

      setValue("name", "");
      setValue("address", "");
      setValue("city", "");
      setValue("country", "");
      setValue("postal_code", "");
      return;
    }

    // 🔥 Nếu đổi sang seller KHÁC → clear trước
    if (sellerId !== selectedsellerId) {
      clearBankAndContact();
    }

    setSelectedsellerId(sellerId);

    const data = seller?.find((b) => b.id === sellerId);
    if (!data) return;

    setValue("seller_id", sellerId);
    setSelectedSeller(data);

    // =====================
    // Seller info (safe)
    // =====================

    setValue("name", data.name ?? "");
    setValue("address", data.address ?? "");
    setValue("city", data.city ?? "");
    setValue("country", data.country ?? "");
    setValue("postal_code", data.postal_code ?? "");
  };

  const handleSelectBank = (bank_info_id: string) => {
    if (bank_info_id === "__CLEAR__") {
      // ❌ Clear selection
      setSelectedBankId(null);

      // 🔥 clear all bank-related fields
      setValue("bank_name", "");
      setValue("bank_address", "");
      setValue("bank_account_no", "");
      setValue("bank_account_name", "");
      setValue("bank_swift", "");
      setValue("bank_currency", "");

      return;
    }

    setSelectedBankId(bank_info_id);

    const data = selectedSeller?.bank_infos?.find((b) => b.id === bank_info_id);
    if (!data) return;

    // ✅ autofill bank fields
    setValue("bank_id", data.id);
    setValue("bank_name", data.bank_name ?? "");
    setValue("bank_address", data.address ?? "");
    setValue("bank_account_no", data.account_no ?? "");
    setValue("bank_account_name", data.account_name ?? "");
    setValue("bank_swift", data.swift_code ?? "");
    setValue("bank_currency", data.currency ?? "");
  };

  const handleSelectContactPerson = (contact_person_id: string) => {
    if (contact_person_id === "__CLEAR__") {
      // ❌ Clear selection
      setSelectedContactPersonId(null);

      // 🔥 clear all bank-related fields
      setValue("contact_person_name", "");
      setValue("contact_person_email", "");
      setValue("contact_person_phone_number", "");
      return;
    }

    setSelectedContactPersonId(contact_person_id);

    const data = selectedSeller?.contact_persons?.find(
      (b) => b.id === contact_person_id,
    );
    if (!data) return;

    // ✅ autofill bank fields
    setValue("contact_person_id", data.id ?? "");
    setValue("contact_person_name", data.name ?? "");
    setValue("contact_person_email", data.email ?? "");
    setValue("contact_person_phone_number", data.phone_number ?? "");
  };

  useEffect(() => {
    if (!selectedsellerId || !seller) return;

    const data = seller.find((b) => b.id === selectedsellerId);
    if (!data) return;
    handleSelectSeller(selectedsellerId);

    // ❗ CHỈ set react-hook-form, KHÔNG setselectedsellerId
    setValue("seller_id", data.id);
    setValue("seller_name", data.name);
    setValue("seller_address", data.address);
    setValue("seller_city", data.city);
    setValue("seller_country", data.country);
    setValue("seller_postal_code", data.postal_code);

    if (data.bank_infos && data.bank_infos.length > 0) {
      setSelectedBankId(data.bank_infos[0].id);
      setValue("bank_id", data.bank_infos[0].id);
      setValue("bank_name", data.bank_infos[0].bank_name ?? "");
      setValue("bank_address", data.bank_infos[0].address ?? "");
      setValue("bank_account_no", data.bank_infos[0].account_no ?? "");
      setValue("bank_account_name", data.bank_infos[0].account_name ?? "");
      setValue("bank_swift", data.bank_infos[0].swift_code ?? "");
      setValue("bank_currency", data.bank_infos[0].currency ?? "");
    }

    if (data.contact_persons && data.contact_persons.length > 0) {
      setSelectedContactPersonId(data.contact_persons[0].id);
     setValue("contact_person_id", data.contact_persons[0].id ?? "");
     setValue("contact_person_name", data.contact_persons[0].name ?? "");
     setValue("contact_person_email", data.contact_persons[0].email ?? "");
     setValue(
       "contact_person_phone_number",
       data.contact_persons[0].phone_number ?? "",
     );
      
    }
  }, [seller, selectedsellerId, setValue]);

  // ⛔ CHẶN render Select khi data chưa sẵn sàng

  if (isLoading || !seller) {
    return (
      <Card className="col-span-3">
        <CardHeader className="text-xl font-semibold">
          Seller Information
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin h-4 w-4" />
            Loading sellers...
          </div>
        </CardContent>
      </Card>
    );
  }

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
                <Select
                  value={selectedsellerId ?? "__CLEAR__"}
                  onValueChange={handleSelectSeller}
                >
                  {" "}
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
                {selectedsellerId && (
                  <AddUserDialog user_id={selectedsellerId} />
                )}
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
              {!selectedsellerId && (
                <span className="text-sm text-red-400">
                  (Need to select seller first)
                </span>
              )}
            </div>
            {selectedsellerId && (
              <div className="grid grid-cols-6 gap-4 overflow-hidden mt-1.5">
                {/* ===== Select Bank ===== */}
                <FormItem className="grid gap-2 col-span-6 min-w-0">
                  <FormLabel className="text-sm w-full">Select Bank</FormLabel>
                  <div className="flex items-center gap-2 min-w-0">
                    <Select onValueChange={handleSelectBank}>
                      <FormControl>
                        <SelectTrigger className="flex-1 min-w-0 border">
                          <SelectValue
                            className="truncate"
                            placeholder="Select a banks"
                          />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent className="pointer-events-auto">
                        {/* 🔹 Clear option */}
                        <SelectItem value="__CLEAR__">
                          — Clear selection —
                        </SelectItem>

                        {isLoading ? (
                          <div className="flex justify-center py-2">
                            <Loader2 className="animate-spin h-4 w-4" />
                          </div>
                        ) : !selectedSeller?.bank_infos ||
                          selectedSeller.bank_infos.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            No bank information available
                          </div>
                        ) : (
                          selectedSeller.bank_infos.map((b) => (
                            <SelectItem
                              key={b.id}
                              value={b.id}
                            >
                              {b.bank_name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {selectedBankId && (
                      <AddBankDialog bank_info_id={selectedBankId} />
                    )}
                    {/* 🔹 Edit button */}
                  </div>
                </FormItem>

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
            )}
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
              {!selectedsellerId && (
                <span className="text-sm text-red-400">
                  (Need to select seller first)
                </span>
              )}
            </div>
            {selectedsellerId && (
              <div className="grid grid-cols-6 gap-4 overflow-hidden mt-3">
                {/* ===== Select Bank ===== */}
                <FormItem className="grid gap-2 col-span-6 min-w-0">
                  <FormLabel className="text-sm w-full">
                    Select Contact Person
                  </FormLabel>
                  <div className="flex items-center gap-2 min-w-0">
                    <Select onValueChange={handleSelectContactPerson}>
                      <FormControl>
                        <SelectTrigger className="flex-1 min-w-0 border">
                          <SelectValue
                            className="truncate"
                            placeholder="Select a contact person"
                          />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent className="pointer-events-auto">
                        {/* 🔹 Clear option */}
                        <SelectItem value="__CLEAR__">
                          — Clear selection —
                        </SelectItem>

                        {isLoading ? (
                          <div className="flex justify-center py-2">
                            <Loader2 className="animate-spin h-4 w-4" />
                          </div>
                        ) : !selectedSeller?.contact_persons ||
                          selectedSeller.contact_persons.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            No contact person information available
                          </div>
                        ) : (
                          selectedSeller.contact_persons.map((b) => (
                            <SelectItem
                              key={b.id}
                              value={b.id}
                            >
                              {b.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {selectedContactPersonId && (
                      <AddContactPersonDialog
                        contact_person_id={selectedContactPersonId}
                      />
                    )}
                    {/* 🔹 Edit button */}
                  </div>
                </FormItem>

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
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerInformation;
