"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ProductFAQ } from "@/types/products";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useState } from "react";
import { TypingLoader } from "./typing-dot";

interface ProductFAQProps {
  question: ProductFAQ[];
}

export function ProductFAQSection({ question }: ProductFAQProps) {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  if (!question?.length) return null;

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full space-y-4"
      onValueChange={(value) => {
        if (!value) return;

        setLoadingKey(value);
        setTimeout(() => {
          setLoadingKey(null);
        }, 2000);
      }}
    >
      {question.map((item) => {
        const isLoading = loadingKey === item.question;

        return (
          <AccordionItem
            value={item.question}
            key={item.question}
            className="border rounded-sm px-2"
          >
            <AccordionTrigger className="py-2 flex gap-4 items-center">
              <p className="text-xl text-secondary font-bold">Q</p>
              <p className="text-base">{item.question}</p>
            </AccordionTrigger>

            <AccordionContent>
              <div className="flex gap-4 pt-3">
                <p className="text-xl text-primary font-bold">A</p>

                {isLoading ? (
                  <TypingLoader />
                ) : (
                  <div className="faq-markdown">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {item.answer}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
