"use client"

import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, Key, Loader2, Eye, EyeOff } from "lucide-react"
import { useLogin, useLoginOtp, useSendOtp } from "@/features/auth/hook"
import { toast } from "sonner"
import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { useSyncLocalCart } from "@/features/cart/hook"
import { useCartLocal } from "@/hooks/cart"
import { Link, useRouter } from "@/src/i18n/navigation"

interface CartLoginFormProps {
    onSuccess?: () => void
    onError?: () => void
}

export default function CartLoginForm({ onSuccess, onError }: CartLoginFormProps) {
    const [seePassword, setSeePassword] = useState(false)
    const router = useRouter()
    const locale = useLocale()
    const t = useTranslations()

    const { cart: localCart } = useCartLocal();

    const formSchema = z.object({
        username: z
            .string()
            .min(1, t('emailRequired'))
            .email(t('invalidEmail')),
        code: z.string().optional().nullable(),
    })


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
        },
    })

    const loginMutation = useLogin()
    const syncLocalCartMutation = useSyncLocalCart()
    const sendOtpMutation = useSendOtp()
    const submitOtpMutation = useLoginOtp()

    const handleRedirectToCheckOut = () => {
        if (!localCart || localCart.length === 0) {
            toast.error(t('chooseAtLeastCart'))
        } else {
            if (onError) onError()
        }
    }

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        if (!seePassword) {
            sendOtpMutation.mutate(values.username, {
                onSuccess: (data) => {
                    toast.success(t('sendedEmail'))
                    setSeePassword(true)
                },
                onError(error, variables, context) {
                    toast.error(t("invalidCredentials"))
                },
            })
        } else {
            submitOtpMutation.mutate({
                email: values.username,
                code: values.code ?? ''
            },
                {
                    onSuccess: (data) => {
                        const token = data.access_token
                        localStorage.setItem("access_token", token)
                        localStorage.setItem("userId", data.id)
                        syncLocalCartMutation.mutate()

                        toast.success(t("loginSuccess"))
                        router.push('/check-out', { locale })
                        // gọi callback onSuccess nếu được truyền
                        if (onSuccess) onSuccess()
                    },
                    onError(error) {
                        toast.error(t("invalidCredentials"))
                    },
                }
            )
        }

    }

    return (
        <div className="p-6 bg-white rounded-2xl w-full">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                        <Input
                                            placeholder={t("email")}
                                            {...field}
                                            className="pl-12 py-3 h-fit"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Password */}
                    {seePassword ? (
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className="flex gap-2 justify-center mb-4 w-full">
                                            {Array.from({ length: 6 }).map((_, idx) => (
                                                <Input
                                                    key={idx}
                                                    id={`otp-${idx}`}
                                                    value={field.value?.[idx] ?? ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/\D/g, "").slice(-1) // chỉ số 1 ký tự
                                                        const current = field.value ?? ""
                                                        const newValue =
                                                            current.substring(0, idx) + val + current.substring(idx + 1)

                                                        field.onChange(newValue)

                                                        // tự động focus sang input kế
                                                        if (val && idx < 5) {
                                                            const next = document.getElementById(`otp-${idx + 1}`) as HTMLInputElement
                                                            next?.focus()
                                                        }
                                                    }}
                                                    className="h-12 flex-1 text-center text-lg"
                                                    maxLength={1}
                                                />
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ) : ''}

                    <div className="space-y-2">
                        <Button
                            type="submit"
                            className="w-full bg-secondary/95 hover:bg-secondary"
                            hasEffect
                            disabled={submitOtpMutation.isPending || sendOtpMutation.isPending}
                        >
                            {(submitOtpMutation.isPending || sendOtpMutation.isPending) ? seePassword ? <Loader2 className="animate-spin" /> : t('login') : t('getOtp')}
                        </Button>
                        <Button
                            type="button"
                            variant={'outline'}
                            disabled={loginMutation.isPending}
                            onClick={() => handleRedirectToCheckOut()}
                            className="w-full active:scale-95 active:bg-accent"
                        >
                            {t('continueAsGuest')}
                        </Button>
                    </div>
                </form>
            </Form>

            {/* Forgot password */}
            <div className="flex justify-end mt-2 lg:mt-4">
                <Link href={`/${locale}/forgot-password`} className="text-sm text-secondary hover:underline">

                    {t("forgotPassword")}?
                </Link>
            </div>

            {/* Sign up link */}
            <div className="text-sm text-center mt-6 space-x-1">
                <span>{t("noAccount")}</span>
                <Link href={`/${locale}/sign-up`} className="font-medium text-secondary hover:underline">

                    {t("createAccount")}
                </Link>
            </div>
        </div>
    )
}
