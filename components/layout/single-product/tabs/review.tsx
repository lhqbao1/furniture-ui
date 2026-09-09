"use client";
import { Star } from "lucide-react";
import React, { useEffect, useState } from "react";

import ListComments from "./review/list-comments";
import GiveCommentSection from "./review/give-comment-section";
import { useTranslations } from "next-intl";
import { useAtom } from "jotai";
import { reviewRatingFilterAtom } from "@/store/review";

const reviewCount = [
  { title: 5, percent: 70 },
  { title: 4, percent: 18 },
  { title: 3, percent: 10 },
  { title: 2, percent: 0 },
  { title: 1, percent: 2 },
];

interface ProductReviewTabProps {
  productId: string;
}

const ProductReviewTab = ({ productId }: ProductReviewTabProps) => {
  const t = useTranslations();
  const [selectedRate, setSelectedRate] = useAtom(reviewRatingFilterAtom);
  const [showPic] = useState(true);
  const [showComments] = useState(true);

  useEffect(() => {
    setSelectedRate(undefined);
  }, [productId, setSelectedRate]);

  return (
    <div className="space-y-2 md:space-y-4 xl:space-y-6">
      <h3 className="col-span-12 text-primary">{t("review")}</h3>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-12 lg:gap-28">
        {/* LEFT: Reviews */}
        <div className="col-span-1 sm:col-span-12 lg:col-span-7 flex flex-col gap-6">
          <div className="grid gap-4 border-b border-gray-300 pb-4 grid-cols-1 sm:grid-cols-12">
            <div className="flex flex-row justify-between items-center sm:col-span-6">
              <p
                onClick={() => setSelectedRate(undefined)}
                className={`cursor-pointer ${!selectedRate ? "text-primary font-semibold" : ""}`}
              >
                {t("all")}
              </p>
              {[...reviewCount].reverse().map((item, index) => (
                <div key={index} className="flex gap-1 items-center">
                  <p>{item.title}</p>
                  <Star
                    stroke="#f15a24"
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedRate(
                        selectedRate === item.title ? undefined : item.title,
                      )
                    }
                    fill={selectedRate === item.title ? "#f15a24" : "white"}
                  />
                </div>
              ))}
            </div>
          </div>

          <ListComments
            showComments={showComments}
            showPic={showPic}
            productId={productId}
          />
        </div>

        {/* RIGHT: Videos + Write Review */}
        <div className="col-span-1 sm:col-span-12 md:col-span-5 flex flex-col gap-6">
          <GiveCommentSection productId={productId} />
        </div>
      </div>
    </div>
  );
};

export default ProductReviewTab;
