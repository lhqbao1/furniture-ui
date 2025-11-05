"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import "react-phone-input-2/lib/style.css";
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
import Image from "next/image";
import { useCheckMailExist, useSignUp } from "@/features/auth/hook";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "@/src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function SignUpForm() {
  const t = useTranslations();
  const signUp = useSignUp();
  const checkMailMutation = useCheckMailExist();
  const router = useRouter();
  const locale = useLocale();

  const formSchema = z.object({
    email: z.string().min(1, t("emailRequired")).email(t("invalidEmail")),
    first_name: z.string().min(1, { message: t("first_name_required") }),
    last_name: z.string().min(1, { message: t("last_name_required") }),
    phone_number: z
      .string()
      .min(6, { message: t("phone_number_short") })
      .refine((val) => /^\+?[0-9]+$/.test(val), {
        message: t("phone_number_invalid"),
      }),
    gender: z.string().min(1, { message: t("gender_required") }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      gender: "",
    },
    mode: "onSubmit",
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    checkMailMutation.mutate(values.email, {
      onSuccess(data, variables, context) {
        signUp.mutate(
          {
            email: values.email,
            phone_number: values.phone_number,
            first_name: values.first_name,
            last_name: values.last_name,
            gender: values.gender,
          },
          {
            onSuccess: (data) => {
              form.reset();
              toast.success(t("signUpSuccess"));
              router.push("/login", { locale });
            },
            onError: (error) => {
              toast.error(t("signUpFail"));
            },
          }
        );
      },
      onError(error, variables, context) {
        toast.error(t("useDifferentEmail"));
      },
    });
  };

  return (
    <div className="w-full p-6">
      <div className="flex flex-col items-center mb-12 gap-3">
        {/* Logo giả */}
        <Image src={"/new-logo.svg"} width={100} height={100} alt="" />
        <h1 className="text-3xl font-semibold text-secondary text-center space-x-2 lg:block flex flex-col">
          <span>{t("welcomeTo")}</span>
          <span className="text-primary" translate="no">
            Prestige Home
          </span>
        </h1>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            (values) => {
              handleSubmit(values);
            },
            (errors) => {
              console.log(errors);
              toast.error("Please check the form for errors");
            }
          )}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="md:col-span-2 col-span-1">
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  {/* <FormLabel>{t("gender")}</FormLabel> */}
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className="flex gap-1 items-center">
                        <FormControl>
                          <RadioGroupItem value="male" />
                        </FormControl>
                        <FormLabel className="ml-2">{t("male")}</FormLabel>
                      </FormItem>
                      <FormItem className="flex gap-1 items-center">
                        <FormControl>
                          <RadioGroupItem value="female" />
                        </FormControl>
                        <FormLabel className="ml-2">{t("female")}</FormLabel>
                      </FormItem>
                      <FormItem className="flex gap-1 items-center">
                        <FormControl>
                          <RadioGroupItem value="other" />
                        </FormControl>
                        <FormLabel className="ml-2">
                          {t("otherGender")}
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="">{t("first_name")}</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("last_name")}</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("phone_number")}</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="+49" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-1 md:col-span-2 flex justify-center mt-4">
            <Button
              type="submit"
              className="bg-primary/90 hover:bg-primary lg:px-12 px-4 py-6 text-lg"
              hasEffect
            >
              {signUp.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <div className="capitalize">{t("createAccount")}</div>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
