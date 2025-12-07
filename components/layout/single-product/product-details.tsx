// "use client";
import React, { useMemo } from "react";
import { ReviewResponse } from "@/types/review";

// Components
import CustomBreadCrumb from "@/components/shared/breadcrumb";
import ProductDetailsSkeleton from "@/components/layout/single-product/product-detail-skeleton";
// Memoized / Dynamic Components
import MainImage from "./image/main-image";
import ImageGallery from "./image/image-carousel";
import ProductDetailsLogistic from "./details/logistics";
import ProductDetailsPrice from "./details/price";
import AddToCartField from "./details/add-to-cart";
import AdminView from "./details/admin-view";
import ListStarsReview from "./details/list-stars-review";
import { useTranslations } from "next-intl";
import { ProductItem } from "@/types/products";
import {
  ProductGroupDetailResponse,
  ProductGroupResponse,
} from "@/types/product-group";

const MemoMainImage = React.memo(MainImage);
const MemoImageGallery = React.memo(ImageGallery);
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

  // Memoized avgRating

  const currentCategory = productDetails.categories[0];
  const currentCategoryName = currentCategory.children?.length
    ? currentCategory.children[0].name
    : currentCategory.name;
  const currentCategoryLink = currentCategory.children?.length
    ? `category/${currentCategory.children[0].slug}`
    : `category/${currentCategory.slug}`;

  return (
    <>
      <div className="py-3 lg:pt-3 space-y-4">
        <CustomBreadCrumb
          isProductPage
          currentPage={currentCategoryName}
          currentPageLink={currentCategoryLink}
        />
        {productDetails ? (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-12 xl:gap-16 gap-8">
              <div className="xl:col-span-6 col-span-12 flex flex-col gap-6 lg:gap-12">
                <MemoMainImage productDetails={productDetails} />

                <MemoImageGallery productDetails={productDetails} />
              </div>

              <div className="xl:col-span-6 col-span-12 flex flex-col gap-6">
                <AdminView productId={productDetails.id} />
                <div>
                  <h2 className="lg:text-3xl text-xl font-semibold text-black/70">
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
