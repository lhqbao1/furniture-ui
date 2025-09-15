"use client"

import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, Key, Loader2, Eye, EyeOff } from "lucide-react"
import { useLogin } from "@/features/auth/hook"
import { toast } from "sonner"
import { useState } from "react"
import { Link, useRouter } from "@/src/i18n/navigation"
import { useTranslations } from "next-intl"
import { useSyncLocalCart } from "@/features/cart/hook"

interface CartLoginFormProps {
    onSuccess?: () => void
}

export default function CartLoginForm({ onSuccess }: CartLoginFormProps) {
    const [seePassword, setSeePassword] = useState(false)
    const router = useRouter()
    const t = useTranslations()

    const formSchema = z.object({
        username: z
            .string()
            .min(1, t("emailRequired"))
            .email(t("invalidEmail")),
        password: z
            .string()
            .min(8, t("passwordMin"))
            .refine((val) => /[a-z]/.test(val), { message: t("passwordLower") })
            .refine((val) => /[A-Z]/.test(val), { message: t("passwordUpper") })
            .refine((val) => /\d/.test(val), { message: t("passwordNumber") }),
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    })

    const loginMutation = useLogin()
    const syncLocalCartMutation = useSyncLocalCart()

    const handleSubmit = (values: z.infer<typeof formSchema>) => {
        loginMutation.mutate(values, {
            onSuccess: (data) => {
                const token = data.access_token
                localStorage.setItem("access_token", token)
                localStorage.setItem("userId", data.id)

                syncLocalCartMutation.mutate()

                toast.success(t("loginSuccess"))

                // gọi callback onSuccess nếu được truyền
                if (onSuccess) onSuccess()
                else router.push("/")
            },
            onError(error) {
                toast.error(t("invalidCredentials"))
            },
        })
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
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                        {seePassword ? (
                                            <EyeOff
                                                className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 cursor-pointer"
                                                onClick={() => setSeePassword(false)}
                                            />
                                        ) : (
                                            <Eye
                                                className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 cursor-pointer"
                                                onClick={() => setSeePassword(true)}
                                            />
                                        )}
                                        <Input
                                            type={seePassword ? "text" : "password"}
                                            placeholder={t("password")}
                                            {...field}
                                            className="pl-12 py-3 h-fit capitalize"
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="space-y-2">
                        <Button
                            type="submit"
                            className="w-full bg-secondary/95 hover:bg-secondary"
                            hasEffect
                            disabled={loginMutation.isPending}
                        >
                            {loginMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                t("login")
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant={'outline'}
                            disabled={loginMutation.isPending}
                            onClick={() => router.push('/check-out')}
                            className="w-full"
                        >
                            {t('continueAsGuest')}
                        </Button>
                    </div>
                </form>
            </Form>

            {/* Forgot password */}
            <div className="flex justify-end mt-2 lg:mt-4">
                <Link
                    href="/forgot-password"
                    className="text-sm text-secondary hover:underline"
                >
                    {t("forgotPassword")}?
                </Link>
            </div>

            {/* Sign up link */}
            <div className="text-sm text-center mt-6 space-x-1">
                <span>{t("noAccount")}</span>
                <Link
                    href="/sign-up"
                    className="text-secondary font-medium hover:underline"
                >
                    {t("createAccount")}
                </Link>
            </div>
        </div>
    )
}
