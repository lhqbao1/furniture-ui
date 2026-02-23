"use client";
import { expandAllCategoriesAtom } from "@/store/categories-drawer";
import { useAtom } from "jotai";
import { AlignJustify } from "lucide-react";
import React from "react";

const ExpandDrawer = () => {
  const [, setExpandAll] = useAtom(expandAllCategoriesAtom);
  return (
    <button
      type="button"
      aria-label="Open categories"
      onClick={() => {
        setExpandAll(true);
      }}
      className="cursor-pointer"
    >
      <AlignJustify
        className="hover:scale-110 transition-all duration-300 w-[20px] h-[20px] md:w-[30px] md:h-[30px]"
        stroke="#4D4D4D"
      />
    </button>
  );
};

export default ExpandDrawer;
