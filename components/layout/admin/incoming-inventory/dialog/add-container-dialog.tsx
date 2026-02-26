"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Loader2, Pencil, PlusCircle } from "lucide-react";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  containerDefaultValues,
  containerSchema,
  ContainerValues,
} from "@/lib/schema/incoming-inventory";
import { POContainerDetail } from "@/types/po";
import {
  useCreatePOContainer,
  useUpdatePOContainer,
} from "@/features/incoming-inventory/container/hook";
import { toast } from "sonner";
import { getFirstErrorMessage } from "@/lib/get-first-error";
import {
  useUpdatePONumberOfContainers,
  useUpdatePurchaseOrder,
} from "@/features/incoming-inventory/po/hook";
import {
  getContainerInventory,
  updateInventoryPo,
} from "@/features/incoming-inventory/inventory/api";

const CONTAINER_SIZES = [
  "01X40GP",
  "01X40HC",
  "01X45HC",
  "01X20GP",
  "LCL",
] as const;

interface AddContainerDialogProps {
  purchaseOrderId: string; // 👈 nhận từ cha
  container?: POContainerDetail;
  currentContainer?: number;
}

const AddContainerDialog = ({
  purchaseOrderId,
  container,
  currentContainer,
}: AddContainerDialogProps) => {
  const [open, setOpen] = useState(false);
  const isEdit = !!container;

  const createContainerMutation = useCreatePOContainer();
  const updateContainerMutation = useUpdatePOContainer();
  const updatePOMutation = useUpdatePONumberOfContainers();

  const isSubmitting =
    createContainerMutation.isPending || updateContainerMutation.isPending;

  const form = useForm<ContainerValues>({
    resolver: zodResolver(containerSchema),
    defaultValues: containerDefaultValues,
  });

  useEffect(() => {
    if (!container) return;

    form.reset({
      size: container.size ?? "",
      date_of_inspection: container.date_of_inspection
        ? container.date_of_inspection.slice(0, 10)
        : undefined,
      date_if_shipment: container.date_if_shipment
        ? container.date_if_shipment.slice(0, 10)
        : undefined,
      date_to_warehouse: container.date_to_warehouse
        ? container.date_to_warehouse.slice(0, 10)
        : undefined,
      date_of_issue: container.date_of_issue
        ? container.date_of_issue.slice(0, 10)
        : "",
      date_of_delivery: container.date_of_delivery
        ? container.date_of_delivery.slice(0, 10)
        : "",
    });
  }, [container, form]);

  const updateInventoryDeliveryDate = async (
    containerId: string,
    dateToWarehouse?: string,
  ) => {
    if (!dateToWarehouse) return;
    try {
      const inventory = await getContainerInventory(containerId);
      if (!inventory.length) return;

      await Promise.all(
        inventory.map((item) =>
          updateInventoryPo(item.id, {
            container_id: containerId,
            product_id: item.product.id,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
            total_cost: item.total_cost,
            description: item.description,
            list_delivery_date: dateToWarehouse,
          }),
        ),
      );
    } catch (error) {
      console.error("Failed to update inventory delivery date", error);
      toast.error("Failed to update inventory delivery date.");
    }
  };

  const handleSubmit = (values: ContainerValues) => {
    const normalizedValues = {
      ...values,
      date_of_issue: values.date_of_issue ? values.date_of_issue : null,
    };
    const payload = {
      ...normalizedValues,
      purchase_order_id: purchaseOrderId,
    };

    if (isEdit) {
      updateContainerMutation.mutate(
        {
          containerId: container!.id,
          input: payload,
        },
        {
          onSuccess: async () => {
            toast.success("Container updated successfully");
            await updateInventoryDeliveryDate(
              container!.id,
              values.date_to_warehouse,
            );
            setOpen(false);
          },
          onError: () => {
            toast.error("Failed to update container");
          },
        },
      );
    } else {
      createContainerMutation.mutate(payload, {
        onSuccess: async (created) => {
          toast.success("Container created successfully");
          updatePOMutation.mutate({
            input: {
              number_of_containers: (currentContainer ?? 0) + 1,
            },
            purchaseOrderId: purchaseOrderId,
          });
          await updateInventoryDeliveryDate(
            created.id,
            values.date_to_warehouse,
          );
          setOpen(false);
        },
        onError: () => {
          toast.error("Failed to create container");
        },
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (isSubmitting) return;
        setOpen(v);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {isEdit ? (
            <>
              <Pencil className="h-4 w-4 text-primary" />
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Container
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Container" : "Add Container"}
          </DialogTitle>{" "}
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit, (errors) => {
              console.log(errors);
              const message = getFirstErrorMessage(errors);

              toast.error("Form validation error", {
                description:
                  message ?? "Please fix the highlighted fields and try again.",
              });
            })}
            className="grid grid-cols-2 gap-4"
          >
            {/* Size (Select) */}
            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Size <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="border" placeholderColor>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CONTAINER_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="container_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Container Number</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date of Inspection */}
            <FormField
              control={form.control}
              name="date_of_inspection"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Inspection</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date_to_warehouse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date to warehouse</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date_if_shipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Shipment</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Delivery Date */}
            <FormField
              control={form.control}
              name="date_of_issue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of issue</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Delivery Date */}
            <FormField
              control={form.control}
              name="date_of_delivery"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of delivery</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="col-span-2 flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-fit">
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEdit ? "Update Container" : "Add Container"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddContainerDialog;
