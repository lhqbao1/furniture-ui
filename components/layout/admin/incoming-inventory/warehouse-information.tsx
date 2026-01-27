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
import AddWareHouseDialog from "./dialog/add-warehouse-dialog";
import { useAllWarehouses } from "@/features/incoming-inventory/contact-person/hook";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const WarehouseInformation = () => {
  const { control, setValue } = useFormContext();
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(
    null,
  );

  const { data: warehouse, isLoading, isError } = useAllWarehouses();

  const handleSelectWarehouse = (warehouseId: string) => {
    if (warehouseId === "__CLEAR__") {
      // ❌ Clear selection
      setSelectedWarehouseId(null);

      setValue("warehouse_name", "");
      setValue("warehouse_address", "");
      setValue("warehouse_city", "");
      setValue("warehouse_country", "");
      setValue("warehouse_postal_code", "");
      setValue("warehouse_email", "");
      setValue("warehouse_phone_number", "");

      return;
    }

    setSelectedWarehouseId(warehouseId);

    const data = warehouse?.find((b) => b.id === warehouseId);
    if (!data) return;

    // ✅ autofill fields
    setValue("warehouse_name", data.name);
    setValue("warehouse_address", data.address);
    setValue("warehouse_city", data.city);
    setValue("warehouse_country", data.country);
    setValue("warehouse_postal_code", data.postal_code);
    setValue("warehouse_email", data.email);
    setValue("warehouse_phone_number", data.phone_number);
  };

  return (
    <Card className="col-span-4">
      <CardHeader className="text-xl text-secondary font-semibold flex gap-2 items-center">
        Warehouse Information
        <AddWareHouseDialog />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* ===== Select Buyer ===== */}
          <FormItem className="grid gap-2 col-span-2 min-w-0">
            <FormLabel className="text-sm w-full">Select Warehouse</FormLabel>
            <div className="flex items-center gap-2 overflow-hidden">
              <Select onValueChange={handleSelectWarehouse}>
                <FormControl>
                  <SelectTrigger className="border flex-1">
                    <SelectValue placeholder="Select a warehouse" />
                  </SelectTrigger>
                </FormControl>

                <SelectContent className="pointer-events-auto">
                  {/* 🔹 Clear option */}
                  <SelectItem value="__CLEAR__">— Clear selection —</SelectItem>

                  {!warehouse || isLoading ? (
                    <div className="flex justify-center py-2">
                      <Loader2 className="animate-spin h-4 w-4" />
                    </div>
                  ) : (
                    warehouse.map((b) => (
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
              {selectedWarehouseId && (
                <AddWareHouseDialog warehouse_id={selectedWarehouseId} />
              )}
              {/* 🔹 Edit button */}
            </div>
          </FormItem>

          {/* ===== warehouse Name ===== */}
          <FormField
            control={control}
            name="warehouse_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warehouse Name</FormLabel>
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
                    disabled
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
                    disabled
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
                    disabled
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
                    disabled
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="warehouse_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warehouse Postal Email</FormLabel>
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

          <FormField
            control={control}
            name="warehouse_phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Warehouse Postal Phone Number</FormLabel>
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
      </CardContent>
    </Card>
  );
};

export default WarehouseInformation;
