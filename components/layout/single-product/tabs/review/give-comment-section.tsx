"use client";
import React from "react";
import { useTranslations } from "next-intl";
import CommentForm from "./comment-form";
import { useAtom } from "jotai";
import { userIdAtom } from "@/store/auth";

interface GiveCommentSectionProps {
  productId: string;
}

const GiveCommentSection = ({ productId }: GiveCommentSectionProps) => {
  const t = useTranslations();

  const [userId, setUserId] = useAtom(userIdAtom);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-gray-600 text-lg font-bold">{t("writeReview")}</div>

      <CommentForm productId={productId} userId={userId ?? ""} />
    </div>
  );
};

export default GiveCommentSection;
