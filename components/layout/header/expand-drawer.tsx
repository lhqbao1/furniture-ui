"use client";
import { expandAllCategoriesAtom } from "@/store/categories-drawer";
import { useAtom } from "jotai";
import { AlignJustify } from "lucide-react";
import React from "react";

const ExpandDrawer = () => {
  const [, setExpandAll] = useAtom(expandAllCategoriesAtom);

  return (
    <AlignJustify
      className="cursor-pointer hover:scale-110 transition-all duration-300"
      stroke="#4D4D4D"
      size={20}
      onClick={() => {
        setExpandAll(true);
      }}
    />
  );
};

export default ExpandDrawer;
