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
import ImagePickerForm from "@/components/shared/image-picker";

const Schema = z.object({
    message: z
        .string()
        .trim()
        .min(10, "Nội dung tối thiểu 10 ký tự")
        .max(1000, "Nội dung tối đa 1000 ký tự"),
});

type FormValues = z.infer<typeof Schema>;

export default function CommentForm() {
    const form = useForm<FormValues>({
        resolver: zodResolver(Schema),
        mode: "onChange",
        defaultValues: {
            message: "",
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
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                                <Textarea
                                    rows={4}
                                    placeholder="Write something..."
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* <ImagePickerForm type="simple" /> */}

                {/* Buttons nằm cạnh nhau, phải */}
                <div className="flex items-center justify-center gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting || !isValid} className="flex-1" hasEffect>
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
