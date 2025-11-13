// hooks/useSwipeImage.ts
"use client";

import { useSwipeable } from "react-swipeable";

export function useSwipeImage(productDetails: any, setMainImageIndex: any) {
  return useSwipeable({
    onSwipedLeft: () => {
      if (!productDetails?.static_files?.length) return;
      setMainImageIndex(
        (prev: number) => (prev + 1) % productDetails.static_files.length
      );
    },
    onSwipedRight: () => {
      if (!productDetails?.static_files?.length) return;
      setMainImageIndex((prev: number) =>
        prev === 0 ? productDetails.static_files.length - 1 : prev - 1
      );
    },
    trackTouch: true,
  });
}
