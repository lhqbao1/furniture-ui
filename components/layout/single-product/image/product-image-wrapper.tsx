"use client";
import { useImageZoom } from "@/hooks/single-product/useImageZoom";
import React from "react";
import MainImage from "./main-image";
import ImageGallery from "./image-carousel";
import { ProductItem } from "@/types/products";

interface ProductImageWrapperProps {
  productDetails: ProductItem;
}

const ProductImageWrapper = ({ productDetails }: ProductImageWrapperProps) => {
  const {
    mainImageIndex,
    setMainImageIndex,
    position,
    isHover,
    setIsHover,
    handleZoomImage,
  } = useImageZoom();
  return (
    <div className="flex flex-col gap-6 lg:gap-12">
      <MainImage
        productDetails={productDetails}
        handleZoomImage={handleZoomImage}
        isHover={isHover}
        mainImageIndex={mainImageIndex}
        setMainImageIndex={setMainImageIndex}
        position={position}
        setIsHover={setIsHover}
      />
      <ImageGallery
        productDetails={productDetails}
        mainImageIndex={mainImageIndex}
        setMainImageIndex={setMainImageIndex}
      />
    </div>
  );
};

export default ProductImageWrapper;
