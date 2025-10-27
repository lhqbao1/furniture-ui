"use client"

import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, Loader2 } from "lucide-react"
import { useLogin, useLoginOtp, useSendOtp, useSendOtpAdmin } from "@/features/auth/hook"
import { toast } from "sonner"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { Link, useRouter } from "@/src/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useSyncLocalCart } from "@/features/cart/hook"
import { loginGoogle } from "@/features/auth/api"
import { useQuery } from "@tanstack/react-query"
interface LoginFormProps {
    isAdmin?: boolean
}

export default function LoginForm({ isAdmin = false }: LoginFormProps) {
    // const [userId, setUserId] = useAtom(userIdAtom)
    const [seePassword, setSeePassword] = useState(false)
    const router = useRouter()
    const locale = useLocale()
    const t = useTranslations()
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])


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
    const loginAdminMutation = useSendOtpAdmin()
    const syncLocalCartMutation = useSyncLocalCart();
    const sendOtpMutation = useSendOtp()
    const submitOtpMutation = useLoginOtp()

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        if (!seePassword && !isAdmin) {
            sendOtpMutation.mutate(values.username, {
                onSuccess: (data) => {
                    toast.success(t('sendedEmail'))
                    setSeePassword(true)
                },
                onError(error, variables, context) {
                    toast.error(t("invalidEmail"))
                },
            })
        } else if (isAdmin && !seePassword) {
            loginAdminMutation.mutate(values.username, {
                onSuccess: () => {
                    toast.success(t('sendedEmail'))
                    setSeePassword(true)
                },
                onError() {
                    toast.error(t("invalidEmail"))
                },

            })
        } else if (seePassword && !isAdmin) {
            submitOtpMutation.mutate({
                email: values.username,
                code: values.code ?? ''
            }, {
                onSuccess: (data) => {
                    // Giả sử backend trả về token
                    const token = data.access_token

                    localStorage.setItem("access_token", token)
                    router.push("/", { locale })
                    localStorage.setItem("userId", data.id)

                    syncLocalCartMutation.mutate()

                    // Có thể lưu userId nếu cần
                    // setUserId(data.id)
                    toast.success(t('loginSuccess'))
                },
                onError(error, variables, context) {
                    toast.error(t("invalidCredentials"))
                },
            })
        }
        else if (seePassword && isAdmin) {
            submitOtpMutation.mutate({
                email: values.username,
                code: values.code ?? ''
            }, {
                onSuccess: (data) => {
                    // Giả sử backend trả về token
                    const token = data.access_token
                    localStorage.setItem("admin_access_token", token)
                    router.push("/admin/orders/list", { locale })
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

        if (!isAdmin) {
            submitOtpMutation.mutate(
                {
                    email: form.getValues("username"),
                    code,
                },
                {
                    onSuccess: (data) => {
                        const token = data.access_token
                        localStorage.setItem("access_token", token)
                        localStorage.setItem("userId", data.id)
                        router.push("/", { locale })
                        syncLocalCartMutation.mutate()
                        toast.success(t("loginSuccess"))
                    },
                    onError() {
                        toast.error(t("invalidCredentials"))
                    },
                }
            )
        } else {
            submitOtpMutation.mutate(
                {
                    email: form.getValues("username"),
                    code,
                },
                {
                    onSuccess: (data) => {
                        const token = data.access_token
                        localStorage.setItem("admin_access_token", token)
                        localStorage.setItem("userId", data.id)
                        router.push("/admin/orders/list", { locale })
                        toast.success(t("loginSuccess"))
                    },
                    onError(error) {
                        toast.error(error.message)
                    },
                }
            )
        }
    }

    const handleLoginGoogle = async () => {
        // Gọi thẳng đến backend bằng redirect, không dùng axios
        window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}google/login`;
    };


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
                    <span>{t('welcomeTo')}</span>
                    <span className="text-primary" translate="no">Prestige Home</span>
                </h1>
            </div>

            {/* <h2 className="text-2xl font-bold mb-6 lg:text-start text-center">Log In</h2> */}
            <Form {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(
                    (values) => {
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
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <FormControl>
                                            <div className="flex gap-2 justify-center mb-4 w-full">
                                                {Array.from({ length: 6 }).map((_, idx) => (
                                                    <Input
                                                        key={idx}
                                                        id={`otp-${idx}`}
                                                        value={field.value?.[idx] ?? ""}
                                                        // ref={(el) => (inputRefs.current[idx] = el)}
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
                                                        onPaste={(e) => {
                                                            e.preventDefault()
                                                            const pasted = e.clipboardData.getData("text").replace(/\D/g, "")
                                                            if (!pasted) return

                                                            const newValue = field.value ?? ""
                                                            const arr = newValue.split("")

                                                            // điền lần lượt vào các ô
                                                            for (let i = 0; i < 6; i++) {
                                                                arr[i] = pasted[i] ?? arr[i] ?? ""
                                                            }

                                                            const finalValue = arr.join("").slice(0, 6)
                                                            field.onChange(finalValue)

                                                            // focus ô cuối cùng có ký tự
                                                            const nextIndex = Math.min(pasted.length, 6) - 1
                                                            inputRefs.current[nextIndex]?.focus()

                                                            if (finalValue.length === 6) {
                                                                handleAutoSubmitOtp(finalValue)
                                                            }
                                                        }}
                                                        className="h-12 flex-1 text-center text-lg"
                                                        maxLength={1}
                                                        inputMode="numeric"              // ✅ hiển thị bàn phím số trên mobile
                                                        pattern="[0-9]*"                 // ✅ chỉ chấp nhận số
                                                        type="text"                      // tránh lỗi autofill của Safari
                                                        autoComplete="one-time-code"     // ✅ hỗ trợ autofill OTP (iOS, Android)
                                                    />
                                                ))}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }

                            }
                        />
                    ) : ''}

                    <Button
                        type="submit"
                        className="w-full bg-secondary/95 hover:bg-secondary"
                        hasEffect
                        disabled={submitOtpMutation.isPending || sendOtpMutation.isPending || loginAdminMutation.isPending}
                    >
                        {
                            sendOtpMutation.isPending || loginAdminMutation.isPending
                                ? <Loader2 className="animate-spin" />
                                : seePassword
                                    ? (submitOtpMutation.isPending
                                        ? <Loader2 className="animate-spin" />
                                        : t('login')
                                    )
                                    : t('getOtp')
                        }
                    </Button>
                </form>
            </Form>

            {/* Sign up link */}
            {
                !isAdmin && (
                    <div className="text-sm text-center mt-6 space-x-1">
                        <span>{t('noAccount')}</span>
                        <Link href={`/sign-up`} className="text-sm text-secondary hover:underline">
                            {t('createAccount')}
                        </Link>
                    </div>
                )
            }
            {!isAdmin &&
                <div className="flex flex-col gap-4 justify-center items-center mt-8">
                    <Button
                        className="w-1/2"
                        variant={'outline'}
                        onClick={() => handleLoginGoogle()}
                    >
                        <Image
                            src={'/google.svg'}
                            width={20}
                            height={20}
                            alt=""
                        />
                        Continue with Google
                    </Button>
                </div>
            }
        </div>
    )
}
