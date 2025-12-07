// sections/MainImage.tsx
"use client";

import React from "react";
import Image from "next/image";
import ProductImageDialog from "../main-image-dialog";
import { ProductItem } from "@/types/products";
import { useImageZoom } from "@/hooks/single-product/useImageZoom";
import { useSwipeImage } from "@/hooks/single-product/useSwipeImage";
// ---- CHANGE NOTE ----
// vẫn reuse dialog gốc của bạn (không thay đổi logic hoặc file name)

interface MainImageProps {
  productDetails: ProductItem;
}

export default function MainImage({ productDetails }: MainImageProps) {
  const {
    mainImageIndex,
    setMainImageIndex,
    position,
    isHover,
    setIsHover,
    handleZoomImage,
  } = useImageZoom();

  const handlers = useSwipeImage(productDetails, setMainImageIndex);

  const mainFile =
    productDetails.static_files?.length > 0
      ? productDetails.static_files[mainImageIndex].url
      : "/placeholder-product.webp";

  return (
    <ProductImageDialog
      productDetails={productDetails}
      mainImageIndex={mainImageIndex}
      setMainImageIndex={setMainImageIndex}
    >
      <div
        className="flex justify-center overflow-hidden main-image relative"
        onMouseMove={handleZoomImage}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        {...handlers} // swipe left/right
      >
        <Image
          src={mainFile}
          width={500}
          height={300}
          alt={productDetails.name}
          priority
          className="transition-transform duration-300 lg:h-[400px] h-[300px] w-auto object-cover cursor-pointer rounded-xs"
          style={{
            transformOrigin: `${position.x}% ${position.y}%`,
            transform: isHover ? "scale(1.5)" : "scale(1)",
          }}
        />

        {productDetails.is_fsc && (
          <div className="absolute top-4 right-4 cursor-pointer">
            <Image
              src={"/fcs1.webp"}
              width={50}
              height={50}
              alt=""
              className="object-cover hover:scale-110 transition-all duration-300"
            />
          </div>
        )}
      </div>
    </ProductImageDialog>
  );
}
