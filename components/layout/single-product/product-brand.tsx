"use client";
import { useRouter } from "@/src/i18n/navigation";
import { ProductItem } from "@/types/products";
import { useLocale } from "next-intl";
import Image from "next/image";
import React from "react";

interface ProductBrandProps {
  brand: string;
  brand_image?: string;
  isProductDetail?: boolean;
}

const ProductBrand = ({
  brand,
  brand_image,
  isProductDetail = false,
}: ProductBrandProps) => {
  const router = useRouter();
  const locale = useLocale();
  return (
    <>
      {/* {brand_image && isProductDetail === true ? (
        <Image
          src={brand_image}
          width={50}
          height={50}
          alt=""
          className="h-[40px] w-auto object-cover rounded-sm cursor-pointer hover:scale-105 transition-all duration-300"
          onClick={() => {
            if (!brand) return;

            router.push(
              {
                pathname: "/shop-all",
                query: {
                  brand: brand,
                },
              },
              { locale },
            );
          }}
        />
      ) : (
        <p
          className="uppercase text-xs md:text-sm cursor-pointer text-black/50 font-bold hover:text-secondary"
          onClick={() => {
            if (!brand) return;

            router.push(
              {
                pathname: "/shop-all",
                query: {
                  brand: brand,
                },
              },
              { locale },
            );
          }}
        >
          {brand}
        </p>
      )} */}
      <p
        className="uppercase text-xs md:text-sm cursor-pointer text-black/50 font-bold hover:text-secondary"
        onClick={() => {
          if (!brand) return;

          router.push(
            {
              pathname: "/shop-all",
              query: {
                brand: brand,
              },
            },
            { locale },
          );
        }}
      >
        {brand}
      </p>
    </>
  );
};

export default ProductBrand;
