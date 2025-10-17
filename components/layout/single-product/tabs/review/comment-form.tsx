"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import ImagePickerInput from "./image-picker-input";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";



export default function CommentForm() {
    const t = useTranslations()
    const Schema = z.object({
        message: z
            .string()
            .trim()
            .min(10, t('msg.min'))
            .max(1000, t('msg.max')),
        image: z.array(z.string()).optional()
    });

    type FormValues = z.infer<typeof Schema>;

    const form = useForm<FormValues>({
        resolver: zodResolver(Schema),
        mode: "onChange",
        defaultValues: {
            message: "",
            image: []
        },
    });

    const {
        handleSubmit,
        control,
        reset,
        formState: { isSubmitting, isValid },
    } = form;

    const onSubmit = async (values: FormValues) => {
        // TODO: submit API
        console.log("Submit:", values);
    };

    const onCancel = () => {
        reset();
    };

    return (
        <Form {...form}>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full max-w-xl space-y-4"
            >
                <FormField
                    control={control}
                    name="message"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Textarea
                                    rows={4}
                                    placeholder=""
                                    className="h-40"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* <ImagePickerInput form={form} fieldName="image" /> */}
                {/* Buttons nằm cạnh nhau, phải */}
                <div className="flex items-center justify-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="flex-1 text-lg font-semibold"
                    >
                        {t('clear')}
                    </Button>
                    <Button type="submit" disabled={isSubmitting || !isValid} className="flex-1 text-lg font-bold" variant={'default'} hasEffect>
                        {isSubmitting ? <Loader2 className="animate-spin" /> : t('submit')}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
