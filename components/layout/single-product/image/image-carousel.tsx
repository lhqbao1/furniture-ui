// sections/ImageGallery.tsx
"use client";

import React from "react";
import Image from "next/image";
import { ProductImageCarousel } from "../sub-images-carousel";

// ---- CHANGE NOTE ----
// Vẫn dùng component carousel gốc của bạn (không thay đổi logic).

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
