"use client"

import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, Loader2 } from "lucide-react"
import { useLogin, useLoginDSPOtp, useLoginOtp, useSendOtp, useSendOtpAdmin, useSendOtpDSP } from "@/features/auth/hook"
import { toast } from "sonner"
import Image from "next/image"
import { useState } from "react"
import { Link, useRouter } from "@/src/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useSyncLocalCart } from "@/features/cart/hook"

export default function SellerLoginForm() {
    // const [userId, setUserId] = useAtom(userIdAtom)
    const [seePassword, setSeePassword] = useState(false)
    const router = useRouter()
    const locale = useLocale()
    const t = useTranslations()

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

    const sendOtpDSPMutation = useSendOtpDSP()
    const submitOtpDSPMutation = useLoginDSPOtp()

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        if (!seePassword) {
            sendOtpDSPMutation.mutate(values.username, {
                onSuccess: () => {
                    toast.success(t('sendedEmail'))
                    setSeePassword(true)
                },
                onError() {
                    toast.error(t("invalidEmail"))
                },

            })
        } else if (seePassword) {
            submitOtpDSPMutation.mutate({
                email: values.username,
                code: values.code ?? ''
            }, {
                onSuccess: (data) => {
                    // Giả sử backend trả về token
                    const token = data.access_token
                    localStorage.setItem("dsp_access_token", token)
                    router.push("/dsp/admin", { locale })
                    localStorage.setItem("userId", data.id)

                    // Có thể lưu userId nếu cần
                    // setUserId(data.id)
                    toast.success(t('loginSuccess'))

                },
                onError(error, variables, context) {
                    toast.error(error.message)
                },
            })
        }
    }

    const handleAutoSubmitOtp = (code: string) => {
        if (code.length !== 6) return

        submitOtpDSPMutation.mutate(
            {
                email: form.getValues("username"),
                code,
            },
            {
                onSuccess: (data) => {
                    // Giả sử backend trả về token
                    const token = data.access_token
                    localStorage.setItem("dsp_access_token", token)
                    router.push("/dsp/admin", { locale })
                    localStorage.setItem("userId", data.id)

                    // Có thể lưu userId nếu cần
                    // setUserId(data.id)
                    toast.success(t('loginSuccess'))

                },
                onError(error, variables, context) {
                    toast.error(error.message)
                },
            }
        )
    }

    return (
        <div className="p-6 bg-white rounded-2xl lg:w-3/4 w-full">
            <div className="flex flex-col items-center mb-12 gap-3">
                {/* Logo giả */}
                <Image
                    src={'/new-logo.svg'}
                    width={100}
                    height={100}
                    alt=""
                />
                <h1 className="text-3xl font-semibold text-secondary text-center space-x-2 lg:block flex flex-col">
                    {/* <span>{t('welcomeTo')}</span> */}
                    <span className="text-primary" translate="no"><span className="text-secondary">Prestige Home</span> Dropshipping Portal</span>
                </h1>
            </div>

            {/* <h2 className="text-2xl font-bold mb-6 lg:text-start text-center">Log In</h2> */}
            <Form {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(
                    (values) => {
                        console.log("✅ Valid submit", values)
                        handleSubmit(values)
                    },
                    (errors) => {
                        // toast.error("Please check the form for errors")
                        console.log(errors)
                    }
                )}>                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                        <Input placeholder={t('email')} {...field} className="pl-12 py-3 h-fit" disabled={seePassword} />
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

                    <Button
                        type="submit"
                        className="w-full bg-secondary/95 hover:bg-secondary"
                        hasEffect
                        disabled={submitOtpDSPMutation.isPending || sendOtpDSPMutation.isPending}
                    >
                        {
                            sendOtpDSPMutation.isPending || submitOtpDSPMutation.isPending
                                ? <Loader2 className="animate-spin" />
                                : seePassword
                                    ? (submitOtpDSPMutation.isPending
                                        ? <Loader2 className="animate-spin" />
                                        : t('login')
                                    )
                                    : t('getOtp')
                        }
                    </Button>
                </form>
            </Form>
        </div>
    )
}
