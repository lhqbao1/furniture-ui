"use client";
import ListStars from "@/components/shared/list-stars";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import CommentImageDialog from "./comment-image-dialog";
import { useTranslations } from "next-intl";
import { useGetReviewsByProduct } from "@/features/review/hook";
import { formatDateTime } from "@/lib/date-formated";
import { useAtomValue } from "jotai";
import { reviewRatingFilterAtom } from "@/store/review";

interface ListCommentsProps {
  showComments: boolean;
  showPic: boolean;
  productId: string;
}

const safeFormatDateTime = (value: unknown) => {
  if (!value) return "";
  try {
    return formatDateTime(value as Date);
  } catch {
    return "";
  }
};

const ListComments = ({
  showComments,
  showPic,
  productId,
}: ListCommentsProps) => {
  const t = useTranslations();
  const selectedRate = useAtomValue(reviewRatingFilterAtom);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [expandedIndexes, setExpandedIndexes] = useState<number[]>([]);
  const [showButtonIndexes, setShowButtonIndexes] = useState<number[]>([]);
  const {
    data: listComments,
    isLoading,
  } = useGetReviewsByProduct(productId);
  const safeComments = React.useMemo(
    () => (Array.isArray(listComments) ? listComments : []),
    [listComments],
  );

  const filteredComments = React.useMemo(() => {
    if (!selectedRate) return safeComments;
    return safeComments.filter(
      (comment) => Math.round(Number(comment.rating ?? 0)) === selectedRate,
    );
  }, [safeComments, selectedRate]);

  const toggleExpand = (idx: number) => {
    setExpandedIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  };

  useEffect(() => {
    const nextShowButtonIndexes: number[] = [];

    textRefs.current.forEach((el, idx) => {
      if (el) {
        const lineHeight = Number.parseFloat(getComputedStyle(el).lineHeight);
        if (!Number.isFinite(lineHeight) || lineHeight <= 0) return;
        const lines = el.scrollHeight / lineHeight;
        if (lines > 5) {
          nextShowButtonIndexes.push(idx);
        }
      }
    });

    setShowButtonIndexes(nextShowButtonIndexes);
  }, [filteredComments]);

  if (!filteredComments || filteredComments.length === 0 || isLoading)
    return <div>{t("noComment")}</div>;

  return (
    <div className="pt-0">
      <Collapsible open={showComments}>
        <CollapsibleContent>
          <div className="pt-0">
            {filteredComments.map((item, index) => {
              const fullName = [
                item?.user?.first_name ?? "",
                item?.user?.last_name ?? "",
              ]
                .join(" ")
                .trim();
              const customerName = fullName || item?.customer || "Anonymous";
              const createdAt = safeFormatDateTime(item?.created_at);
              const commentText = item?.comment ?? "";
              const rating = Number(item?.rating ?? 0);
              const imageFiles = Array.isArray(item?.static_files)
                ? item.static_files
                : [];
              const firstReply =
                Array.isArray(item?.replies) && item.replies.length > 0
                  ? item.replies[0]
                  : null;

              return (
                <div
                  key={item?.id ?? index}
                  className="border-b border-gray-300 pt-4 pb-6"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-gray-600 font-bold">
                          {t("customer")}: {customerName}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <p className="text-secondary font-semibold text-sm">
                          {t("purchased")}
                        </p>
                        <p className="text-gray-400 text-sm">{createdAt}</p>
                      </div>
                    </div>
                    <div className="flex flex-row gap-1">
                      <ListStars rating={rating} />
                    </div>
                  </div>

                  <div>
                    <div
                      ref={(el) => {
                        textRefs.current[index] = el;
                      }}
                      className={`mt-2 ${
                        !expandedIndexes.includes(index) ? "line-clamp-5" : ""
                      }`}
                    >
                      {commentText}
                    </div>
                    {showButtonIndexes.includes(index) && (
                      <button
                        className="text-primary mt-1 cursor-pointer font-bold text-sm"
                        onClick={() => toggleExpand(index)}
                      >
                        {expandedIndexes.includes(index)
                          ? "See less"
                          : "Read more"}
                      </button>
                    )}

                    {imageFiles.length > 0 && showPic ? (
                      <CommentImageDialog
                        listComments={filteredComments}
                        comment={item}
                      />
                    ) : (
                      ""
                    )}
                  </div>

                  {firstReply && (
                    <div className="pl-12 pt-2 relative">
                      <div className="flex gap-2 items-center">
                        <p className="text-gray-600 font-bold">
                          {firstReply.comment ?? ""}
                        </p>
                        <div className="flex gap-1 items-center">
                          <Image
                            src={"/logo.svg"}
                            height={30}
                            width={30}
                            alt=""
                            className="size-4"
                            unoptimized
                          />
                        </div>
                      </div>
                      <p>{firstReply.comment ?? ""}</p>
                      <div className="absolute w-6 h-14 left-4  border-l border-b top-0"></div>
                    </div>
                  )}
                </div>
              );
            })}
            {/* <div className="py-6 text-center"> */}
            {/* <Button hasEffect className='rounded-full font-bold'>{t('loadMore')}</Button> */}
            {/* </div> */}
            {/* <CustomPagination /> */}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default ListComments;
