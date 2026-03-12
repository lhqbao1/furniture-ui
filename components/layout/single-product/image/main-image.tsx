// sections/MainImage.tsx
"use client";

import React from "react";
import Image from "next/image";
import ProductImageDialog from "../main-image-dialog";
import { ProductItem } from "@/types/products";
import { useSwipeable } from "react-swipeable";

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
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const animationTimeoutRef = React.useRef<number | null>(null);

  const [dragOffset, setDragOffset] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [swipeDirection, setSwipeDirection] = React.useState<
    "next" | "prev" | null
  >(null);
  const [containerWidth, setContainerWidth] = React.useState(1);

  const imageCount = productDetails.static_files?.length ?? 0;
  const canSwipe = imageCount > 1;

  React.useEffect(() => {
    const updateWidth = () => {
      const nextWidth = containerRef.current?.clientWidth ?? 1;
      setContainerWidth(nextWidth > 0 ? nextWidth : 1);
    };

    updateWidth();

    if (!containerRef.current || typeof ResizeObserver === "undefined") return;

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  React.useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        window.clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const clearAnimationState = React.useCallback(() => {
    setIsAnimating(false);
    setDragOffset(0);
    setSwipeDirection(null);
  }, []);

  const scheduleAfterAnimation = React.useCallback(
    (callback: () => void, delay = 280) => {
      if (animationTimeoutRef.current) {
        window.clearTimeout(animationTimeoutRef.current);
      }
      animationTimeoutRef.current = window.setTimeout(() => {
        callback();
        clearAnimationState();
      }, delay);
    },
    [clearAnimationState],
  );

  const swipeHandlers = useSwipeable({
    trackTouch: true,
    preventScrollOnSwipe: true,
    delta: 8,
    onSwiping: ({ deltaX }) => {
      if (!canSwipe || isAnimating) return;

      const nextOffset = Math.max(
        -containerWidth,
        Math.min(containerWidth, deltaX),
      );
      setDragOffset(nextOffset);
      setSwipeDirection(
        nextOffset < 0 ? "next" : nextOffset > 0 ? "prev" : null,
      );
      if (isHover) setIsHover(false);
    },
    onSwiped: ({ deltaX }) => {
      if (!canSwipe || isAnimating) return;

      const finalOffset = Math.max(
        -containerWidth,
        Math.min(containerWidth, deltaX),
      );
      const absOffset = Math.abs(finalOffset);
      const threshold = Math.min(120, containerWidth * 0.2);
      const direction =
        finalOffset < 0 ? "next" : finalOffset > 0 ? "prev" : null;

      if (!direction || absOffset < threshold) {
        setIsAnimating(true);
        setSwipeDirection(direction);
        setDragOffset(0);
        scheduleAfterAnimation(() => undefined, 220);
        return;
      }

      setIsAnimating(true);
      setSwipeDirection(direction);
      setDragOffset(direction === "next" ? -containerWidth : containerWidth);

      scheduleAfterAnimation(() => {
        setMainImageIndex((prev) => {
          if (direction === "next") return (prev + 1) % imageCount;
          return prev === 0 ? imageCount - 1 : prev - 1;
        });
      });
    },
  });

  const currentIndex = imageCount > 0 ? mainImageIndex % imageCount : 0;
  const nextIndex = imageCount > 0 ? (currentIndex + 1) % imageCount : 0;
  const prevIndex =
    imageCount > 0 ? (currentIndex - 1 + imageCount) % imageCount : 0;

  const currentFile =
    imageCount > 0
      ? (productDetails.static_files[currentIndex]?.url ??
        "/placeholder-product.webp")
      : "/placeholder-product.webp";

  const previewIndex =
    swipeDirection === "next"
      ? nextIndex
      : swipeDirection === "prev"
        ? prevIndex
        : null;

  const previewFile =
    previewIndex !== null && imageCount > 0
      ? (productDetails.static_files[previewIndex]?.url ?? null)
      : null;

  const currentTranslateX = swipeDirection ? dragOffset : 0;
  const previewTranslateX =
    swipeDirection === "next"
      ? dragOffset + containerWidth
      : swipeDirection === "prev"
        ? dragOffset - containerWidth
        : 0;

  const slideTransition = isAnimating
    ? "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)"
    : "none";
  const showSwipePreview = Boolean(swipeDirection && previewFile);

  return (
    <ProductImageDialog
      productDetails={productDetails}
      mainImageIndex={mainImageIndex}
      setMainImageIndex={setMainImageIndex}
    >
      <div
        ref={containerRef}
        className="flex justify-center overflow-hidden main-image relative lg:h-[400px] h-[300px]"
        onMouseMove={handleZoomImage}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        style={{ touchAction: "pan-y" }}
        {...swipeHandlers}
      >
        {showSwipePreview && (
          <div
            className="absolute inset-0 flex justify-center"
            style={{
              transform: `translate3d(${previewTranslateX}px, 0, 0)`,
              transition: slideTransition,
            }}
          >
            {previewFile ? (
              <Image
                src={previewFile}
                width={500}
                height={300}
                alt={productDetails.name}
                className="lg:h-[400px] h-[300px] w-auto object-cover cursor-pointer rounded-xs"
              />
            ) : null}
          </div>
        )}

        <div
          className="absolute inset-0 flex justify-center"
          style={{
            transform: `translate3d(${currentTranslateX}px, 0, 0)`,
            transition: slideTransition,
          }}
        >
          <Image
            src={currentFile}
            width={500}
            height={300}
            alt={productDetails.name}
            priority
            className="transition-transform duration-300 lg:h-[400px] h-[300px] w-auto object-cover cursor-pointer rounded-xs"
            style={{
              transformOrigin: `${position.x}% ${position.y}%`,
              transform:
                isHover && !swipeDirection ? "scale(1.55)" : "scale(1)",
            }}
          />
        </div>

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
