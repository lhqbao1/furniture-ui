"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  affiliateDefaultValues,
  affiliateSchema,
  AffiliateFormValues,
} from "@/lib/schema/affiliate";
import { useCreateAffiliate, useUpdateAffiliate } from "@/features/affiliate/hook";
import { AffiliateResponse } from "@/types/affiliate";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type AddOrEditAffiliateFormProps = {
  affiliateValues?: AffiliateResponse;
  onClose?: () => void;
  submitText?: string;
};

export default function AddOrEditAffiliateForm({
  affiliateValues,
  onClose,
  submitText,
}: AddOrEditAffiliateFormProps) {
  const form = useForm<AffiliateFormValues>({
    resolver: zodResolver(affiliateSchema),
    defaultValues: affiliateValues
      ? {
          name: affiliateValues.name,
          code: affiliateValues.code,
          weight: affiliateValues.weight,
          commission_rate: affiliateValues.commission_rate,
        }
      : affiliateDefaultValues,
  });

  const createAffiliateMutation = useCreateAffiliate();
  const updateAffiliateMutation = useUpdateAffiliate();

  const isEdit = Boolean(affiliateValues);
  const isPending = isEdit
    ? updateAffiliateMutation.isPending
    : createAffiliateMutation.isPending;

  function handleSubmit(values: AffiliateFormValues) {
    if (affiliateValues) {
      updateAffiliateMutation.mutate(
        {
          id: affiliateValues.id,
          input: values,
        },
        {
          onSuccess: () => {
            toast.success("Affiliate updated successfully");
            onClose?.();
          },
          onError: () => {
            toast.error("Failed to update affiliate");
          },
        },
      );

      return;
    }

    createAffiliateMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Affiliate created successfully");
        form.reset(affiliateDefaultValues);
        onClose?.();
      },
      onError: () => {
        toast.error("Failed to create affiliate");
      },
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(
          (values) => handleSubmit(values),
          () => toast.error("Please check the form for errors"),
        )}
        className="space-y-5"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Affiliate Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Facebook Partner"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Affiliate Code</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. FB01"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    value={field.value ?? 0}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 0 : e.target.valueAsNumber,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="commission_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Commission Rate</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    value={field.value ?? 0}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 0 : e.target.valueAsNumber,
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="secondary"
            disabled={isPending}
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {submitText ?? (isEdit ? "Update Affiliate" : "Create Affiliate")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
