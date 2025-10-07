"use client"

import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useLogin, useLoginOtp, useSendOtp } from "@/features/auth/hook"
import { toast } from "sonner"
import { useState } from "react"
import { useRouter } from "@/src/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useSyncLocalCart } from "@/features/cart/hook"
import { Switch } from "../ui/switch"
import { useQueryClient } from "@tanstack/react-query"
interface HeaderLoginFormProps {
    onSuccess?: () => void
}

export default function HeaderLoginForm({ onSuccess }: HeaderLoginFormProps) {
    const [seePassword, setSeePassword] = useState(false)
    const router = useRouter()
    const t = useTranslations()
    const queryClient = useQueryClient()
    const locale = useLocale()

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

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        if (!seePassword) {
            sendOtpMutation.mutate(values.username, {
                onSuccess: (data) => {
                    toast.success(t('sendedEmail'))
                    setSeePassword(true)
                },
                onError(error, variables, context) {
                    toast.error(t("invalidEmail"))
                },
            })
        } else {
            submitOtpMutation.mutate({
                email: values.username,
                code: values.code ?? ''
            }, {
                onSuccess(data, variables, context) {
                    const token = data.access_token
                    localStorage.setItem("access_token", token)
                    localStorage.setItem("userId", data.id)
                    queryClient.refetchQueries({ queryKey: ["me"], exact: true })
                    queryClient.refetchQueries({ queryKey: ["cart-items"], exact: true })
                    syncLocalCartMutation.mutate()

                    toast.success(t("loginSuccess"))

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

    const handleAutoSubmitOtp = (code: string) => {
        if (code.length !== 6) return

        submitOtpMutation.mutate(
            {
                email: form.getValues("username"),
                code,
            },
            {
                onSuccess(data, variables, context) {
                    const token = data.access_token
                    localStorage.setItem("access_token", token)
                    localStorage.setItem("userId", data.id)
                    queryClient.refetchQueries({ queryKey: ["me"], exact: true })
                    queryClient.refetchQueries({ queryKey: ["cart-items"], exact: true })
                    syncLocalCartMutation.mutate()

                    toast.success(t("loginSuccess"))

                    // gọi callback onSuccess nếu được truyền
                    if (onSuccess) onSuccess()
                },
                onError(error) {
                    toast.error(t("invalidCredentials"))
                },
            }
        )
    }

    return (
        <div className="bg-white rounded-2xl w-full">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            placeholder={t("email")}
                                            {...field}
                                            className="lg:h-16 h-14 bg-gray-100 rounded-xs "
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

                                                        if (idx === 5) {
                                                            handleAutoSubmitOtp(newValue)
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

                    <div className="flex justify-between items-center">
                        <Switch className="data-[state=unchecked]:bg-gray-400" />
                        <p className="text-black/70 text-lg">Angemeldet bleiben</p>
                    </div>

                    <div className="space-y-2">
                        <Button
                            type="submit"
                            className="w-full text-lg rounded-none h-14"
                            variant={'secondary'}
                            hasEffect
                            disabled={submitOtpMutation.isPending || sendOtpMutation.isPending}
                        >
                            {
                                sendOtpMutation.isPending
                                    ? <Loader2 className="animate-spin" />
                                    : seePassword
                                        ? (submitOtpMutation.isPending
                                            ? <Loader2 className="animate-spin" />
                                            : t('login')
                                        )
                                        : t('getOtp')
                            }
                        </Button>
                    </div>
                </form>
            </Form>

            {/* Sign up link */}
            <Button
                type="button"
                variant={'outline'}
                className="w-full text-lg rounded-none h-14 text-black/50 mt-4"
                hasEffect
                disabled={loginMutation.isPending}
                onClick={() => {
                    router.push('/sign-up', { locale })
                }}
            >
                {loginMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    "NEUES KONTO ANLEGEN"
                )}
            </Button>
        </div>
    )
}
