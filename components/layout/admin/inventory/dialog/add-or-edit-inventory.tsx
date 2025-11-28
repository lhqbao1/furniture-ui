"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { Plus, Pencil } from "lucide-react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  InventoryCreateSchema,
  InventoryCreateValues,
} from "@/lib/schema/inventory";
import {
  useCreateInventory,
  useUpdateInventory,
} from "@/features/products/inventory/hook";
import React from "react";

interface AddOrEditInventoryDialogProps {
  productId: string;
  cost: number; // 👈 thêm
  stock: number; // 👈 thêm
  inventoryData?: {
    id: string;
    product_id: string;
    incoming_stock: number;
    date_received: string;
    cost_received: number;
    total_cost: number;
  }[];
}

export default function AddOrEditInventoryDialog({
  productId,
  cost,
  stock,
  inventoryData = [],
}: AddOrEditInventoryDialogProps) {
  const isEdit = inventoryData.length > 0;
  const editItem = inventoryData[0];

  const form = useForm<InventoryCreateValues>({
    resolver: zodResolver(InventoryCreateSchema),
    defaultValues: {
      product_id: productId,
      incoming_stock: editItem?.incoming_stock ?? 0,
      date_received: editItem?.date_received ?? new Date().toISOString(),
      cost_received: editItem?.cost_received ?? 0,
      total_cost: editItem?.total_cost ?? 0,
    },
  });

  // Auto-calc cost_received whenever incoming_stock changes
  const incomingStock = form.watch("incoming_stock");

  // Update cost_received automatically
  React.useEffect(() => {
    const calculated = (incomingStock ?? 0) * cost;
    form.setValue("cost_received", calculated);
  }, [incomingStock, cost, form]);

  const createInventoryDataMutation = useCreateInventory();
  const editInventoryDataMutation = useUpdateInventory();

  const onSubmit = (values: InventoryCreateValues) => {
    const totalCost = stock * cost;

    const payload = {
      ...values,
      cost_received: values.incoming_stock * cost,
      total_cost: totalCost,
    };

    if (isEdit && editItem?.id) {
      editInventoryDataMutation.mutate({
        id: editItem.id,
        payload,
      });
    } else {
      createInventoryDataMutation.mutate({
        ...payload,
        product_id: productId,
      });
    }
  };

  return (
    <Dialog>
      {/* Trigger */}
      <DialogTrigger asChild>
        {isEdit ? (
          <Button
            variant="ghost"
            size="icon"
            title="Edit Inventory Data"
            className="hover:bg-amber-50 hover:border-primary hover:border"
          >
            <Pencil className="w-4 h-4 text-primary" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            title="Add Inventory Data"
            className="hover:bg-green-50 hover:border-green-400 hover:border"
          >
            <Plus className="w-4 h-4 text-green-400" />
          </Button>
        )}
      </DialogTrigger>

      {/* Dialog Content */}
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Inventory" : "Add Inventory"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            {/* Incoming Stock */}
            <FormField
              control={form.control}
              name="incoming_stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incoming Stock</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={field.value ?? ""} // tránh uncontrolled lỗi
                      onChange={(e) => {
                        const val = e.target.value;

                        // Nếu user xóa hết --> để ""
                        if (val === "") {
                          field.onChange("");
                          return;
                        }

                        // Nếu nhập số --> dùng valueAsNumber để lấy number thật
                        field.onChange(e.target.valueAsNumber);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Received */}
            <FormField
              control={form.control}
              name="date_received"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Received</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value?.split("T")[0]}
                      onChange={(e) =>
                        field.onChange(new Date(e.target.value).toISOString())
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cost Received (auto-calculated, disabled) */}
            <FormField
              control={form.control}
              name="cost_received"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Received Cost (auto)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ❌ total_cost field removed — handled internally */}

            <Button
              type="submit"
              className="w-full mt-4"
            >
              {isEdit ? "Save Changes" : "Add Inventory"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
