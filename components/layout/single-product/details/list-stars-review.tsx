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

  if (rating === 0) return;

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((item, index) => {
        return (
          <div key={item}>
            <Star
              size={size}
              fill={item <= rating ? "#f15a24" : "white"}
              stroke={item <= rating ? "#f15a24" : "white"}
            />
          </div>
        );
      })}
    </div>
  );
};

export default ListStarsReview;
