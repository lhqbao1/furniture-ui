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
import { useTranslations } from "next-intl";
import { ProductItem } from "@/types/products";
import { ProductGroupDetailResponse } from "@/types/product-group";
import ProductImageWrapper from "./image/product-image-wrapper";

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

  const currentCategoryName = hasCategory
    ? currentCategory!.children?.length
      ? currentCategory!.children[0].name
      : currentCategory!.name
    : undefined;

  const currentCategoryLink = hasCategory
    ? currentCategory!.children?.length
      ? `category/${currentCategory!.children[0].slug}`
      : `category/${currentCategory!.slug}`
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

              <div className="xl:col-span-6 col-span-12 flex flex-col gap-6">
                <AdminView productId={productDetails.id} />
                <div>
                  <p className="uppercase text-sm cursor-pointer text-black/50 font-bold">
                    {productDetails.brand ? productDetails.brand.name : ""}
                  </p>
                  <h2 className="lg:text-3xl text-xl font-semibold text-black">
                    {productDetails.name}
                  </h2>
                  <div>
                    {t("itemNumber")}: {productDetails.id_provider}
                  </div>
                </div>
                <ListStarsReview reviews={reviews} />

                <ProductDetailsPrice productDetails={productDetails} />

                <ProductDetailsLogistic productDetails={productDetails} />
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
