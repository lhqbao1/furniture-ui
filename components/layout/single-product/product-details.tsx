// "use client";
import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { Eye } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/src/i18n/navigation";
import { ProductItem } from "@/types/products";
import { ProductGroupDetailResponse } from "@/types/product-group";
import { ReviewResponse } from "@/types/review";

// Components
import CustomBreadCrumb from "@/components/shared/breadcrumb";
import ProductDetailsSkeleton from "@/components/layout/single-product/product-detail-skeleton";
import ListStars from "@/components/shared/list-stars";

// Hooks
import { useProductData } from "@/hooks/single-product/useProductData";
import { useImageZoom } from "@/hooks/single-product/useImageZoom";
import { useSwipeImage } from "@/hooks/single-product/useSwipeImage";

// Memoized / Dynamic Components
import MainImage from "./image/main-image";
import ImageGallery from "./image/image-carousel";
import ProductDetailsLogistic from "./details/logistics";
import ProductDetailsPrice from "./details/price";
import ListVariant from "./list-variant";
import AddToCartField from "./details/add-to-cart";
import AdminView from "./details/admin-view";
import { getProductById } from "@/features/products/api";
import ListStarsReview from "./details/list-stars-review";

const MemoMainImage = React.memo(MainImage);
const MemoImageGallery = React.memo(ImageGallery);
interface ProductDetailsProps {
  productDetailsData: ProductItem;
  productId: string;
  parentProductData: ProductGroupDetailResponse | null;
  reviews: ReviewResponse[];
}

const ProductDetails = async ({
  productDetailsData,
  productId,
  parentProductData,
  reviews,
}: ProductDetailsProps) => {
  const t = useTranslations();

  const productDetails = await getProductById(productId);
  // ⭐ HOOK: fetch product + parent
  // const { productDetails, parentProduct, isLoadingProduct } = useProductData(
  //   productDetailsData,
  //   parentProductData,
  //   productId,
  // );

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
            {/*Product details */}
            <div className="grid grid-cols-12 xl:gap-16 gap-8">
              {/* LEFT — IMAGE */}
              <div className="xl:col-span-6 col-span-12 flex flex-col gap-6 lg:gap-12">
                <MemoMainImage productDetails={productDetails} />

                <MemoImageGallery productDetails={productDetails} />
              </div>

              {/*Product details */}
              <div className="xl:col-span-6 col-span-12 flex flex-col gap-6">
                <AdminView productId={productId} />
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
                  productId={productId}
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
