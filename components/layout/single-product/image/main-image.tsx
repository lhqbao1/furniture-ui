"use client";

import React from "react";
import Image from "next/image";
import ProductImageDialog from "../main-image-dialog";
import { ProductItem } from "@/types/products";
import { useSwipeable } from "react-swipeable";
import {
  buildProductMediaItems,
  ProductMediaItem,
} from "./product-media-utils";

interface MainImageProps {
  productDetails: ProductItem;
  mainImageIndex: number;
  setMainImageIndex: React.Dispatch<React.SetStateAction<number>>;
  position: { x: number; y: number };
  isHover: boolean;
  setIsHover: (v: boolean) => void;
  handleZoomImage: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const VIDEO_QUERY = "autoplay=1&mute=1&playsinline=1&rel=0";

const renderMediaPreview = (media: ProductMediaItem, alt: string) => {
  if (media.type === "image") {
    return (
      <Image
        src={media.sourceUrl}
        fill
        alt={alt}
        className="object-contain cursor-pointer rounded-xs"
        sizes="100vw"
      />
    );
  }

  return (
    <div className="h-full w-full bg-black/90 flex items-center justify-center text-white text-sm font-semibold tracking-wide">
      VIDEO
    </div>
  );
};

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

  const mediaItems = React.useMemo(
    () => buildProductMediaItems(productDetails),
    [productDetails],
  );

  const mediaCount = mediaItems.length;
  const canSwipe = mediaCount > 1;
  const SLIDE_DURATION = 210;
  const REBOUND_DURATION = 180;
  const SNAP_RATIO = 0.3;
  const FLICK_VELOCITY_THRESHOLD = 0.45;
  const SLIDE_EASING = "cubic-bezier(0.22, 0.88, 0.26, 1)";

  const nextIndex = React.useCallback(
    (index: number) => (index + 1) % Math.max(mediaCount, 1),
    [mediaCount],
  );

  const prevIndex = React.useCallback(
    (index: number) => (index - 1 + Math.max(mediaCount, 1)) % Math.max(mediaCount, 1),
    [mediaCount],
  );

  const getMediaItem = React.useCallback(
    (index: number): ProductMediaItem => {
      const fallback: ProductMediaItem = {
        type: "image",
        key: "fallback-image",
        sourceUrl: "/placeholder-product.webp",
      };

      if (mediaCount <= 0) return fallback;
      return mediaItems[index] ?? fallback;
    },
    [mediaCount, mediaItems],
  );

  React.useEffect(() => {
    if (mediaCount <= 0) {
      if (mainImageIndex !== 0) setMainImageIndex(0);
      return;
    }

    if (mainImageIndex > mediaCount - 1) {
      setMainImageIndex(mediaCount - 1);
    }
  }, [mainImageIndex, mediaCount, setMainImageIndex]);

  const preloadMediaItem = React.useCallback((media: ProductMediaItem) => {
    if (typeof window === "undefined") return;
    if (media.type !== "image") return;
    const url = media.sourceUrl;
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

  const prevMedia = getMediaItem(prevIndex(mainImageIndex));
  const currentMedia = getMediaItem(mainImageIndex);
  const nextMedia = getMediaItem(nextIndex(mainImageIndex));

  const slideTransition = isAnimating
    ? `transform ${SLIDE_DURATION}ms ${SLIDE_EASING}`
    : "none";

  React.useEffect(() => {
    if (!isMobileViewport || mediaCount <= 0) return;

    const next = nextIndex(mainImageIndex);
    const prev = prevIndex(mainImageIndex);
    preloadMediaItem(getMediaItem(mainImageIndex));
    preloadMediaItem(getMediaItem(next));
    preloadMediaItem(getMediaItem(prev));
  }, [
    isMobileViewport,
    mediaCount,
    mainImageIndex,
    nextIndex,
    prevIndex,
    getMediaItem,
    preloadMediaItem,
  ]);

  const hasLeadingVideo = mediaItems[0]?.type === "video";
  const dialogIndexOffset = hasLeadingVideo ? 1 : 0;
  const currentMediaIsImage = currentMedia.type === "image";

  const setDialogImageIndex: React.Dispatch<React.SetStateAction<number>> =
    React.useCallback(
      (nextValue) => {
        setMainImageIndex((prevMediaIndex) => {
          const prevImageIndex = Math.max(0, prevMediaIndex - dialogIndexOffset);
          const resolvedNextImageIndex =
            typeof nextValue === "function"
              ? (nextValue as (prevState: number) => number)(prevImageIndex)
              : nextValue;
          return Math.max(0, resolvedNextImageIndex + dialogIndexOffset);
        });
      },
      [dialogIndexOffset, setMainImageIndex],
    );

  const viewer = (
    <div
      ref={containerRef}
      className="flex w-full justify-center overflow-hidden main-image relative lg:h-[430px] h-[340px] bg-white"
      onMouseMove={currentMediaIsImage ? handleZoomImage : undefined}
      onMouseEnter={currentMediaIsImage ? () => setIsHover(true) : undefined}
      onMouseLeave={currentMediaIsImage ? () => setIsHover(false) : undefined}
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
            {renderMediaPreview(prevMedia, productDetails.name)}
          </div>

          <div className="relative h-full w-1/3 flex-shrink-0 bg-white">
            {currentMedia.type === "video" ? (
              <iframe
                className="h-full w-full"
                src={`${currentMedia.embedUrl}?${VIDEO_QUERY}`}
                title={productDetails.name}
                loading="eager"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <Image
                src={currentMedia.sourceUrl}
                fill
                alt={productDetails.name}
                priority
                className="object-contain cursor-pointer rounded-xs"
                sizes="100vw"
              />
            )}
          </div>

          <div className="relative h-full w-1/3 flex-shrink-0 bg-white">
            {renderMediaPreview(nextMedia, productDetails.name)}
          </div>
        </div>
      ) : currentMedia.type === "video" ? (
        <iframe
          className="h-full w-full"
          src={`${currentMedia.embedUrl}?${VIDEO_QUERY}`}
          title={productDetails.name}
          loading="eager"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <Image
          src={currentMedia.sourceUrl}
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
  );

  if (!currentMediaIsImage) {
    return viewer;
  }

  return (
    <ProductImageDialog
      productDetails={productDetails}
      mainImageIndex={Math.max(0, mainImageIndex - dialogIndexOffset)}
      setMainImageIndex={setDialogImageIndex}
    >
      {viewer}
    </ProductImageDialog>
  );
}
