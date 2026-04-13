import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ } from "@/types/faq";

interface ListFAQQuestionProps {
  question?: FAQ[];
}

export function ListFAQQuestion({ question }: ListFAQQuestionProps) {
  if (!question || question.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        Für diese Kategorie sind aktuell keine Fragen vorhanden.
      </div>
    );
  }

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full space-y-3"
      defaultValue={question[0]?.id}
    >
      {question.map((item) => {
        return (
          <AccordionItem
            value={item.id}
            key={item.id}
            className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50/40 px-4 transition-colors data-[state=open]:border-primary/30 data-[state=open]:bg-white"
          >
            <AccordionTrigger className="gap-4 py-4 text-left hover:no-underline [&>svg]:shrink-0">
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  Q
                </span>
                <p className="text-sm font-semibold leading-6 text-slate-900 md:text-base">
                  {item.question}
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50/40 p-3 md:p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  A
                </span>
                <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
                  {item.answer}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
