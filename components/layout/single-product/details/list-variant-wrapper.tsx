"use client";

import React from "react";
import ListVariant from "../list-variant";
import { VariantOptionsResponse } from "@/types/variant";
import { ProductItem } from "@/types/products";
import { ProductGroupDetailResponse } from "@/types/product-group";

interface ListVariantProps {
  variant: VariantOptionsResponse[];
  currentProduct: ProductItem;
  parentProduct: ProductGroupDetailResponse;
}

export default function VariantClientWrapper(props: ListVariantProps) {
  return <ListVariant {...props} />;
}
