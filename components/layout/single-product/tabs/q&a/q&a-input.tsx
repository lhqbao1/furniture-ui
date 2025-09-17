"use client"

import { z } from "zod"
import React from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useTranslations } from "next-intl"

const formSchema = z.object({
    question: z.string().min(1, { error: 'You must provide at least a text' }).max(50),
})

const QAInput = () => {
    const t = useTranslations()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            question: "",
        },
    })

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
    }

    return (
        <div className="relative flex">
            <Input placeholder={t('qaSearch')} className="rounded-full h-10" />
            <Button type="submit" className='cursor-pointer absolute bg-primary rounded-full aspect-square h-full text-white font-bold flex items-center justify-center border border-primary right-0 lg:px-12 px-8'>
                {t('search')}
            </Button>
        </div>
    )
}

export default QAInput