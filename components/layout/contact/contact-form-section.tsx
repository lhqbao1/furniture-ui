"use client";
import { ContactFormInput } from "@/features/contact/api";
import { useUploadContactForm } from "@/features/contact/hook";
import { contactFormSchema } from "@/lib/schema/contact";
import { contactOrderIdAtom } from "@/store/checkout";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAtom } from "jotai";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import ImagePickerInput from "@/components/layout/single-product/tabs/review/image-picker-input";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";

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
];

const ContactFormSection = () => {
  const [contactOrderId, setContactOrderId] = useAtom(contactOrderIdAtom);
  const t = useTranslations();

  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      email: "",
      subject: "",
      order_id: "",
      message: "",
    },
  });

  const uploadContactFormMutation = useUploadContactForm();

  const onSubmit = (values: z.infer<typeof contactFormSchema>) => {
    const cleanedValues = Object.fromEntries(
      Object.entries(values).filter(([key, value]) => {
        if (key === "email" || key === "subject") return true;
        return value !== null && value !== undefined && value !== "";
      }),
    ) as unknown as ContactFormInput;

    uploadContactFormMutation.mutate(
      {
        ...cleanedValues,
        order_id: contactOrderId,
      },
      {
        onSuccess() {
          toast.success("Ihre Nachricht wurde erfolgreich gesendet.");
          form.reset();
        },
        onError() {
          toast.error(
            "Ihre Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
          );
        },
      },
    );
  };
  return (
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
              <FormLabel className="lg:text-base font-semibold text-sm">
                {t("email")}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("emailPlaceholder")}
                  {...field}
                />
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
              <FormLabel className="lg:text-base font-semibold text-sm">
                {t("subject")}
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger
                    className="border"
                    placeholderColor
                  >
                    <SelectValue placeholder={t("subjectPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SUBJECT_OPTIONS_DE.map((option) => (
                    <SelectItem
                      key={option}
                      value={option}
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <FormLabel className="lg:text-base font-semibold text-sm">
                {t("message")}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t("messagePlaceholder")}
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Attachments */}
        <ImagePickerInput
          fieldName="file_url"
          form={form}
          isSingle
          isFile
        />

        {/* Actions */}
        <div className="flex lg:justify-end justify-center gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={uploadContactFormMutation.isPending}
          >
            {t("back")}
          </Button>
          <Button type="submit">
            {uploadContactFormMutation.isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>{t("submit")}</>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default ContactFormSection;
