"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import "react-phone-input-2/lib/style.css"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useSignUp } from "@/features/auth/hook"
import { toast } from "sonner"
import { Eye, EyeOff, Key, Loader2 } from "lucide-react"
import { useRouter } from "@/src/i18n/navigation"
import { useTranslations } from "next-intl"


export default function SignUpForm() {
  const [seePassword, setSeePassword] = React.useState(false)
  const t = useTranslations()
  const signUp = useSignUp()
  const router = useRouter()

  const formSchema = z.object({
    email: z
      .string()
      .min(1, t('emailRequired'))
      .email(t('invalidEmail')),
    first_name: z.string().min(1, { message: t('first_name_required') }),
    last_name: z.string().min(1, { message: t('last_name_required') }),
    phone_number: z
      .string()
      .min(6, { message: t('phone_number_short') })
      .refine((val) => /^\+?[0-9]+$/.test(val), {
        message: t('phone_number_invalid'),
      }),
    password: z
      .string()
      .min(8, t('passwordMin'))
      .refine((val) => /[a-z]/.test(val), {
        message: t('passwordLower'),
      })
      .refine((val) => /[A-Z]/.test(val), {
        message: t('passwordUpper'),
      })
      .refine((val) => /\d/.test(val), {
        message: t('passwordNumber'),
      }),
    confirmPassword: z.string().min(1, t('confirm_password_required')),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('confirm_password_mismatch'),
    path: ["confirmPassword"],
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    signUp.mutate({
      email: values.email,
      password: values.password,
      phone_number: values.phone_number,
      first_name: values.first_name,
      last_name: values.last_name
    }, {
      onSuccess: (data) => {
        form.reset()
        toast.success("Sign up successful! Please log in.")
        router.push("/login")
      },
      onError: (error) => {
        toast.error("Failed to sign up. Please try again.")
      }
    })
  }

  return (
    <div className="w-full p-6">
      <div className="flex flex-col items-center mb-12 gap-3">
        {/* Logo giả */}
        <Image
          src={'/new-logo.svg'}
          width={100}
          height={100}
          alt=""
        />
        <h1 className="text-3xl font-semibold text-secondary text-center space-x-2 lg:block flex flex-col">
          <span>{t('welcomeTo')}</span>
          <span className="text-primary">Prestige Home</span>
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('email')}</FormLabel>
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
                <FormLabel>{t('phone_number')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="+49"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="">{t('first_name')}</FormLabel>
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
                <FormLabel>{t('last_name')}</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('password')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Key className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    {seePassword === false ?
                      <Eye className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 cursor-pointer" onClick={() => setSeePassword(true)} /> :
                      <EyeOff className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 cursor-pointer" onClick={() => setSeePassword(false)} />}
                    <Input type={seePassword ? 'text' : 'password'} placeholder="Password" {...field} className="pl-12 py-3 h-fit" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('confirm_password')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Key className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    {seePassword === false ?
                      <Eye className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 cursor-pointer" onClick={() => setSeePassword(true)} /> :
                      <EyeOff className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 cursor-pointer" onClick={() => setSeePassword(false)} />}
                    <Input type={seePassword ? 'text' : 'password'} placeholder="Password" {...field} className="pl-12 py-3 h-fit" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="col-span-1 md:col-span-2 flex justify-center mt-4">
            <Button type="submit" className="bg-primary/90 hover:bg-primary lg:px-12 px-4 py-6 text-lg" hasEffect>
              {signUp.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : <div className="capitalize">{t('createAccount')}</div>}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
