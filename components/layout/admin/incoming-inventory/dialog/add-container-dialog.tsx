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
}

const AddContainerDialog = ({
  purchaseOrderId,
  container,
}: AddContainerDialogProps) => {
  const [open, setOpen] = useState(false);
  const isEdit = !!container;
  const createContainerMutation = useCreatePOContainer();
  const updateContainerMutation = useUpdatePOContainer();

  const isSubmitting =
    createContainerMutation.isPending || updateContainerMutation.isPending;

  const form = useForm<ContainerValues>({
    resolver: zodResolver(containerSchema),
    defaultValues: containerDefaultValues,
  });

  useEffect(() => {
    if (!container) return;

    form.reset({
      container_number: container.container_number,
      size: container.size,
      date_of_inspection: container.date_of_inspection.slice(0, 10),
      date_if_shipment: container.date_if_shipment.slice(0, 10),
      delivery_date: container.delivery_date.slice(0, 10),
    });
  }, [container, form]);

  const handleSubmit = (values: ContainerValues) => {
    const payload = {
      ...values,
      purchase_order_id: purchaseOrderId,
    };

    if (isEdit) {
      updateContainerMutation.mutate(
        {
          containerId: container!.id,
          input: payload,
        },
        {
          onSuccess: () => {
            toast.success("Container updated successfully");
            setOpen(false);
          },
          onError: () => {
            toast.error("Failed to update container");
          },
        },
      );
    } else {
      createContainerMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Container created successfully");
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
        <Button
          variant="outline"
          size="sm"
        >
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
            {/* Container Number */}
            <FormField
              control={form.control}
              name="container_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Container Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Size (Select) */}
            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger
                        className="border"
                        placeholderColor
                      >
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CONTAINER_SIZES.map((size) => (
                        <SelectItem
                          key={size}
                          value={size}
                        >
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date of Shipment */}
            <FormField
              control={form.control}
              name="date_if_shipment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Shipment</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Delivery Date */}
            <FormField
              control={form.control}
              name="delivery_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
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
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-fit"
              >
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
