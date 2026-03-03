"use client";
import { ReviewResponse } from "@/types/review";
import { Star } from "lucide-react";
import React, { useMemo } from "react";

interface ListStarsProps {
  size?: number;
  reviews: ReviewResponse[];
}

const ListStarsReview = ({ size = 20, reviews }: ListStarsProps) => {
  const rating = useMemo(() => {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((total, r) => total + (r.rating || 0), 0);
    return Number((sum / reviews.length).toFixed(1));
  }, [reviews]);

  const getFillPercent = (currentRating: number, index: number) => {
    const fullStars = Math.floor(currentRating);
    if (index < fullStars) return 100;
    if (index > fullStars) return 0;

    const fraction = currentRating - fullStars;
    if (fraction <= 0) return 0;
    if (fraction < 0.3) return 33;
    if (fraction < 0.59) return 66;
    return 80;
  };

  if (rating === 0) return null;

  return (
    <div className="flex items-end gap-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((index) => {
          const fillPercent = getFillPercent(rating, index);

          return (
            <div
              key={index}
              className="relative"
              style={{ width: size, height: size }}
            >
              <Star size={size} fill="#d1d5db" stroke="#d1d5db" />
              <div
                className="absolute left-0 top-0 overflow-hidden"
                style={{ width: `${fillPercent}%`, height: size }}
              >
                <Star size={size} fill="#f15a24" stroke="#f15a24" />
              </div>
            </div>
          );
        })}
      </div>
      <span className="text-sm font-medium text-[#111] leading-4">
        (
        {rating.toLocaleString("de-DE", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })}
        )
      </span>
    </div>
  );
};

export default ListStarsReview;
