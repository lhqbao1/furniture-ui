"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetRelatedProducts } from "@/features/related-product/hook";
import { ProductItem } from "@/types/products";
import { Equal, Heart, Plus } from "lucide-react";
import Image from "next/image";
import React from "react";
import FBTSectionSkeleton from "./skeleton/bought-together-skeleton";
import BoughtTogetherAddToCart from "./bought-together-add-to-cart";
import Link from "next/link";
import { useLocale } from "next-intl";

interface BoughtTogetherSectionProps {
  productDetails: ProductItem;
}

const BoughtTogetherSection = ({
  productDetails,
}: BoughtTogetherSectionProps) => {
  const locale = useLocale();
  const {
    data: relatedProducts,
    isLoading,
    isError,
  } = useGetRelatedProducts(productDetails.id);
  if (!relatedProducts || relatedProducts.length === 0 || isError) return;
  if (isLoading) return <FBTSectionSkeleton />;

  return (
    <div className="xl:my-16 lg:my-12 md:my-10 my-6 space-y-6">
      <h3 className="text-2xl text-secondary font-semibold ">
        Frequenly bought togheter
      </h3>
      <div className="flex xl:flex-row flex-col items-center justify-start gap-0">
        <div className="flex flex-col items-center gap-4">
          <Image
            src={
              productDetails.static_files.length > 0
                ? productDetails.static_files[0].url
                : "/placeholder-product.webp"
            }
            alt=""
            width={300}
            height={200}
            className=""
            unoptimized
          />
          <div className="flex flex-col justify-center items-center space-y-1.5">
            <p className="text-center">{productDetails.name}</p>
            <div className="flex items-center gap-2">
              <Label
                htmlFor="terms"
                className="text-primary text-xl font-semibold"
              >
                {productDetails.final_price}€
              </Label>
              <p className="text-xl text-gray-300 line-through font-semibold">
                {productDetails.price}€
              </p>
            </div>
            <BoughtTogetherAddToCart
              productDetails={productDetails}
              product_id={productDetails.id}
              quantity={1}
            />
          </div>
        </div>
        <Plus
          size={100}
          fill="gray"
          className="text-gray-400 2xl:size-24 lg:size-20 size-14"
        />

        {relatedProducts &&
          relatedProducts.length > 0 &&
          relatedProducts.map((item, index) => {
            return (
              <div
                key={item.id}
                className="flex xl:flex-row flex-col items-center"
              >
                <div className="flex flex-col items-center gap-4">
                  <Image
                    src={
                      item.static_files.length > 0
                        ? item.static_files[0].url
                        : "/placeholder-product.webp"
                    }
                    alt=""
                    width={300}
                    height={200}
                    className=""
                    unoptimized
                  />
                  <div className="flex flex-col items-center relative w-full space-y-1.5">
                    <Link href={`/product/${item.url_key}`}>
                      <p className="text-center hover:text-secondary cursor-pointer">
                        {item.name}
                      </p>
                    </Link>
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="terms"
                        className="text-primary text-xl font-semibold"
                      >
                        {item.final_price}€
                      </Label>
                      <p className="text-xl text-gray-300 line-through font-semibold">
                        {item.price}€
                      </p>
                    </div>
                    <BoughtTogetherAddToCart
                      productDetails={item}
                      product_id={item.id}
                      quantity={1}
                    />
                  </div>
                </div>
                {index === relatedProducts.length - 1 ? (
                  ""
                ) : (
                  <Plus
                    size={100}
                    fill="gray"
                    className="text-gray-400 2xl:size-24 lg:size-20 size-14"
                  />
                )}
              </div>
            );
          })}

        {/* <Equal
          size={100}
          fill="gray"
          className="text-gray-400"
        /> */}

        {/* <div className="flex flex-col gap-4 ml-2 flex-1">
          <div className="flex gap-2">
            <p className="text-primary text-3xl font-semibold">€310</p>
            <p className="text-gray-300 line-through text-3xl font-semibold">
              €370
            </p>
          </div>
          <div className="text-gray-500 text-xl font-semibold">
            <p>Item saved €130</p>
            <p>Combo saved €50</p>
            <p>Total saved €180</p>
          </div>
          <Button className="rounded-full px-10 font-bold text-lg basis-2/5 relative">
            Order
            <div className="absolute bg-white rounded-full aspect-square h-full text-gray-500 font-bold flex items-center justify-center border border-primary right-0">
              <Heart />
            </div>
            <div className="absolute bg-white rounded-full aspect-square h-full text-gray-500 font-bold flex items-center justify-center border border-primary left-0">
              <Plus />
            </div>
          </Button>
        </div> */}
      </div>
    </div>
  );
};

export default BoughtTogetherSection;
