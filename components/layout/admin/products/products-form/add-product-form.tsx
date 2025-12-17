"use client";
import React, { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import ProductDetailInputs from "./fisrt-group";
import ProductAdditionalInputs from "./product-additional-group";
import ProductLogisticsGroup from "./product-logistics-group";
import ProductSEOGroup from "./product-seo-group";
import SelectBundleComponent from "../bundle/select-bundle";
import AdminBackButton from "@/components/layout/admin/admin-back-button";
import { useProductForm } from "./useProductForm";
import { ProductItem } from "@/types/products";
import ProductManual from "./product-manual";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "@/src/i18n/navigation";
import { useLocale } from "next-intl";

const ProductForm = ({
  productValues,
  onSubmit,
  isPending,
  productValuesClone,
}: {
  productValues?: Partial<ProductItem>;
  onSubmit: any;
  isPending?: boolean;
  productValuesClone?: Partial<ProductItem>;
}) => {
  const router = useRouter();
  const locale = useLocale();
  const [openAccordion, setOpenAccordion] = useState<string[]>(["details"]);

  const {
    form,
    onSubmit: handleSubmit,
    isLoadingSEO,
    setIsLoadingSEO,
    addProductMutation,
    editProductMutation,
  } = useProductForm({ productValues, productValuesClone });

  return (
    <div className="lg:pb-20 lg:px-30 pb-12">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="lg:grid-cols-12 lg:grid flex flex-col-reverse lg:gap-24 w-full">
            <div className="lg:col-span-9 flex flex-col gap-4">
              <Accordion
                type="multiple"
                value={openAccordion}
                onValueChange={setOpenAccordion}
                className="w-full space-y-8"
              >
                {/* DETAILS */}
                <AccordionItem
                  value="details"
                  className="border-none"
                >
                  <AccordionTrigger className="bg-gray-100 px-2 rounded-sm text-lg font-bold cursor-pointer">
                    Details
                  </AccordionTrigger>

                  {/* Always mounted, only hidden */}
                  <div
                    className={
                      openAccordion.includes("details")
                        ? "block mt-4"
                        : "hidden"
                    }
                  >
                    <Card>
                      <CardContent>
                        <ProductDetailInputs
                          isEdit={!!productValues}
                          productId={productValues?.id_provider ?? null}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </AccordionItem>

                {/* ADDITIONAL */}
                <AccordionItem
                  value="additional"
                  className="border-none"
                >
                  <AccordionTrigger className="bg-gray-100 px-2 rounded-sm text-lg font-bold cursor-pointer">
                    Additional Details
                  </AccordionTrigger>

                  <div
                    className={
                      openAccordion.includes("additional")
                        ? "block mt-4"
                        : "hidden"
                    }
                  >
                    <Card>
                      <CardContent>
                        <ProductAdditionalInputs />
                      </CardContent>
                    </Card>
                  </div>
                </AccordionItem>

                {/* BUNDLE */}
                <AccordionItem
                  value="component"
                  className="border-none"
                >
                  <AccordionTrigger className="bg-gray-100 px-2 rounded-sm text-lg font-bold cursor-pointer">
                    Product Bundle
                  </AccordionTrigger>

                  <div
                    className={
                      openAccordion.includes("component")
                        ? "block mt-4"
                        : "hidden"
                    }
                  >
                    <Card>
                      <CardContent>
                        <SelectBundleComponent currentProduct={productValues} />
                      </CardContent>
                    </Card>
                  </div>
                </AccordionItem>

                {/* LOGISTIC */}
                <AccordionItem
                  value="logistic"
                  className="border-none"
                >
                  <AccordionTrigger className="bg-gray-100 px-2 rounded-sm text-lg font-bold cursor-pointer">
                    Logistic
                  </AccordionTrigger>

                  <div
                    className={
                      openAccordion.includes("logistic")
                        ? "block mt-4"
                        : "hidden"
                    }
                  >
                    <Card>
                      <CardContent>
                        <ProductLogisticsGroup />
                      </CardContent>
                    </Card>
                  </div>
                </AccordionItem>

                {/* MANUAL */}
                <AccordionItem
                  value="manual"
                  className="border-none"
                >
                  <AccordionTrigger className="bg-gray-100 px-2 rounded-sm text-lg font-bold cursor-pointer">
                    Document
                  </AccordionTrigger>

                  <div
                    className={
                      openAccordion.includes("manual") ? "block mt-4" : "hidden"
                    }
                  >
                    <Card>
                      <CardContent>
                        <ProductManual />
                      </CardContent>
                    </Card>
                  </div>
                </AccordionItem>

                {/* SEO */}
                <AccordionItem
                  value="seo"
                  className="border-none"
                >
                  <AccordionTrigger className="bg-gray-100 px-2 rounded-sm text-lg font-bold cursor-pointer">
                    SEO
                  </AccordionTrigger>

                  <div
                    className={
                      openAccordion.includes("seo") ? "block mt-4" : "hidden"
                    }
                  >
                    <Card>
                      <CardContent>
                        <ProductSEOGroup setIsLoadingSEO={setIsLoadingSEO} />
                      </CardContent>
                    </Card>
                  </div>
                </AccordionItem>
              </Accordion>
            </div>

            <div className="lg:col-span-3 flex flex-col items-end gap-4">
              <div className="grid grid-cols-2 gap-2 justify-end top-24 fixed">
                <Button
                  type="submit"
                  disabled={isLoadingSEO}
                  className="text-lg px-8"
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
                <AdminBackButton />
                <Button
                  type="button"
                  variant={"secondary"}
                  className="text-lg px-8"
                  onClick={() =>
                    router.push(`/product/${productValues?.url_key}`, {
                      locale,
                    })
                  }
                >
                  View
                </Button>
                <div className="col-span-2 lg:mt-4">
                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem className="flex flex-col w-full">
                        <FormLabel className="text-black font-semibold text-sm">
                          Note
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Write product description..."
                            className="min-h-[120px] resize-none"
                            value={field.value ?? ""} // null → empty string
                            onChange={(e) =>
                              field.onChange(
                                e.target.value === "" ? null : e.target.value,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProductForm;
