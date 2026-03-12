"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductItem } from "@/types/products";
import { useTranslations } from "next-intl";
import ProductDetailsProperties from "./tabs/properties/page";
import { ReviewResponse } from "@/types/review";
import UserManualTab from "./tabs/user-manual/user-manual-tab";
import ProductDescription from "./tabs/description/product-description";
import QAInput from "./tabs/q&a/q&a-input";

interface ProductDetailsTabProps {
  product: ProductItem;
  reviews: ReviewResponse[];
}

export function ProductDetailsTab({
  product,
  reviews,
}: ProductDetailsTabProps) {
  const [isMobile, setIsMobile] = React.useState(false);
  const t = useTranslations();

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  const sections = [
    {
      value: "description",
      label: t("description"),
      content: (
        <ProductDescription
          description={product.description}
          productId={product.id}
          question={product.faqs}
        />
      ),
    },
    {
      value: "properties",
      label: t("properties"),
      content: <ProductDetailsProperties product={product} />,
    },
    {
      value: "details",
      label: "Aufbau & Details",
      content: <UserManualTab files={product.pdf_files} />,
    },
    // {
    //   value: "review",
    //   label: t("review"),
    //   content: <ProductReviewTab productId={product.id} />,
    // },
    {
      value: "q&a",
      label: "Häufig gestellte Fragen",
      content: (
        <div className="space-y-6 w-full md:w-2/3 xl:w-1/2">
          <QAInput productId={product.id} />
        </div>
      ),
    },
  ];

  if (isMobile) {
    // render accordion
    return (
      <Accordion
        type="multiple"
        className="space-y-2"
        defaultValue={["description", "details"]}
      >
        {sections.map((section) => (
          <AccordionItem value={section.value} key={section.value}>
            <AccordionTrigger className="text-secondary text-base">
              {section.label}
            </AccordionTrigger>
            <AccordionContent>{section.content}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    );
  }

  // render tabs
  return (
    <Tabs defaultValue="description">
      <TabsList className="flex flex-row lg:gap-12 gap-8">
        {sections.map((section) => (
          <TabsTrigger
            key={section.value}
            value={section.value}
            className="text-xl text-gray-600 font-bold w-fit"
          >
            {section.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {sections.map((section) => (
        <TabsContent key={section.value} value={section.value}>
          <div className="col-span-3">{section.content}</div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
