import React from "react";
import { ReviewResponse } from "@/types/review";

// Components
import CustomBreadCrumb from "@/components/shared/breadcrumb";
import ProductDetailsSkeleton from "@/components/layout/single-product/product-detail-skeleton";

import ProductDetailsLogistic from "./details/logistics";
import ProductDetailsPrice from "./details/price";
import AddToCartField from "./details/add-to-cart";
import AdminView from "./details/admin-view";
import ListStarsReview from "./details/list-stars-review";
import { useLocale, useTranslations } from "next-intl";
import { ProductItem } from "@/types/products";
import { ProductGroupDetailResponse } from "@/types/product-group";
import ProductImageWrapper from "./image/product-image-wrapper";
import ProductBrand from "./product-brand";

interface ProductDetailsProps {
  reviews: ReviewResponse[];
  productDetails: ProductItem;
  parentProduct: ProductGroupDetailResponse | null;
}

const ProductDetails = ({
  reviews,
  productDetails,
  parentProduct,
}: ProductDetailsProps) => {
  const t = useTranslations();

  // ✅ Safely get category info
  const currentCategory = productDetails.categories?.[0];
  const hasCategory = !!currentCategory;

  const firstChild = currentCategory?.children?.[0];

  const currentCategoryName = firstChild?.name ?? currentCategory?.name;

  const currentCategoryLink = firstChild?.slug
    ? `category/${firstChild.slug}`
    : currentCategory?.slug
      ? `category/${currentCategory.slug}`
      : undefined;

  return (
    <>
      <div className="py-3 lg:pt-6 space-y-4">
        {/* ✅ Chỉ render breadcrumb khi có category */}
        {hasCategory && currentCategoryName && currentCategoryLink && (
          <CustomBreadCrumb
            isProductPage
            currentPage={currentCategoryName}
            currentPageLink={currentCategoryLink}
          />
        )}

        {productDetails ? (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-12 xl:gap-16 gap-8">
              <div className="xl:col-span-6 col-span-12">
                <ProductImageWrapper productDetails={productDetails} />
              </div>

              <div className="xl:col-span-6 col-span-12 flex flex-col gap-2">
                <AdminView productId={productDetails.id} />
                <div>
                  <ProductBrand
                    brand={
                      productDetails.brand ? productDetails.brand.name : ""
                    }
                    brand_image={
                      productDetails.brand ? productDetails.brand.img_url : ""
                    }
                    isProductDetail
                  />
                  <h1 className="lg:text-3xl text-xl font-semibold text-black mb-1">
                    {productDetails.name ?? ""}
                  </h1>
                  <div className="text-sm">
                    {t("itemNumber")}: {productDetails.id_provider ?? ""}
                  </div>
                </div>
                <ListStarsReview reviews={reviews} />

                <ProductDetailsPrice
                  productDetails={productDetails}
                  isProductDetails={true}
                />

                <ProductDetailsLogistic productDetails={productDetails} />
                {productDetails.meta_description && (
                  <div className="seo-content text-sm shadow-[0_0_10px_rgba(0,0,0,0.1)] rounded-2xl px-4 py-3 mt-2">
                    <h2 className="text-sm mb-0.5">
                      Warum {productDetails.name} wählen?
                    </h2>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: productDetails.meta_description,
                      }}
                    />
                  </div>
                )}
                <AddToCartField
                  productDetails={productDetails}
                  productId={productDetails.id}
                />
              </div>
            </div>
          </div>
        ) : (
          <ProductDetailsSkeleton />
        )}
      </div>
    </>
  );
};

export default ProductDetails;
