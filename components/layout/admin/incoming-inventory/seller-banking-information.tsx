import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React, { useState } from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import AddBankDialog from "./dialog/add-bank-dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useGetAllBankInfo } from "@/features/incoming-inventory/bank/hook";
import { Loader2 } from "lucide-react";

const SellerBankingInformation = () => {
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null);

  const { control, setValue } = useFormContext();

  const { data: banks, isLoading, isError } = useGetAllBankInfo();

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

    const data = banks?.find((b) => b.id === bank_info_id);
    if (!data) return;

    // ✅ autofill bank fields
    setValue("bank_name", data.bank_name ?? "");
    setValue("bank_address", data.address ?? "");
    setValue("bank_account_no", data.account_no ?? "");
    setValue("bank_account_name", data.account_name ?? "");
    setValue("bank_swift", data.swift_code ?? "");
    setValue("bank_currency", data.currency ?? "");
  };

  return (
    <Card className="col-span-3">
      <CardHeader className="text-xl text-secondary font-semibold flex gap-2 items-center">
        Bank Information
        <AddBankDialog />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 overflow-hidden">
          {/* ===== Select Seller ===== */}
          <FormItem className="grid gap-2 col-span-2 min-w-0">
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
                  <SelectItem value="__CLEAR__">— Clear selection —</SelectItem>

                  {!banks || isLoading ? (
                    <div className="flex justify-center py-2">
                      <Loader2 className="animate-spin h-4 w-4" />
                    </div>
                  ) : (
                    banks.map((b) => (
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
              <FormItem className="col-span-2">
                <FormLabel>Bank Name</FormLabel>
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

          {/* ===== Bank Address ===== */}
          <FormField
            control={control}
            name="bank_address"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Bank Address</FormLabel>
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
              <FormItem>
                <FormLabel>Bank Swift Code</FormLabel>
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

          {/* ===== Bank Postal Code ===== */}
          <FormField
            control={control}
            name="bank_currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currecy</FormLabel>
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

export default SellerBankingInformation;
