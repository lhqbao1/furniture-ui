"use client";
import { expandAllCategoriesAtom } from "@/store/categories-drawer";
import { useAtom } from "jotai";
import { AlignJustify } from "lucide-react";
import React from "react";

const ExpandDrawer = () => {
  const [, setExpandAll] = useAtom(expandAllCategoriesAtom);
  return (
    <AlignJustify
      className="cursor-pointer hover:scale-110 transition-all duration-300 w-[20px] h-[20px] md:w-[30px] md:h-[30px]"
      stroke="#4D4D4D"
      onClick={() => {
        setExpandAll(true);
      }}
    />
  );
};

export default ExpandDrawer;
