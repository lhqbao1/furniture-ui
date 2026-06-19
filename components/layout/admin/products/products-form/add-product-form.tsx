"use client";
import React, { useEffect, useState } from "react";
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
import { Link, useRouter } from "@/src/i18n/navigation";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import LogStockTab from "./log-stock-tab";
import DetailsLogTab from "./details-log-tab";
import { cn } from "@/lib/utils";
import SyncToEbayForm from "../marketplace/sync-to-ebay-form";
import SyncToAmazonForm from "../marketplace/ync-to-amazon-form";
import RemoveFromMarketplaceDialog from "../marketplace/remove-dialog";
import { ProductInput } from "@/lib/schema/product";
import SaveAndSyncMarketplacesButton from "./save-and-sync-marketplaces-button";

function getFirstErrorMessage(
  errors: Record<string, unknown>,
): string | undefined {
  for (const key in errors) {
    const err = errors[key] as { message?: unknown } | undefined;
    if (typeof err?.message === "string") return err.message;
    if (typeof err === "object") {
      const nested = getFirstErrorMessage(err as Record<string, unknown>);
      if (nested) return nested;
    }
  }
  return undefined;
}

type Marketplace = "kaufland" | "ebay" | "amazon";
const MARKETPLACE_ACTIONS: Marketplace[] = [
  "kaufland",
  "ebay",
  // "amazon",
];
const MARKETPLACE_REFETCH_COOLDOWN_MS = 1800;

function MarketplaceAction({
  product,
  marketplace,
  isSyncing,
}: {
  product: ProductItem;
  marketplace: Marketplace;
  isSyncing: boolean;
}) {
  const [updating, setUpdating] = useState(false);
  const marketplaceProduct = product.marketplace_products?.find(
    (item) => item.marketplace === marketplace,
  );
  const hasMarketplace = Boolean(marketplaceProduct);
  const isActive = marketplaceProduct?.is_active ?? false;

  return (
    <div className="flex items-center justify-between gap-2 rounded-md border p-2">
      <span className="text-xs font-semibold uppercase">{marketplace}</span>
      <div className="flex items-center gap-2">
        {isSyncing ? (
          <Button type="button" variant="outline" size="icon" disabled>
            <Loader2 className="size-4 animate-spin" />
          </Button>
        ) : (
          <>
            {hasMarketplace ? (
              isActive ? (
                marketplace === "amazon" ? (
                  <SyncToAmazonForm
                    updating={updating}
                    setUpdating={setUpdating}
                    product={product}
                    isUpdating
                    currentMarketplace={marketplace}
                    isActive={isActive}
                  />
                ) : (
                  <SyncToEbayForm
                    updating={updating}
                    setUpdating={setUpdating}
                    product={product}
                    isUpdating
                    currentMarketplace={marketplace}
                  />
                )
              ) : marketplace === "amazon" ? (
                <SyncToAmazonForm
                  updating={updating}
                  setUpdating={setUpdating}
                  product={product}
                  currentMarketplace={marketplace}
                  isActive={isActive}
                  isAdd
                />
              ) : (
                <SyncToEbayForm
                  updating={updating}
                  setUpdating={setUpdating}
                  product={product}
                  isAdd
                  currentMarketplace={marketplace}
                />
              )
            ) : marketplace === "amazon" ? (
              <SyncToAmazonForm
                updating={updating}
                setUpdating={setUpdating}
                product={product}
                currentMarketplace={marketplace}
                isActive={false}
                isAdd
              />
            ) : (
              <SyncToEbayForm
                isAdd
                setUpdating={setUpdating}
                product={product}
                updating={updating}
                currentMarketplace={marketplace}
              />
            )}
          </>
        )}

        {!isSyncing && isActive && marketplaceProduct && (
          <RemoveFromMarketplaceDialog
            marketplace={marketplace}
            marketplaceProduct={marketplaceProduct}
            product={product}
          />
        )}
      </div>
    </div>
  );
}

function MarketplaceActions({
  product,
  isSyncing,
}: {
  product: ProductItem;
  isSyncing: boolean;
}) {
  return (
    <div className="space-y-2">
      {MARKETPLACE_ACTIONS.map((marketplace) => (
        <MarketplaceAction
          key={marketplace}
          product={product}
          marketplace={marketplace}
          isSyncing={isSyncing}
        />
      ))}
    </div>
  );
}

const ProductForm = ({
  productValues,
  onSubmit: _onSubmit,
  isPending: _isPending,
  productValuesClone,
  isDrawer,
}: {
  productValues?: Partial<ProductItem>;
  onSubmit: (values: ProductInput) => void;
  isPending?: boolean;
  productValuesClone?: Partial<ProductItem>;
  isDrawer?: boolean;
}) => {
  void _onSubmit;
  void _isPending;

  const router = useRouter();
  const locale = useLocale();
  const [openAccordion, setOpenAccordion] = useState<string[]>(["details"]);
  const productForMarketplace =
    productValues && Array.isArray(productValues.marketplace_products)
      ? (productValues as ProductItem)
      : null;

  const {
    form,
    onSubmit: handleSubmit,
    isLoadingSEO,
    setIsLoadingSEO,
    addProductMutation,
    editProductMutation,
  } = useProductForm({ productValues, productValuesClone });

  const [isMarketplaceSyncing, setIsMarketplaceSyncing] = useState(false);

  useEffect(() => {
    if (!productForMarketplace) {
      setIsMarketplaceSyncing(false);
      return;
    }

    if (editProductMutation.isPending) {
      setIsMarketplaceSyncing(true);
      return;
    }

    if (editProductMutation.isSuccess) {
      setIsMarketplaceSyncing(true);
      const timer = window.setTimeout(() => {
        setIsMarketplaceSyncing(false);
      }, MARKETPLACE_REFETCH_COOLDOWN_MS);

      return () => window.clearTimeout(timer);
    }

    setIsMarketplaceSyncing(false);
  }, [
    productForMarketplace,
    editProductMutation.isPending,
    editProductMutation.isSuccess,
  ]);

  return (
    <div
      className={cn(
        "px-2 pb-12 sm:px-4 lg:px-30 lg:pb-20",
        isDrawer && "lg:!px-4",
      )}
    >
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
          {" "}
          <div className="flex w-full flex-col-reverse gap-5 lg:grid lg:grid-cols-12 lg:gap-12 xl:gap-24">
            <div className="lg:col-span-9 flex flex-col gap-4">
              <Accordion
                type="multiple"
                value={openAccordion}
                onValueChange={setOpenAccordion}
                className="w-full space-y-4 sm:space-y-8"
              >
                {/* DETAILS */}
                <AccordionItem value="details" className="border-none">
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
                      <CardContent className="p-4 sm:p-6">
                        <ProductDetailInputs
                          isEdit={!!productValues}
                          productId={productValues?.id_provider ?? null}
                          productUuid={productValues?.id ?? null}
                          videoUrls={productValues?.video_urls}
                          productDetails={productValues}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </AccordionItem>

                {/* ADDITIONAL */}
                <AccordionItem value="additional" className="border-none">
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
                      <CardContent className="p-4 sm:p-6">
                        <ProductAdditionalInputs />
                      </CardContent>
                    </Card>
                  </div>
                </AccordionItem>

                {/* BUNDLE */}
                <AccordionItem value="component" className="border-none">
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
                      <CardContent className="p-4 sm:p-6">
                        <SelectBundleComponent
                          currentProduct={productValues}
                          isInDrawer={Boolean(isDrawer)}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </AccordionItem>

                {/* LOGISTIC */}
                <AccordionItem value="logistic" className="border-none">
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
                      <CardContent className="p-4 sm:p-6">
                        <ProductLogisticsGroup />
                      </CardContent>
                    </Card>
                  </div>
                </AccordionItem>

                {/* MANUAL */}
                <AccordionItem value="manual" className="border-none">
                  <AccordionTrigger className="bg-gray-100 px-2 rounded-sm text-lg font-bold cursor-pointer">
                    Document
                  </AccordionTrigger>

                  <div
                    className={
                      openAccordion.includes("manual") ? "block mt-4" : "hidden"
                    }
                  >
                    <Card>
                      <CardContent className="p-4 sm:p-6">
                        <ProductManual />
                      </CardContent>
                    </Card>
                  </div>
                </AccordionItem>

                {/* SEO */}
                <AccordionItem value="seo" className="border-none">
                  <AccordionTrigger className="bg-gray-100 px-2 rounded-sm text-lg font-bold cursor-pointer">
                    SEO
                  </AccordionTrigger>

                  <div
                    className={
                      openAccordion.includes("seo") ? "block mt-4" : "hidden"
                    }
                  >
                    <Card>
                      <CardContent className="p-4 sm:p-6">
                        <ProductSEOGroup setIsLoadingSEO={setIsLoadingSEO} />
                      </CardContent>
                    </Card>
                  </div>
                </AccordionItem>

                {/* Log Stock */}
                {productValues && (
                  <AccordionItem value="log" className="border-none">
                    <AccordionTrigger className="bg-gray-100 px-2 rounded-sm text-lg font-bold cursor-pointer">
                      Stock Log
                    </AccordionTrigger>

                    <div
                      className={
                        openAccordion.includes("log") ? "block mt-4" : "hidden"
                      }
                    >
                      <Card>
                        <CardContent className="overflow-x-auto p-4 sm:p-6">
                          <LogStockTab productDetail={productValues} />
                        </CardContent>
                      </Card>
                    </div>
                  </AccordionItem>
                )}

                {/* Log All */}
                {productValues && (
                  <AccordionItem value="details-log" className="border-none">
                    <AccordionTrigger className="bg-gray-100 px-2 rounded-sm text-lg font-bold cursor-pointer">
                      Activities Log
                    </AccordionTrigger>

                    <div
                      className={
                        openAccordion.includes("details-log")
                          ? "block mt-4"
                          : "hidden"
                      }
                    >
                      <Card>
                        <CardContent className="overflow-x-auto p-4 sm:p-6">
                          <DetailsLogTab productId={productValues.id} />
                        </CardContent>
                      </Card>
                    </div>
                  </AccordionItem>
                )}
              </Accordion>
            </div>

            <div className="lg:col-span-3 flex min-w-0 flex-col items-end gap-4">
              <div
                className={cn(
                  "z-20 grid min-w-0 grid-cols-2 justify-end gap-2",
                  isDrawer
                    ? "w-full self-end lg:sticky lg:top-4"
                    : "w-full lg:fixed lg:right-4 lg:top-24 lg:w-[23rem] lg:max-w-[calc(100vw-2rem)] xl:right-[7.5rem]",
                )}
              >
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
                {/* {productValues?.id && (
                  <SaveAndSyncMarketplacesButton
                    form={form}
                    productValues={productValues}
                    disabled={isLoadingSEO}
                    className="text-lg px-4"
                  />
                )} */}
                {!isDrawer && <AdminBackButton />}
                {productValues?.url_key ? (
                  <Button
                    type="button"
                    variant={"secondary"}
                    className="text-lg px-8"
                    asChild
                  >
                    <Link
                      href={`/product/${productValues.url_key}`}
                      target="_blank"
                      rel="nofollow noopener noreferrer"
                      locale={locale}
                    >
                      View
                    </Link>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant={"secondary"}
                    className="text-lg px-8"
                    disabled
                  >
                    View
                  </Button>
                )}
                <Button
                  type="button"
                  className="text-lg px-8 bg-blue-400 hover:bg-blue-500"
                  onClick={() =>
                    router.push(`/admin/products/${productValues?.id}/clone`, {
                      locale,
                    })
                  }
                >
                  Clone
                </Button>
                {productForMarketplace && (
                  <div className="col-span-2 space-y-2 lg:mt-2">
                    <p className="text-sm font-semibold text-black">
                      Marketplace
                    </p>
                    <MarketplaceActions
                      product={productForMarketplace}
                      isSyncing={isMarketplaceSyncing}
                    />
                  </div>
                )}
                <div className="col-span-2 min-w-0 lg:mt-4">
                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem className="flex w-full min-w-0 flex-col">
                        <FormLabel className="text-black font-semibold text-sm">
                          Note
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Write product description..."
                            className="min-h-[120px] w-full max-w-full resize-none whitespace-pre-wrap break-words"
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
