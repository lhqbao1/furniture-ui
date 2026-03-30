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
  const preloadedUrlsRef = React.useRef<Set<string>>(new Set());

  const [dragOffset, setDragOffset] = React.useState(0);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [isMobileViewport, setIsMobileViewport] = React.useState(false);

  const imageCount = productDetails.static_files?.length ?? 0;
  const canSwipe = imageCount > 1;
  const SLIDE_DURATION = 210;
  const REBOUND_DURATION = 180;
  const SNAP_RATIO = 0.3;
  const FLICK_VELOCITY_THRESHOLD = 0.45;
  const SLIDE_EASING = "cubic-bezier(0.22, 0.88, 0.26, 1)";

  const nextIndex = React.useCallback(
    (index: number) => (index + 1) % imageCount,
    [imageCount],
  );

  const prevIndex = React.useCallback(
    (index: number) => (index - 1 + imageCount) % imageCount,
    [imageCount],
  );

  const getImageUrl = React.useCallback(
    (index: number) => {
      if (imageCount <= 0) return "/placeholder-product.webp";
      return (
        productDetails.static_files[index]?.url ?? "/placeholder-product.webp"
      );
    },
    [imageCount, productDetails.static_files],
  );

  const preloadImageUrl = React.useCallback((url: string | null | undefined) => {
    if (typeof window === "undefined") return;
    if (!url || url === "/placeholder-product.webp") return;
    if (preloadedUrlsRef.current.has(url)) return;

    preloadedUrlsRef.current.add(url);
    const img = new window.Image();
    img.src = url;
  }, []);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateIsMobile = (event?: MediaQueryListEvent) => {
      setIsMobileViewport(event?.matches ?? mediaQuery.matches);
    };

    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => mediaQuery.removeEventListener("change", updateIsMobile);
  }, []);

  const getCurrentContainerWidth = React.useCallback(() => {
    const elementWidth = containerRef.current?.getBoundingClientRect().width ?? 0;
    const viewportWidth =
      typeof window !== "undefined"
        ? (window.visualViewport?.width ?? window.innerWidth)
        : 0;
    const nextWidth = elementWidth || viewportWidth || 1;
    return nextWidth > 0 ? nextWidth : 1;
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
  }, []);

  const scheduleAfterAnimation = React.useCallback(
    (callback: () => void, delay = SLIDE_DURATION) => {
      if (animationTimeoutRef.current) {
        window.clearTimeout(animationTimeoutRef.current);
      }
      animationTimeoutRef.current = window.setTimeout(() => {
        callback();
        clearAnimationState();
      }, delay);
    },
    [SLIDE_DURATION, clearAnimationState],
  );

  const animateSlide = React.useCallback(
    (direction: "next" | "prev") => {
      if (!canSwipe || isAnimating) return;

      const currentWidth = getCurrentContainerWidth();
      setIsAnimating(true);
      setDragOffset(direction === "next" ? -currentWidth : currentWidth);

      scheduleAfterAnimation(() => {
        setMainImageIndex((prev) =>
          direction === "next" ? nextIndex(prev) : prevIndex(prev),
        );
      }, SLIDE_DURATION);
    },
    [
      canSwipe,
      getCurrentContainerWidth,
      isAnimating,
      nextIndex,
      prevIndex,
      scheduleAfterAnimation,
      setMainImageIndex,
      SLIDE_DURATION,
    ],
  );

  const swipeHandlers = useSwipeable({
    trackTouch: true,
    preventScrollOnSwipe: true,
    delta: 8,
    onSwiping: ({ deltaX }) => {
      if (!isMobileViewport || !canSwipe || isAnimating) return;
      const currentWidth = getCurrentContainerWidth();

      const nextOffset = Math.max(
        -currentWidth,
        Math.min(currentWidth, deltaX),
      );
      setDragOffset(nextOffset);
      if (isHover) setIsHover(false);
    },
    onSwiped: ({ deltaX, absX = 0, velocity = 0 }) => {
      if (!isMobileViewport || !canSwipe || isAnimating) return;
      const currentWidth = getCurrentContainerWidth();

      const finalOffset = Math.max(
        -currentWidth,
        Math.min(currentWidth, deltaX),
      );
      const absOffset = Math.max(Math.abs(finalOffset), absX);
      const threshold = currentWidth * SNAP_RATIO;
      const direction =
        finalOffset < 0 ? "next" : finalOffset > 0 ? "prev" : null;
      const isFlick = Math.abs(velocity) >= FLICK_VELOCITY_THRESHOLD;
      const shouldNavigate = Boolean(direction) && (absOffset >= threshold || isFlick);

      if (!shouldNavigate) {
        setIsAnimating(true);
        setDragOffset(0);
        scheduleAfterAnimation(() => undefined, REBOUND_DURATION);
        return;
      }
      animateSlide(direction);
    },
  });

  const prevImage = getImageUrl(prevIndex(mainImageIndex));
  const currentImage = getImageUrl(mainImageIndex);
  const nextImage = getImageUrl(nextIndex(mainImageIndex));

  const slideTransition = isAnimating
    ? `transform ${SLIDE_DURATION}ms ${SLIDE_EASING}`
    : "none";

  React.useEffect(() => {
    if (!isMobileViewport || imageCount <= 0) return;

    const next = nextIndex(mainImageIndex);
    const prev = prevIndex(mainImageIndex);
    preloadImageUrl(getImageUrl(mainImageIndex));
    preloadImageUrl(getImageUrl(next));
    preloadImageUrl(getImageUrl(prev));
  }, [
    isMobileViewport,
    imageCount,
    mainImageIndex,
    nextIndex,
    prevIndex,
    getImageUrl,
    preloadImageUrl,
  ]);

  return (
    <ProductImageDialog
      productDetails={productDetails}
      mainImageIndex={mainImageIndex}
      setMainImageIndex={setMainImageIndex}
    >
      <div
        ref={containerRef}
        className="flex w-full justify-center overflow-hidden main-image relative lg:h-[430px] h-[340px] bg-white"
        onMouseMove={handleZoomImage}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        style={isMobileViewport ? { touchAction: "pan-y" } : undefined}
        {...(isMobileViewport ? swipeHandlers : {})}
      >
        {isMobileViewport ? (
          <div
            className="absolute inset-0 flex"
            style={{
              width: "300%",
              transform: `translate3d(calc(-33.3333% + ${dragOffset}px), 0, 0)`,
              transition: slideTransition,
            }}
          >
            <div className="relative h-full w-1/3 flex-shrink-0 bg-white">
              <Image
                src={prevImage}
                fill
                alt={productDetails.name}
                className="object-contain cursor-pointer rounded-xs"
                sizes="100vw"
              />
            </div>
            <div className="relative h-full w-1/3 flex-shrink-0 bg-white">
              <Image
                src={currentImage}
                fill
                alt={productDetails.name}
                priority
                className="object-contain cursor-pointer rounded-xs"
                sizes="100vw"
              />
            </div>
            <div className="relative h-full w-1/3 flex-shrink-0 bg-white">
              <Image
                src={nextImage}
                fill
                alt={productDetails.name}
                className="object-contain cursor-pointer rounded-xs"
                sizes="100vw"
              />
            </div>
          </div>
        ) : (
          <Image
            src={currentImage}
            width={500}
            height={300}
            alt={productDetails.name}
            priority
            className="transition-transform duration-300 lg:h-[430px] h-[340px] w-auto object-contain cursor-pointer rounded-xs"
            style={{
              transformOrigin: `${position.x}% ${position.y}%`,
              transform: isHover ? "scale(1.55)" : "scale(1)",
            }}
          />
        )}

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
