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
}

const ListFAQ = ({ topic_id }: ListFAQProps) => {
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
  const selectedTopic = topic?.find((item) => item.id === currentTopic);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 md:px-6 md:pt-10">
      <div className="rounded-3xl border border-emerald-100/80 bg-gradient-to-b from-white to-emerald-50/40 p-4 shadow-sm md:p-8">
        <div className="mb-8 space-y-3 text-center md:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Hilfezentrum
          </p>
          <h1 className="text-balance text-3xl font-bold text-slate-900 md:text-5xl">
            Häufige Fragen & Antworten
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-sm leading-6 text-slate-600 md:text-base">
            Finden Sie schnell Antworten zu Bestellung, Lieferung, Zahlung,
            Rückgabe und Ihrem Kundenkonto.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <aside className="lg:col-span-4 xl:col-span-3">
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm md:p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800">
                  Kategorien
                </p>
                {!isLoadingTopic && topic?.length ? (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-primary">
                    {topic.length}
                  </span>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
                {isLoadingTopic ? (
                  <FAQTopicSkeleton count={6} />
                ) : isErrorTopic ? (
                  <div className="col-span-full rounded-lg border border-dashed border-red-200 bg-red-50 p-3 text-xs text-red-600">
                    Kategorien konnten nicht geladen werden.
                  </div>
                ) : (
                  topic?.map((item) => {
                    const isActive = currentTopic === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={cn(
                          "flex min-h-16 items-center gap-2 rounded-xl border px-3 py-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                          isActive
                            ? "border-primary/40 bg-primary/10 shadow-sm"
                            : "border-slate-200 bg-white hover:border-primary/30 hover:bg-emerald-50/40",
                        )}
                        onClick={() => setCurrentTopic(item.id)}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                          {getIcon(item.name)}
                        </span>
                        <span className="line-clamp-2 text-sm font-medium text-slate-800">
                          {item.name}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </aside>

          <div className="lg:col-span-8 xl:col-span-9">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <h2 className="text-lg font-semibold text-slate-900 md:text-xl">
                  {selectedTopic?.name ?? "Fragen"}
                </h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {question?.length ?? 0} Antworten
                </span>
              </div>

              {isLoadingQuestion ? (
                <FAQQuestionSkeleton count={4} />
              ) : isErrorQuestion ? (
                <div className="rounded-xl border border-dashed border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-600">
                  Fragen konnten nicht geladen werden.
                </div>
              ) : (
                <ListFAQQuestion question={question} />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ListFAQ;
