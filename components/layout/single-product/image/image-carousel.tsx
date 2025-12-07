// sections/ImageGallery.tsx
"use client";

import React from "react";
import Image from "next/image";
import { ProductImageCarousel } from "../sub-images-carousel";
import { useImageZoom } from "@/hooks/single-product/useImageZoom";
interface ImageGalleryProps {
  productDetails: any;
}

export default function ImageGallery({ productDetails }: ImageGalleryProps) {
  const { mainImageIndex, setMainImageIndex } = useImageZoom();
  return (
    <ProductImageCarousel
      productDetails={productDetails}
      mainImageIndex={mainImageIndex}
      setMainImageIndex={setMainImageIndex}
    />
  );
}
