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

const POInformation = () => {
  const { control } = useFormContext();
  return (
    <Card className="col-span-8">
      <CardHeader className="text-xl text-secondary font-semibold">
        PO Information
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* ===== Bank Name ===== */}
          <FormField
            control={control}
            name="bank_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PO Number</FormLabel>
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
              <FormItem>
                <FormLabel>PI Number</FormLabel>
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
              <FormItem>
                <FormLabel>Bank City</FormLabel>
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
                <FormLabel>Bank Country</FormLabel>
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
                <FormLabel>Bank Postal Code</FormLabel>
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

export default POInformation;
