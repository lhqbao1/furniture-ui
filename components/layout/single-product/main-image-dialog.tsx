"use client";

import React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProductItem } from "@/types/products";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useSwipeable } from "react-swipeable";

interface ProductImageDialogProps {
  productDetails: ProductItem;
  children: React.ReactNode;
  mainImageIndex: number;
  setMainImageIndex: React.Dispatch<React.SetStateAction<number>>;
}

export default function ProductImageDialog({
  productDetails,
  children,
  mainImageIndex,
  setMainImageIndex,
}: ProductImageDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [zoom, setZoom] = React.useState(false);
  const [zoomPosition, setZoomPosition] = React.useState({ x: 50, y: 50 });
  const imageContainerRef = React.useRef<HTMLDivElement>(null);
  const preloadedUrlsRef = React.useRef<Set<string>>(new Set());

  const mobileContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mobileAnimationTimeoutRef = React.useRef<number | null>(null);
  const [mobileDragOffset, setMobileDragOffset] = React.useState(0);
  const [mobileIsAnimating, setMobileIsAnimating] = React.useState(false);
  const [mobileContainerWidth, setMobileContainerWidth] = React.useState(1);
  const [mobileDisplayIndex, setMobileDisplayIndex] =
    React.useState(mainImageIndex);
  const [mobileZoomScale, setMobileZoomScale] = React.useState(1);
  const [mobileZoomOrigin, setMobileZoomOrigin] = React.useState({
    x: 50,
    y: 50,
  });
  const [mobilePanOffset, setMobilePanOffset] = React.useState({ x: 0, y: 0 });
  const pinchStartDistanceRef = React.useRef<number | null>(null);
  const pinchStartScaleRef = React.useRef(1);
  const isPinchingRef = React.useRef(false);
  const isPanningRef = React.useRef(false);
  const panStartPointRef = React.useRef({ x: 0, y: 0 });
  const panStartOffsetRef = React.useRef({ x: 0, y: 0 });

  const imageCount = productDetails.static_files?.length ?? 0;
  const canNavigate = imageCount > 1;
  const MOBILE_SLIDE_DURATION = 210;
  const MOBILE_REBOUND_DURATION = 180;
  const MOBILE_SNAP_RATIO = 0.3;
  const MOBILE_FLICK_VELOCITY_THRESHOLD = 0.45;
  const MOBILE_SLIDE_EASING = "cubic-bezier(0.22, 0.88, 0.26, 1)";

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
      if (imageCount <= 0) return "/2.png";
      return productDetails.static_files[index]?.url ?? "/2.png";
    },
    [imageCount, productDetails.static_files],
  );

  const preloadImageUrl = React.useCallback((url: string | null | undefined) => {
    if (typeof window === "undefined") return;
    if (!url || url === "/2.png") return;
    if (preloadedUrlsRef.current.has(url)) return;

    preloadedUrlsRef.current.add(url);
    const img = new window.Image();
    img.src = url;
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;
    setMobileDisplayIndex(mainImageIndex);
    setMobileZoomScale(1);
    setMobilePanOffset({ x: 0, y: 0 });
    setMobileZoomOrigin({ x: 50, y: 50 });
  }, [isOpen, mainImageIndex]);

  React.useEffect(() => {
    if (mobileIsAnimating) return;
    setMobileDisplayIndex(mainImageIndex);
  }, [mainImageIndex, mobileIsAnimating]);

  React.useEffect(() => {
    if (!isOpen) return;

    let frameId: number | null = null;
    const updateWidth = () => {
      const elementWidth = mobileContainerRef.current?.clientWidth ?? 0;
      const viewportWidth =
        typeof window !== "undefined" ? window.innerWidth : 0;
      const nextWidth = elementWidth || viewportWidth || 1;
      setMobileContainerWidth(nextWidth > 0 ? nextWidth : 1);
    };

    frameId = window.requestAnimationFrame(updateWidth);

    if (!mobileContainerRef.current || typeof ResizeObserver === "undefined") {
      return () => {
        if (frameId) window.cancelAnimationFrame(frameId);
      };
    }

    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(mobileContainerRef.current);
    window.addEventListener("resize", updateWidth);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateWidth);
    };
  }, [isOpen]);

  React.useEffect(() => {
    return () => {
      if (mobileAnimationTimeoutRef.current) {
        window.clearTimeout(mobileAnimationTimeoutRef.current);
      }
    };
  }, []);

  const resetMobileAnimation = React.useCallback(() => {
    setMobileIsAnimating(false);
    setMobileDragOffset(0);
  }, []);

  const scheduleMobileAnimation = React.useCallback(
    (callback: () => void, delay = MOBILE_SLIDE_DURATION) => {
      if (mobileAnimationTimeoutRef.current) {
        window.clearTimeout(mobileAnimationTimeoutRef.current);
      }
      mobileAnimationTimeoutRef.current = window.setTimeout(() => {
        callback();
        resetMobileAnimation();
      }, delay);
    },
    [MOBILE_SLIDE_DURATION, resetMobileAnimation],
  );

  const animateMobileSlide = React.useCallback(
    (direction: "next" | "prev") => {
      if (!canNavigate || mobileIsAnimating || mobileZoomScale > 1.01) return;

      setMobileIsAnimating(true);
      setMobileDragOffset(
        direction === "next" ? -mobileContainerWidth : mobileContainerWidth,
      );

      scheduleMobileAnimation(() => {
        setMobileDisplayIndex((prev) => {
          const next = direction === "next" ? nextIndex(prev) : prevIndex(prev);
          setMainImageIndex(next);
          setMobileZoomScale(1);
          setMobilePanOffset({ x: 0, y: 0 });
          setMobileZoomOrigin({ x: 50, y: 50 });
          return next;
        });
      }, MOBILE_SLIDE_DURATION);
    },
    [
      canNavigate,
      MOBILE_SLIDE_DURATION,
      mobileContainerWidth,
      mobileIsAnimating,
      mobileZoomScale,
      nextIndex,
      prevIndex,
      scheduleMobileAnimation,
      setMainImageIndex,
    ],
  );

  const mobileSwipeHandlers = useSwipeable({
    trackTouch: true,
    preventScrollOnSwipe: false,
    delta: 8,
    onSwiping: ({ deltaX }) => {
      if (
        !canNavigate ||
        mobileIsAnimating ||
        isPinchingRef.current ||
        mobileZoomScale > 1.01
      ) {
        return;
      }

      const nextOffset = Math.max(
        -mobileContainerWidth,
        Math.min(mobileContainerWidth, deltaX),
      );
      setMobileDragOffset(nextOffset);
    },
    onSwiped: ({ deltaX, absX = 0, velocity = 0 }) => {
      if (
        !canNavigate ||
        mobileIsAnimating ||
        isPinchingRef.current ||
        mobileZoomScale > 1.01
      ) {
        return;
      }

      const finalOffset = Math.max(
        -mobileContainerWidth,
        Math.min(mobileContainerWidth, deltaX),
      );
      const absOffset = Math.max(Math.abs(finalOffset), absX);
      const threshold = mobileContainerWidth * MOBILE_SNAP_RATIO;
      const direction =
        finalOffset < 0 ? "next" : finalOffset > 0 ? "prev" : null;
      const isFlick = Math.abs(velocity) >= MOBILE_FLICK_VELOCITY_THRESHOLD;
      const shouldNavigate = Boolean(direction) && (absOffset >= threshold || isFlick);

      if (!shouldNavigate) {
        setMobileIsAnimating(true);
        setMobileDragOffset(0);
        scheduleMobileAnimation(() => undefined, MOBILE_REBOUND_DURATION);
        return;
      }
      animateMobileSlide(direction);
    },
  });

  const getTouchDistance = React.useCallback(
    (touches: React.TouchList) => {
      if (touches.length < 2) return 0;
      const touchA = touches[0];
      const touchB = touches[1];
      return Math.hypot(
        touchB.clientX - touchA.clientX,
        touchB.clientY - touchA.clientY,
      );
    },
    [],
  );

  const clampPanOffset = React.useCallback(
    (offset: { x: number; y: number }, scale: number) => {
      if (scale <= 1.01) return { x: 0, y: 0 };
      const maxX = (mobileContainerWidth * (scale - 1)) / 2;
      const maxY = ((mobileContainerRef.current?.clientHeight ?? 0) * (scale - 1)) / 2;
      return {
        x: Math.max(-maxX, Math.min(maxX, offset.x)),
        y: Math.max(-maxY, Math.min(maxY, offset.y)),
      };
    },
    [mobileContainerWidth],
  );

  const handleMobileTouchStart = React.useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (event.touches.length === 2) {
        isPinchingRef.current = true;
        isPanningRef.current = false;
        pinchStartDistanceRef.current = getTouchDistance(event.touches);
        pinchStartScaleRef.current = mobileZoomScale;
        setMobileDragOffset(0);

        const rect = mobileContainerRef.current?.getBoundingClientRect();
        if (rect) {
          const centerX =
            (event.touches[0].clientX + event.touches[1].clientX) / 2;
          const centerY =
            (event.touches[0].clientY + event.touches[1].clientY) / 2;
          setMobileZoomOrigin({
            x: ((centerX - rect.left) / rect.width) * 100,
            y: ((centerY - rect.top) / rect.height) * 100,
          });
        }
        return;
      }

      if (event.touches.length === 1 && mobileZoomScale > 1.01) {
        isPanningRef.current = true;
        const touch = event.touches[0];
        panStartPointRef.current = { x: touch.clientX, y: touch.clientY };
        panStartOffsetRef.current = { ...mobilePanOffset };
      }
    },
    [getTouchDistance, mobilePanOffset, mobileZoomScale],
  );

  const handleMobileTouchMove = React.useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (isPinchingRef.current && event.touches.length === 2) {
        const startDistance = pinchStartDistanceRef.current;
        if (!startDistance || startDistance <= 0) return;

        event.preventDefault();

        const nextDistance = getTouchDistance(event.touches);
        const scale = pinchStartScaleRef.current * (nextDistance / startDistance);
        const clampedScale = Math.min(4, Math.max(1, scale));
        setMobileZoomScale(clampedScale);
        setMobilePanOffset((prev) => clampPanOffset(prev, clampedScale));
        return;
      }

      if (
        isPanningRef.current &&
        event.touches.length === 1 &&
        mobileZoomScale > 1.01
      ) {
        event.preventDefault();
        const touch = event.touches[0];
        const deltaX = touch.clientX - panStartPointRef.current.x;
        const deltaY = touch.clientY - panStartPointRef.current.y;
        const nextOffset = {
          x: panStartOffsetRef.current.x + deltaX,
          y: panStartOffsetRef.current.y + deltaY,
        };
        setMobilePanOffset(clampPanOffset(nextOffset, mobileZoomScale));
      }
    },
    [clampPanOffset, getTouchDistance, mobileZoomScale],
  );

  const handleMobileTouchEnd = React.useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (event.touches.length === 2) return;

      if (isPinchingRef.current && event.touches.length === 1) {
        isPinchingRef.current = false;
        pinchStartDistanceRef.current = null;
        isPanningRef.current = mobileZoomScale > 1.01;
        const touch = event.touches[0];
        panStartPointRef.current = { x: touch.clientX, y: touch.clientY };
        panStartOffsetRef.current = { ...mobilePanOffset };
        return;
      }

      isPinchingRef.current = false;
      pinchStartDistanceRef.current = null;
      isPanningRef.current = false;

      if (mobileZoomScale < 1.02) {
        setMobileZoomScale(1);
        setMobilePanOffset({ x: 0, y: 0 });
      }
    },
    [mobilePanOffset, mobileZoomScale],
  );

  const handleZoomImage = (e: React.MouseEvent) => {
    if (!zoom) {
      const rect = imageContainerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPosition({ x, y });
      }
    }
    setZoom(!zoom);
  };

  const mobilePrevIndex = prevIndex(mobileDisplayIndex);
  const mobileNextIndex = nextIndex(mobileDisplayIndex);
  const mobilePrevImage = getImageUrl(mobilePrevIndex);
  const mobileCurrentImage = getImageUrl(mobileDisplayIndex);
  const mobileNextImage = getImageUrl(mobileNextIndex);

  const mobileTrackTranslateX = -mobileContainerWidth + mobileDragOffset;

  const mobileSlideTransition = mobileIsAnimating
    ? `transform ${MOBILE_SLIDE_DURATION}ms ${MOBILE_SLIDE_EASING}`
    : "none";

  React.useEffect(() => {
    if (!isOpen || imageCount <= 0) return;

    const next = nextIndex(mobileDisplayIndex);
    const prev = prevIndex(mobileDisplayIndex);
    const next2 = nextIndex(next);
    const prev2 = prevIndex(prev);

    preloadImageUrl(getImageUrl(mobileDisplayIndex));
    preloadImageUrl(getImageUrl(next));
    preloadImageUrl(getImageUrl(prev));
    preloadImageUrl(getImageUrl(next2));
    preloadImageUrl(getImageUrl(prev2));
  }, [
    isOpen,
    imageCount,
    mobileDisplayIndex,
    nextIndex,
    prevIndex,
    getImageUrl,
    preloadImageUrl,
  ]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        overlayClassName="!z-[2147483646]"
        showCloseButton={false}
        className="!z-[2147483647] !left-0 !top-0 !translate-x-0 !translate-y-0 h-screen w-screen max-w-none rounded-none border-none bg-black p-0 lg:!left-[50%] lg:!top-[50%] lg:!translate-x-[-50%] lg:!translate-y-[-50%] lg:h-[90vh] lg:w-[calc(100%-8rem)] lg:rounded-lg lg:border lg:bg-background lg:p-6"
        aria-describedby=""
      >
        <DialogTitle className="hidden">Product Image Viewer</DialogTitle>

        <DialogClose className="absolute top-4 right-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-black/30 text-white lg:hidden">
          <X size={20} />
          <span className="sr-only">Close</span>
        </DialogClose>

        <DialogClose className="absolute top-4 right-4 z-50 hidden h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-white text-black hover:bg-gray-100 lg:inline-flex">
          <X size={18} />
          <span className="sr-only">Close</span>
        </DialogClose>

        {/* Mobile viewer */}
        <div className="relative flex h-full w-full items-center justify-center bg-black lg:hidden">
          <div
            ref={mobileContainerRef}
            className="relative h-[50vh] w-full overflow-hidden bg-white"
            style={{ touchAction: "none" }}
            {...mobileSwipeHandlers}
            onTouchStart={handleMobileTouchStart}
            onTouchMove={handleMobileTouchMove}
            onTouchEnd={handleMobileTouchEnd}
            onTouchCancel={handleMobileTouchEnd}
          >
            <div
              className="absolute inset-0 flex"
              style={{
                width: `${mobileContainerWidth * 3}px`,
                transform: `translate3d(${mobileTrackTranslateX}px, 0, 0)`,
                transition: mobileSlideTransition,
              }}
            >
              <div
                className="relative h-full flex-shrink-0 bg-white"
                style={{ width: `${mobileContainerWidth}px` }}
              >
                {mobilePrevImage ? (
                  <Image
                    src={mobilePrevImage}
                    alt={productDetails.name}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    loading="eager"
                    unoptimized
                  />
                ) : null}
              </div>
              <div
                className="relative h-full flex-shrink-0 bg-white"
                style={{ width: `${mobileContainerWidth}px` }}
              >
                <Image
                  src={mobileCurrentImage}
                  alt={productDetails.name}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority={isOpen}
                  loading="eager"
                  unoptimized
                  style={{
                    transform: `translate3d(${mobilePanOffset.x}px, ${mobilePanOffset.y}px, 0) scale(${mobileZoomScale})`,
                    transformOrigin: `${mobileZoomOrigin.x}% ${mobileZoomOrigin.y}%`,
                  }}
                />
              </div>
              <div
                className="relative h-full flex-shrink-0 bg-white"
                style={{ width: `${mobileContainerWidth}px` }}
              >
                {mobileNextImage ? (
                  <Image
                    src={mobileNextImage}
                    alt={productDetails.name}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    loading="eager"
                    unoptimized
                  />
                ) : null}
              </div>
            </div>

            {canNavigate && (
              <>
                <button
                  type="button"
                  className="absolute left-3 top-1/2 z-40 -translate-y-1/2 rounded-full border border-white/70 bg-black/35 p-2 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    animateMobileSlide("prev");
                  }}
                  aria-label="Previous image"
                >
                  <ChevronLeft />
                </button>
                <button
                  type="button"
                  className="absolute right-3 top-1/2 z-40 -translate-y-1/2 rounded-full border border-white/70 bg-black/35 p-2 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    animateMobileSlide("next");
                  }}
                  aria-label="Next image"
                >
                  <ChevronRight />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Desktop viewer */}
        <div className="hidden h-full grid-cols-12 gap-6 lg:grid">
          {/* Main image */}
          <div
            ref={imageContainerRef}
            className="col-span-12 lg:col-span-8 flex items-center justify-center lg:max-h-[85vh] max-h-[40vh] relative overflow-hidden cursor-zoom-in bg-white"
            onClick={handleZoomImage}
          >
            <Image
              src={
                imageCount > 0 ? getImageUrl(mainImageIndex) : "/2.png"
              }
              alt={productDetails.name}
              width={800}
              height={800}
              className={`object-contain h-full w-full transition-transform duration-300 ${
                zoom ? "scale-200 cursor-zoom-out" : "scale-100"
              }`}
              style={
                zoom
                  ? {
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }
                  : undefined
              }
              unoptimized
            />

            {/* Next / Prev buttons */}
            <div
              className="absolute right-2 top-1/2 rounded-full border border-secondary p-2 cursor-pointer hover:bg-secondary hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                if (!canNavigate) return;
                setMainImageIndex((prev) => nextIndex(prev));
              }}
            >
              <ChevronRight />
            </div>
            <div
              className="absolute left-2 top-1/2 rounded-full border border-secondary p-2 cursor-pointer hover:bg-secondary hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                if (!canNavigate) return;
                setMainImageIndex((prev) => prevIndex(prev));
              }}
            >
              <ChevronLeft />
            </div>
          </div>

          {/* Thumbnails */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-y-auto pr-2 lg:max-h-[80vh] max-h-[55vh]">
            <h2 className="text-2xl font-semibold">{productDetails.name}</h2>

            <div className="grid grid-cols-4 gap-2">
              {productDetails.static_files.map((file, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setMainImageIndex(idx);
                    setZoom(false);
                  }}
                  className={`border-2 rounded-md p-2 overflow-hidden ${
                    mainImageIndex === idx
                      ? "border-primary"
                      : "border-gray-200"
                  }`}
                >
                  <Image
                    src={file.url}
                    alt={`Thumbnail ${idx}`}
                    width={120}
                    height={120}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
