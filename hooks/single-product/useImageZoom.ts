// hooks/useImageZoom.ts
"use client";

import { useState } from "react";

export function useImageZoom() {
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHover, setIsHover] = useState(false);

  const handleZoomImage = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();

    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;

    setPosition({ x, y });
  };

  return {
    mainImageIndex,
    setMainImageIndex,
    position,
    isHover,
    setIsHover,
    handleZoomImage,
  };
}
