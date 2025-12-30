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
import { useRef, useState } from "react";
import { TypingLoader } from "./typing-dot";
import { useTranslations } from "next-intl";
import clsx from "clsx";

interface ProductFAQProps {
  question: ProductFAQ[];
}

const HEADER_OFFSET = 190;

function smoothScrollTo(
  targetY: number,
  duration = 700, // 👈 tăng số này để chậm hơn (ms)
) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  let startTime: number | null = null;

  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function step(timestamp: number) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);

    const eased = easeInOutCubic(progress);
    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

export function ProductFAQSection({ question }: ProductFAQProps) {
  const t = useTranslations();

  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  if (!question?.length) return null;

  const scrollToItem = (key: string) => {
    const el = itemRefs.current[key];
    if (!el) return;

    const targetY =
      el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;

    smoothScrollTo(targetY, 900); // 👈 900ms = chậm & mượt
  };

  return (
    <>
      <div className="text-2xl text-primary font-semibold mb-4">
        {t("checkWithAI")}:{" "}
        <span className="text-3xl text-black font-medium">ChatGPT</span>
      </div>

      <Accordion
        type="multiple"
        value={openKeys}
        onValueChange={() => {
          // ❌ KHÔNG cho radix tự thay đổi state
          // state được điều khiển thủ công ở Trigger
        }}
        className="w-full space-y-4"
      >
        {question.map((item, index) => {
          const isActive = activeKey === item.question;
          const isLoading = loadingKey === item.question;

          return (
            <div
              key={item.question}
              ref={(el) => {
                itemRefs.current[item.question] = el;
              }}
            >
              <AccordionItem
                value={item.question}
                className="border-none"
              >
                <div className="w-2/3 ml-auto">
                  <AccordionTrigger
                    hasIcon={false}
                    onClick={(e) => {
                      e.preventDefault(); // 🚫 chặn toggle mặc định

                      const isOpen = openKeys.includes(item.question);

                      setActiveKey(item.question);

                      // ✅ CHỈ KHI MỞ LẦN ĐẦU
                      if (!isOpen) {
                        setOpenKeys((prev) => [...prev, item.question]);

                        setLoadingKey(item.question);
                        setTimeout(() => {
                          setLoadingKey(null);
                        }, 2000);
                      }

                      // ✅ LUÔN scroll khi click
                      requestAnimationFrame(() => {
                        scrollToItem(item.question);
                      });
                    }}
                    className={clsx(
                      "py-3 px-4 rounded-md border transition-all",
                      "flex gap-4 items-center text-left",
                      activeKey === item.question
                        ? "bg-secondary text-white border-secondary"
                        : "bg-white text-secondary border-secondary",
                    )}
                  >
                    <p className="text-base font-medium">{item.question}</p>
                  </AccordionTrigger>
                </div>

                <AccordionContent className="mt-3">
                  <div className="pl-2">
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
            </div>
          );
        })}
      </Accordion>
    </>
  );
}
