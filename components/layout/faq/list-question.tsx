import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ } from "@/types/faq";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";

interface ListFAQQuestionProps {
  question?: FAQ[];
}

export function ListFAQQuestion({ question }: ListFAQQuestionProps) {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full space-y-4"
      defaultValue="item-1"
    >
      {question?.map((item, index) => {
        return (
          <AccordionItem
            value={item.question}
            key={item.id}
            className="border rounded-sm px-2"
          >
            <AccordionTrigger className="py-2 flex flex-row gap-4 justify-start items-center">
              <p className="text-xl text-secondary font-bold">Q</p>
              <p className="text-base">{item.question}</p>
            </AccordionTrigger>
            <AccordionContent className="">
              <div className="flex gap-4 justify-start items-start pt-3">
                <p className="text-xl text-primary font-bold">A</p>
                <p className="text-[#666666]">{item.answer}</p>
              </div>
              {/* <div className="flex justify-end gap-2">
                <ThumbsUp
                  stroke={`#00B159`}
                  strokeWidth={2}
                  className={`cursor-pointer`}
                  //   onClick={() => setIsLike(true)}
                />
                <ThumbsDown
                  stroke={`#F7941D`}
                  strokeWidth={2}
                  className="cursor-pointer"
                  //   onClick={() => setIsLike(false)}
                />
              </div> */}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
