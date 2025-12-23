"use client";
import { useGetFAQItem, useGetFAQTopic } from "@/features/faq/hook";
import { Loader2, Mic, Search } from "lucide-react";
import React, { useState } from "react";
import { getIcon } from "./icon";
import { BannerInput } from "@/components/shared/banner-input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ListFAQQuestion } from "./list-question";
import { useTranslations } from "next-intl";
import { FAQQuestionSkeleton } from "./skeleton";
import { FAQTopicSkeleton } from "./topic-skeleton";

interface ListFAQProps {
  topic_id: string;
  height?: number;
}

const ListFAQ = ({ topic_id, height }: ListFAQProps) => {
  const [currentTopic, setCurrentTopic] = useState(topic_id);
  const t = useTranslations();
  const {
    data: topic,
    isLoading: isLoadingTopic,
    isError: isErrorTopic,
  } = useGetFAQTopic();
  const {
    data: question,
    isLoading: isLoadingQuestion,
    isError: isErrorQuestion,
  } = useGetFAQItem(currentTopic);

  return (
    <div className="grid grid-cols-12 gap-8 lg:pt-12 pt-4 items-start">
      <div className="col-span-5 grid grid-cols-3 gap-10">
        <h2 className="text-4xl font-semibold text-secondary col-span-3 text-center">
          FAQ
        </h2>
        {isLoadingTopic ? (
          <FAQTopicSkeleton count={6} />
        ) : (
          topic?.map((topic, topicIndex) => {
            return (
              <div
                key={topicIndex}
                className={cn(
                  "flex flex-col justify-center items-center gap-1.5 cursor-pointer py-4",
                  currentTopic === topic.id ? "bg-primary/20 rounded-sm" : "",
                )}
                onClick={() => setCurrentTopic(topic.id)}
              >
                {getIcon(topic.name)}
                <p className="text-center">{topic.name}</p>
              </div>
            );
          })
        )}
      </div>
      <div className="col-span-7 space-y-8">
        {isLoadingQuestion ? (
          <FAQQuestionSkeleton count={2} />
        ) : (
          <ListFAQQuestion question={question} />
        )}
      </div>
    </div>
  );
};

export default ListFAQ;
