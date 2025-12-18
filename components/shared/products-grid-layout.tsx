"use client";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ProductItem } from "@/types/products";
import { useMediaQuery } from "react-responsive";
import { useAddViewedProduct } from "@/features/viewed/hook";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/src/i18n/navigation";
import { Heart, ShoppingBasket, Star } from "lucide-react";
import { Button } from "../ui/button";
import { useAddToCart } from "@/features/cart/hook";
import { useAddToWishList } from "@/features/wishlist/hook";
import { useCartLocal } from "@/hooks/cart";
import { toast } from "sonner";
import { HandleApiError } from "@/lib/api-helper";
import { CartItemLocal } from "@/lib/utils/cart";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { userIdAtom } from "@/store/auth";
import ProductCard from "./product-grid-card";

interface ProductsGridLayoutProps {
  hasBadge?: boolean;
  hasPagination?: boolean;
  data: ProductItem[];
}

const ProductsGridLayout = ({
  hasBadge,
  hasPagination = false,
  data,
}: ProductsGridLayoutProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 sm:gap-0 sm:mt-6 mt-4">
      {data
        // .filter((p) => p.stock > 0)
        .map((product, idx) => {
          return (
            <ProductCard
              idx={idx}
              product={product}
              key={product.id}
            />
          );
        })}
    </div>
  );
};

export default ProductsGridLayout;
