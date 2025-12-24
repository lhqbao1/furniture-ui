"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import React from "react";

interface ShowAllBlogButtonProps {
  slug: string;
}

const ShowAllBlogButton = ({ slug }: ShowAllBlogButtonProps) => {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  return (
    <Button
      variant={"secondary"}
      onClick={() => router.push(`/blog/category/${slug}`, { locale })}
      className="lg:mt-10 mt-6 px-6 rounded-4xl"
    >
      {t("viewAll")}
    </Button>
  );
};

export default ShowAllBlogButton;
