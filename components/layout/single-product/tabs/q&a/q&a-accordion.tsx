import React from 'react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { faqs } from '@/data/data'


const QAAccordion = () => {
    return (
        <Accordion type="single" collapsible className="w-full flex flex-col gap-3">
            {faqs.map((faq, index) => (
                <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border px-3 rounded-xl"
                >
                    <AccordionTrigger className="py-3 font-bold flex gap-4 justify-start items-center">
                        <p className="text-secondary text-xl font-bold">Q</p>
                        <p>{faq.question}</p>
                    </AccordionTrigger>
                    <AccordionContent className="flex gap-4 items-start justify-start">
                        <p className="text-primary text-xl font-bold">A</p>
                        <div className="flex flex-col gap-4 text-balance">
                            {faq.answer.map((text, i) => (
                                <p key={i}>{text}</p>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}

export default QAAccordion