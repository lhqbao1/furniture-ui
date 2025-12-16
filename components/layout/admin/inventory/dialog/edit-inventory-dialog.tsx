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

import { Plus, Pencil, Loader2 } from "lucide-react";

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
import { toast } from "sonner";

interface EditInventoryDialogProps {
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
  };
}

function toIsoWithoutZ(date: Date) {
  return date.toISOString().replace(/Z$/, "");
}

function fromDateInputToIsoNoZ(value: string) {
  const d = new Date(value);
  return d.toISOString().replace(/Z$/, "");
}

export default function EditInventoryDialog({
  productId,
  cost,
  stock,
  inventoryData,
}: EditInventoryDialogProps) {
  const [open, setOpen] = React.useState(false);

  const form = useForm<InventoryCreateValues>({
    resolver: zodResolver(InventoryCreateSchema),
    defaultValues: {
      product_id: productId,
      incoming_stock: inventoryData?.incoming_stock,
      date_received: inventoryData?.date_received
        ? inventoryData.date_received.replace(/Z$/, "") // bỏ Z nếu có
        : toIsoWithoutZ(new Date()),
      cost_received: inventoryData?.cost_received,
      total_cost: inventoryData?.total_cost,
    },
  });

  // Auto-calc cost_received whenever incoming_stock changes
  const incomingStock = form.watch("incoming_stock");

  // Update cost_received automatically
  React.useEffect(() => {
    const calculated = (incomingStock ?? 0) * cost;
    form.setValue("cost_received", calculated);
  }, [incomingStock, cost, form]);

  const editInventoryDataMutation = useUpdateInventory();

  const loading = editInventoryDataMutation.isPending;

  const onSubmit = (values: InventoryCreateValues) => {
    const totalCost = stock * cost;

    const payload = {
      ...values,
      cost_received: values.incoming_stock * cost,
      total_cost: totalCost,
    };

    editInventoryDataMutation.mutate(
      {
        id: inventoryData?.id ?? "",
        payload: payload,
      },
      {
        onSuccess: () => {
          toast.success("Create inventory data successfully");
          setOpen(false);
        },
        onError: () => {
          toast.error("Create inventory data failed");
        },
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      {/* Trigger */}
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Edit Inventory Data"
          className="hover:bg-amber-50 hover:border-primary hover:border"
        >
          <Pencil className="w-4 h-4 text-primary" />
        </Button>
      </DialogTrigger>

      {/* Dialog Content */}
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Inventory</DialogTitle>
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
                      value={
                        field.value
                          ? field.value.split("T")[0] // vì field.value đã là dạng không Z
                          : ""
                      }
                      onChange={(e) => {
                        field.onChange(fromDateInputToIsoNoZ(e.target.value));
                      }}
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
              className="w-full mt-4 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <span className={loading ? "opacity-50" : ""}>Save Changes</span>
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
