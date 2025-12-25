"use client";

import { useSwipeable } from "react-swipeable";

export function useSwipeImage(
  productDetails: any,
  setMainImageIndex: React.Dispatch<React.SetStateAction<number>>,
  setDirection: React.Dispatch<React.SetStateAction<"left" | "right" | null>>,
) {
  return useSwipeable({
    onSwipedLeft: () => {
      if (!productDetails?.static_files?.length) return;

      setDirection("left");
      setMainImageIndex(
        (prev) => (prev + 1) % productDetails.static_files.length,
      );
    },

    onSwipedRight: () => {
      if (!productDetails?.static_files?.length) return;

      setDirection("right");
      setMainImageIndex((prev) =>
        prev === 0 ? productDetails.static_files.length - 1 : prev - 1,
      );
    },

    trackTouch: true,
  });
}
