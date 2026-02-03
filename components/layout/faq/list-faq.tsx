"use client";
import { useGetFAQItem, useGetFAQTopic } from "@/features/faq/hook";
import React, { useState } from "react";
import { getIcon } from "./icon";
import { cn } from "@/lib/utils";
import { ListFAQQuestion } from "./list-question";
import { FAQQuestionSkeleton } from "./skeleton";
import { FAQTopicSkeleton } from "./topic-skeleton";

interface ListFAQProps {
  topic_id: string;
  height?: number;
}

const ListFAQ = ({ topic_id, height }: ListFAQProps) => {
  const [currentTopic, setCurrentTopic] = useState(topic_id);
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
    <div className="grid grid-cols-12 lg:gap-x-12 gap-x-2 gap-y-8 lg:pt-12 pt-4 items-start xl:w-8/12 w-11/12 mx-auto overflow-x-hidden">
      <h2 className="text-4xl font-semibold text-secondary text-center col-span-12">
        FAQ
      </h2>
      <div className="lg:col-span-5 col-span-12 grid grid-cols-3 md:gap-10 gap-2">
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
      <div className="lg:col-span-7 col-span-12 space-y-8">
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
