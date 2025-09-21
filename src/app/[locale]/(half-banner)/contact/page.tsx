"use client"

import * as z from "zod"
import { FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useTranslations } from "next-intl"
import ImagePickerInput from "@/components/layout/single-product/tabs/review/image-picker-input"
import { useUploadContactForm } from "@/features/contact/hook"
import { ContactFormInput } from "@/features/contact/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
    email: z.string().email("Ungültige E-Mail-Adresse"),
    subject: z.string().min(1, "Bitte wählen Sie ein Thema aus"),
    order_id: z.string().optional(),
    message: z.string().min(1, "Bitte geben Sie eine Nachricht ein"),
    file_url: z.string().optional(),
})



const SUBJECT_OPTIONS_DE = [
    "Frage zu einem Produkt",
    "Bestellstatus / Sendungsverfolgung",
    "Bestellung ändern oder stornieren",
    "Frage zum Versand / zur Lieferung",
    "Frage zur Zahlung oder Rechnung",
    "Garantie oder Reklamation",
    "B2B",
    "Konto",
    "Sonstige / Allgemeine Anfrage",
    "Datenschutzanliegen",
]

export default function ContactPage() {
    const t = useTranslations()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            subject: "",
            order_id: "",
            message: "",
        },
    })

    const uploadContactFormMutation = useUploadContactForm()

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const cleanedValues = Object.fromEntries(
            Object.entries(values).filter(([key, value]) => {
                if (key === "email" || key === "subject") return true;
                return value !== null && value !== undefined && value !== "";
            })
        ) as unknown as ContactFormInput;

        uploadContactFormMutation.mutate(cleanedValues, {
            onSuccess() {
                toast.success("Ihre Nachricht wurde erfolgreich gesendet.");
                form.reset();
            },
            onError() {
                toast.error("Ihre Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.");
            },
        });
    }

    return (
        <div className="lg:w-2/5 mx-auto section-padding lg:space-y-12 w-full space-y-4">
            <h1 className="section-header space-x-2">
                <span className="text-secondary">{t('contact')}</span>
                <span className="text-primary">Prestige Home</span>
            </h1>
            <FormProvider {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="">
                                <FormLabel className="lg:text-base font-semibold text-sm">{t('email')}</FormLabel>
                                <FormControl>
                                    <Input placeholder={t('emailPlaceholder')} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Subject */}
                    <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="lg:text-base font-semibold text-sm">{t('subject')}</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="border" placeholderColor>
                                            <SelectValue placeholder={t('subjectPlaceholder')} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {SUBJECT_OPTIONS_DE.map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Related Order ID */}
                    <FormField
                        control={form.control}
                        name="order_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="lg:text-base font-semibold text-sm">{t('relatedToOrder')}</FormLabel>
                                <FormControl>
                                    <Input placeholder="" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Message */}
                    <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="lg:text-base font-semibold text-sm">{t('message')}</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder={t('messagePlaceholder')}
                                        rows={6}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Attachments */}
                    <ImagePickerInput fieldName="file_url" form={form} isSingle isFile />

                    {/* Actions */}
                    <div className="flex lg:justify-end justify-center gap-4">
                        <Button type="button" variant="outline" disabled={uploadContactFormMutation.isPending}>
                            {t('back')}
                        </Button>
                        <Button type="submit">
                            {uploadContactFormMutation.isPending ? <Loader2 className="animate-spin" /> : <>{t('submit')}</>}
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    )
}
