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
import AddContactPersonDialog from "./dialog/add-contact-person-dialog";

const ContactPersonInformation = () => {
  const { control } = useFormContext();

  return (
    <Card className="col-span-3">
      <CardHeader className="text-xl text-secondary font-semibold flex gap-2 items-center">
        Contact Person Information
        <AddContactPersonDialog />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {/* ===== Contact Person Name ===== */}
          <FormField
            control={control}
            name="bank_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person Name</FormLabel>
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

          {/* ===== Contact Person Address ===== */}
          <FormField
            control={control}
            name="bank_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person Email</FormLabel>
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

          {/* ===== Contact Person City ===== */}
          <FormField
            control={control}
            name="bank_account_no"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person Phone</FormLabel>
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

export default ContactPersonInformation;
