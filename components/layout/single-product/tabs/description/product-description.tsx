"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ProductFAQSection } from "./faq-accordion";
import { ProductFAQ } from "@/types/products";
import { sanitizeBodyHtml } from "@/lib/sanitize-body-html";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ProductDescriptionProps {
  description: string;
  productId: string;
  question: ProductFAQ[];
}

type DescriptionImage = {
  src: string;
  alt: string;
};

const IMAGE_TAG_REGEX = /<img\b[^>]*>/gi;
const SRC_REGEX = /\bsrc=(["'])(.*?)\1/i;
const ALT_REGEX = /\balt=(["'])(.*?)\1/i;
const CLASS_REGEX = /\bclass=(["'])(.*?)\1/i;
const LIGHTBOX_IMAGE_CLASS =
  "cursor-zoom-in rounded-xl transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2";

const getAttributeValue = (tag: string, regex: RegExp) => {
  const match = tag.match(regex);
  return match?.[2]?.trim() ?? "";
};

const enhanceDescriptionImages = (html: string) => {
  const images: DescriptionImage[] = [];
  const enhancedHtml = html.replace(IMAGE_TAG_REGEX, (tag) => {
    const src = getAttributeValue(tag, SRC_REGEX);
    if (!src) return tag;

    const alt = getAttributeValue(tag, ALT_REGEX);
    const imageIndex = images.length;
    images.push({
      src,
      alt: alt || `Description image ${imageIndex + 1}`,
    });

    const tagWithoutEnd = tag.replace(/\s*\/?>$/, "");
    const tagWithClass = CLASS_REGEX.test(tagWithoutEnd)
      ? tagWithoutEnd.replace(
          CLASS_REGEX,
          (_match, quote: string, className: string) =>
            `class=${quote}${className} ${LIGHTBOX_IMAGE_CLASS}${quote}`,
        )
      : `${tagWithoutEnd} class="${LIGHTBOX_IMAGE_CLASS}"`;

    return (
      `${tagWithClass} data-description-image-index="${imageIndex}" ` +
      `role="button" tabindex="0" aria-label="Open description image ${
        imageIndex + 1
      }" />`
    );
  });

  return { enhancedHtml, images };
};

const ProductDescription = ({
  description,
  question,
}: ProductDescriptionProps) => {
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const { enhancedHtml, images } = useMemo(
    () => enhanceDescriptionImages(sanitizeBodyHtml(description ?? "")),
    [description],
  );

  const activeImage =
    activeImageIndex !== null ? images[activeImageIndex] : undefined;
  const hasMultipleImages = images.length > 1;

  const openImage = (index: number) => {
    if (!images[index]) return;
    setActiveImageIndex(index);
  };

  const showPreviousImage = () => {
    if (!hasMultipleImages) return;
    setActiveImageIndex((current) => {
      const currentIndex = current ?? 0;
      return (currentIndex - 1 + images.length) % images.length;
    });
  };

  const showNextImage = () => {
    if (!hasMultipleImages) return;
    setActiveImageIndex((current) => {
      const currentIndex = current ?? 0;
      return (currentIndex + 1) % images.length;
    });
  };

  const getDescriptionImageIndex = (target: EventTarget | null) => {
    if (!(target instanceof HTMLElement)) return null;

    const image = target.closest<HTMLImageElement>(
      "img[data-description-image-index]",
    );
    const rawIndex = image?.dataset.descriptionImageIndex;
    if (!rawIndex) return null;

    const index = Number(rawIndex);
    return Number.isInteger(index) ? index : null;
  };

  const handleDescriptionClick = (
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    const imageIndex = getDescriptionImageIndex(event.target);
    if (imageIndex === null) return;

    openImage(imageIndex);
  };

  const handleDescriptionKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    const imageIndex = getDescriptionImageIndex(event.target);
    if (imageIndex === null) return;

    event.preventDefault();
    openImage(imageIndex);
  };

  return (
    <>
      <div className="w-full grid grid-cols-12 gap-8">
        <div
          className="product-descriptions font-sans col-span-12 xl:col-span-7"
          onClick={handleDescriptionClick}
          onKeyDown={handleDescriptionKeyDown}
          dangerouslySetInnerHTML={{
            __html: enhancedHtml,
          }}
        />

        <div className="xl:col-span-5 col-span-12">
          <ProductFAQSection question={question} />
        </div>
      </div>

      <Dialog
        open={activeImageIndex !== null}
        onOpenChange={(open) => {
          if (!open) setActiveImageIndex(null);
        }}
      >
        <DialogContent
          className="w-[90vw] max-w-[90vw] overflow-hidden border-slate-200 bg-white p-0 shadow-2xl sm:rounded-3xl"
          overlayClassName="bg-black/50"
          showCloseButton={false}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") showPreviousImage();
            if (event.key === "ArrowRight") showNextImage();
          }}
        >
          <DialogTitle className="sr-only">
            Product Description Image Viewer
          </DialogTitle>

          {activeImage ? (
            <div className="flex h-[94vh] max-h-[94vh] flex-col overflow-hidden rounded-3xl bg-white">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 text-slate-950 sm:px-5">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {activeImage.alt}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">
                    {activeImageIndex !== null ? activeImageIndex + 1 : 1} /{" "}
                    {images.length}
                  </div>
                </div>

                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Close image viewer"
                    className="size-9 rounded-lg border-slate-200 bg-white text-black shadow-sm hover:bg-slate-50 hover:text-black focus-visible:ring-secondary"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </Button>
                </DialogClose>
              </div>

              <div className="relative flex min-h-0 flex-1 items-center justify-center bg-white p-1 sm:p-2">
                {hasMultipleImages ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Show previous description image"
                    className={cn(
                      "absolute left-3 top-1/2 z-10 size-10 -translate-y-1/2 rounded-full border-slate-200 bg-white text-black shadow-lg",
                      "hover:bg-slate-50 hover:text-black focus-visible:ring-secondary",
                    )}
                    onClick={showPreviousImage}
                  >
                    <ChevronLeft className="size-5" aria-hidden="true" />
                  </Button>
                ) : null}

                <Image
                  src={activeImage.src}
                  alt={activeImage.alt}
                  width={1200}
                  height={900}
                  unoptimized
                  className="h-full max-h-full w-full max-w-full rounded-2xl object-contain shadow-2xl"
                  loading="lazy"
                />

                {hasMultipleImages ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Show next description image"
                    className={cn(
                      "absolute right-3 top-1/2 z-10 size-10 -translate-y-1/2 rounded-full border-slate-200 bg-white text-black shadow-lg",
                      "hover:bg-slate-50 hover:text-black focus-visible:ring-secondary",
                    )}
                    onClick={showNextImage}
                  >
                    <ChevronRight className="size-5" aria-hidden="true" />
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductDescription;
