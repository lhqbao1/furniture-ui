"use client";
import SelectMainProduct from "@/components/layout/admin/products/product-related/select-main-product";
import SelectRelatedProducts from "@/components/layout/admin/products/product-related/select-related-product";
import SelectProductGroup from "@/components/layout/admin/products/products-group/select-group";
import { Button } from "@/components/ui/button";
import { useCreateRelatedProducts } from "@/features/related-product/hook";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  product_id: z.string().min(1, "Please select main product"),
  related_product_id: z
    .array(z.string())
    .min(1, "Please select related products"),
});

export type RelatedProductFormValues = z.infer<typeof formSchema>;

const ProductRelatedPage = () => {
  const form = useForm<RelatedProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_id: "",
      related_product_id: [],
    },
  });

  const createRelatedProduct = useCreateRelatedProducts();

  const handleSubmit = (values: RelatedProductFormValues) => {
    createRelatedProduct.mutate(
      {
        product_id: values.product_id,
        related_product_id: values.related_product_id,
      },
      {
        onSuccess(data, variables, context) {
          toast.success("Add related products successful");
          form.reset();
        },
        onError(error, variables, context) {
          toast.error("Add related products fail");
        },
      },
    );
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(
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
        <Button
          type="submit"
          className="mt-4 col-span-12"
          disabled={createRelatedProduct.isPending}
        >
          {createRelatedProduct.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            "Submit"
          )}
        </Button>
        <div className="grid grid-cols-12 gap-12 mt-6">
          <div className="col-span-5">
            <SelectMainProduct />
          </div>
          <div className="col-span-7 px-12">
            <SelectRelatedProducts />
          </div>
        </div>
      </form>
    </FormProvider>
  );
};

export default ProductRelatedPage;
