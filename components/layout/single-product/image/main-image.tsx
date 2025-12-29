// sections/MainImage.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import ProductImageDialog from "../main-image-dialog";
import { ProductItem } from "@/types/products";
import { useSwipeImage } from "@/hooks/single-product/useSwipeImage";

interface MainImageProps {
  productDetails: ProductItem;
  mainImageIndex: number;
  setMainImageIndex: React.Dispatch<React.SetStateAction<number>>;
  position: { x: number; y: number };
  isHover: boolean;
  setIsHover: (v: boolean) => void;
  handleZoomImage: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export default function MainImage({
  productDetails,
  mainImageIndex,
  setMainImageIndex,
  position,
  isHover,
  setIsHover,
  handleZoomImage,
}: MainImageProps) {
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  const handlers = useSwipeImage(
    productDetails,
    setMainImageIndex,
    setDirection,
  );

  useEffect(() => {
    if (!direction) return;
    const timeout = setTimeout(() => setDirection(null), 300);
    return () => clearTimeout(timeout);
  }, [direction]);

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
          className={`
            transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
            lg:h-[400px] h-[300px] w-auto object-cover cursor-pointer rounded-xs
            ${direction === "left" ? "-translate-x-6" : ""}
            ${direction === "right" ? "translate-x-6" : ""}
          `}
          style={{
            transformOrigin: `${position.x}% ${position.y}%`,
            transform: isHover ? "scale(1.55)" : "scale(1)",
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
