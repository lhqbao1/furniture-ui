"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { ProductItem } from "@/types/products";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "@/src/i18n/navigation";
import { useLocale } from "next-intl";
import ProductDetailInputs from "@/components/layout/admin/products/products-form/fisrt-group";
import ProductAdditionalInputs from "@/components/layout/admin/products/products-form/product-additional-group";
import ProductLogisticsGroup from "@/components/layout/admin/products/products-form/product-logistics-group";
import { defaultValuesDSP, ProductInputDSP } from "@/lib/schema/dsp/product";
import { useProductFormDSP } from "./useProductForm";

function getFirstErrorMessage(errors: any): string | undefined {
  for (const key in errors) {
    const err = errors[key];
    if (err?.message) return err.message;
    if (typeof err === "object") {
      const nested = getFirstErrorMessage(err);
      if (nested) return nested;
    }
  }
  return undefined;
}

interface AddProductFormDSPProps {
  productValues?: Partial<ProductItem>;
  onSubmit: (values: ProductInputDSP) => Promise<void> | void;
  isPending?: boolean;
  productValuesClone?: Partial<ProductItem>;
}

const ProductFormDSP = ({
  productValues,
  onSubmit,
  isPending,
  productValuesClone,
}: AddProductFormDSPProps) => {
  const router = useRouter();
  const locale = useLocale();
  const [openAccordion, setOpenAccordion] = useState<string[]>(["details"]);

  const {
    form,
    onSubmit: handleSubmit,
    addProductMutation,
    editProductMutation,
  } = useProductFormDSP({ productValues, productValuesClone });

  return (
    <div className="pb-20 px-30">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit, (errors) => {
            const message = getFirstErrorMessage(errors);
            toast.error("Form validation error", {
              description:
                message ?? "Please fix the highlighted fields and try again.",
            });
          })}
        >
          <div className="grid-cols-12 grid gap-24 w-full">
            <div className="col-span-9 flex flex-col gap-4">
              {!defaultValuesDSP ? (
                <h3 className="text-xl text-[#666666]">Add New Product</h3>
              ) : (
                ""
              )}

              <Accordion
                type="multiple"
                value={openAccordion}
                onValueChange={setOpenAccordion}
                className="w-full space-y-8"
              >
                <AccordionItem
                  value="details"
                  className="border-none"
                >
                  <AccordionTrigger className="bg-gray-100 px-2 rounded-sm text-lg font-bold items-center cursor-pointer">
                    <span>Product Details</span>
                  </AccordionTrigger>
                  <AccordionContent className="mt-2">
                    <Card>
                      <CardContent>
                        <ProductDetailInputs
                          isEdit={productValues ? true : false}
                          productId={
                            productValues ? productValues.id_provider : null
                          }
                          isDSP
                        />
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="additional"
                  className="border-none"
                >
                  <AccordionTrigger className="bg-gray-100 px-2 rounded-sm text-lg font-bold flex items-center cursor-pointer hover:">
                    Product Additional Details
                  </AccordionTrigger>
                  <AccordionContent className="mt-2">
                    <Card>
                      <CardContent>
                        <ProductAdditionalInputs isDSP />
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="logistic"
                  className="border-none"
                >
                  <AccordionTrigger className="bg-gray-100 px-2 rounded-sm text-lg font-bold flex items-center cursor-pointer hover:">
                    Product Logistic
                  </AccordionTrigger>
                  <AccordionContent className="mt-2">
                    <Card>
                      <CardContent>
                        <ProductLogisticsGroup isDSP />
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="col-span-3 flex flex-col items-end gap-4 relative">
              {/*Form Button */}
              <div className="grid grid-cols-2 gap-2 justify-end top-24 fixed">
                <Button
                  className="cursor-pointer bg-gray-400 hover:bg-gray-500 text-white text-lg px-8"
                  type="button"
                  hasEffect
                >
                  Discard
                </Button>
                <Button
                  className={`cursor-pointer text-lg px-8 ${
                    defaultValuesDSP ? "bg-secondary" : ""
                  }`}
                  type="submit"
                  hasEffect
                >
                  {addProductMutation.isPending ||
                  editProductMutation.isPending ? (
                    <Loader2 className="animate-spin" />
                  ) : productValues ? (
                    "Save"
                  ) : (
                    "Add"
                  )}
                </Button>
                <Button
                  variant={"outline"}
                  className="cursor-pointer text-black text-lg px-8 basis-1/2"
                  type="button"
                  onClick={() => router.back()}
                >
                  Back
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProductFormDSP;
