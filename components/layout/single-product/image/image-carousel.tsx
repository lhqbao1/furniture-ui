// sections/ImageGallery.tsx
"use client";

import React from "react";
import Image from "next/image";
import { ProductImageCarousel } from "../sub-images-carousel";
import { useImageZoom } from "@/hooks/single-product/useImageZoom";
interface ImageGalleryProps {
  productDetails: any;
  mainImageIndex: number;
  setMainImageIndex: React.Dispatch<React.SetStateAction<number>>;
}

export default function ImageGallery({
  productDetails,
  mainImageIndex,
  setMainImageIndex,
}: ImageGalleryProps) {
  return (
    <ProductImageCarousel
      productDetails={productDetails}
      mainImageIndex={mainImageIndex}
      setMainImageIndex={setMainImageIndex}
    />
  );
}
