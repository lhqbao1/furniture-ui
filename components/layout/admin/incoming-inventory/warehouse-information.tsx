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

const WarehouseInformation = () => {
  const { control } = useFormContext();

  return (
    <Card className="col-span-4">
      <CardHeader className="text-xl text-secondary font-semibold">
        Warehouse Information
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* ===== warehouse Name ===== */}
          <FormField
            control={control}
            name="ware_house_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warehouse ID</FormLabel>
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

          {/* ===== warehouse Address ===== */}
          <FormField
            control={control}
            name="warehouse_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warehouse Address</FormLabel>
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

          {/* ===== warehouse Country ===== */}
          <FormField
            control={control}
            name="warehouse_city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warehouse City</FormLabel>
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

          <FormField
            control={control}
            name="warehouse_country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warehouse Country</FormLabel>
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

          <FormField
            control={control}
            name="warehouse_postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warehouse Postal Code</FormLabel>
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

export default WarehouseInformation;
