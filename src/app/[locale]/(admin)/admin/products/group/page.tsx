"use client";

import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import SelectProductGroup from "@/components/layout/admin/products/products-group/select-group";
import { toast } from "sonner";
import GroupDetails from "@/components/layout/admin/products/products-group/group-details";

const formSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  parent_id: z.string().min(1, "Too short"),
  attr: z.string().min(1, "Too Short"),
});

type FormValues = z.infer<typeof formSchema>;

const ProductGroup = () => {
  const methods = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      parent_id: "",
      attr: "",
    },
  });

  const handleSubmit = (values: FormValues) => {
    console.log("Form submit:", values);
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(
          (values) => {
            console.log("✅ Valid submit", values);
            handleSubmit(values);
          },
          (errors) => {
            console.log(errors);
            toast.error("Please check the form for errors");
          },
        )}
      >
        <div className="mx-auto w-full px-4 py-6 lg:px-8">
          <header className="mb-6 rounded-2xl border bg-card/80 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Product Configuration
            </p>
            <h1 className="mt-2 text-3xl font-bold text-balance">
              Product Group Builder
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Manage product groups, attributes, and variant combinations in one
              place.
            </p>
          </header>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <aside className="h-fit rounded-2xl border bg-card p-4 shadow-sm xl:sticky xl:top-6">
              <SelectProductGroup />
            </aside>

            <section className="min-w-0 rounded-2xl border bg-card p-4 shadow-sm lg:p-6">
              <GroupDetails />
            </section>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default ProductGroup;
