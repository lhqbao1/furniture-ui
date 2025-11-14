// sections/MainImage.tsx
"use client";

import React from "react";
import Image from "next/image";
import ProductImageDialog from "../main-image-dialog";
// ---- CHANGE NOTE ----
// vẫn reuse dialog gốc của bạn (không thay đổi logic hoặc file name)

interface MainImageProps {
  productDetails: any;
  mainImageIndex: number;
  setMainImageIndex: React.Dispatch<React.SetStateAction<number>>;
  position: { x: number; y: number };
  isHover: boolean;
  setIsHover: (v: boolean) => void;
  handleZoomImage: (e: React.MouseEvent<HTMLDivElement>) => void;
  handlers: any; // swipe handlers
}

export default function MainImage({
  productDetails,
  mainImageIndex,
  setMainImageIndex,
  position,
  isHover,
  setIsHover,
  handleZoomImage,
  handlers,
}: MainImageProps) {
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
        className="flex justify-center overflow-hidden main-image"
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
          className="transition-transform duration-300 lg:h-[400px] h-[300px] w-auto object-cover cursor-pointer"
          style={{
            transformOrigin: `${position.x}% ${position.y}%`,
            transform: isHover ? "scale(1.5)" : "scale(1)",
          }}
        />
      </div>
    </ProductImageDialog>
  );
}
