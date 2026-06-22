import { useState } from "react";
import Image from "next/image";
import { PlayCircle } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ProductItem } from "@/types/products";
import type { CarouselApi } from "@/components/ui/carousel";
import { buildProductMediaItems } from "./image/product-media-utils";

interface ProductImageCarouselProps {
  productDetails: ProductItem;
  mainImageIndex: number;
  setMainImageIndex: React.Dispatch<React.SetStateAction<number>>;
}

export function ProductImageCarousel({
  productDetails,
  mainImageIndex,
  setMainImageIndex,
}: ProductImageCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const mediaItems = buildProductMediaItems(productDetails);

  const handleSelectImage = (index: number) => {
    setMainImageIndex(index);
    if (api) api.scrollTo(index); // 👈 scroll đến item vừa click
  };

  return (
    <div className="flex w-full flex-row px-4 sm:px-8 lg:px-12">
      <Carousel
        opts={{ loop: true, align: "start" }}
        setApi={setApi} // 👈 lấy api khi mount
      >
        <CarouselContent className="w-full flex">
          {mediaItems.map((item, index) => (
            <CarouselItem
              key={item.key}
              className="lg:basis-1/4 basis-1/3 3xl:basis-1/5"
            >
              <div
                className={`cursor-pointer overflow-hidden rounded-md ${
                  mainImageIndex === index
                    ? "border-2 border-primary lg:p-2 p-0.5"
                    : ""
                }`}
                onClick={() => handleSelectImage(index)}
              >
                {item.type === "image" ? (
                  <Image
                    src={item.sourceUrl}
                    width={100}
                    height={100}
                    alt=""
                    className="lg:h-[100px] h-[80px] object-cover rounded-md"
                    priority={index < 2}
                    loading={index < 2 ? "eager" : "lazy"}
                  />
                ) : (
                  <div className="lg:h-[100px] h-[80px] rounded-md bg-black text-white flex items-center justify-center gap-2">
                    <PlayCircle className="h-5 w-5 text-white" />
                    <span className="text-xs font-semibold uppercase tracking-wide">
                      Video
                    </span>
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="text-primary border-primary" />
        <CarouselNext className="text-primary border-primary" />
      </Carousel>
    </div>
  );
}
