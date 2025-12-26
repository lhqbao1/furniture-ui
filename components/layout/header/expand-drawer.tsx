"use client";
import { expandAllCategoriesAtom } from "@/store/categories-drawer";
import { useAtom } from "jotai";
import { AlignJustify } from "lucide-react";
import React from "react";
import { useMediaQuery } from "react-responsive";

const ExpandDrawer = () => {
  const [, setExpandAll] = useAtom(expandAllCategoriesAtom);
  const isMobile = useMediaQuery({ maxWidth: 676 });
  return (
    <AlignJustify
      className="cursor-pointer hover:scale-110 transition-all duration-300"
      stroke="#4D4D4D"
      size={isMobile ? 20 : 30}
      onClick={() => {
        setExpandAll(true);
      }}
    />
  );
};

export default ExpandDrawer;
