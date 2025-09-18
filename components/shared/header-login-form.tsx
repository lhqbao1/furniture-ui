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
import { Switch } from "../ui/switch"

interface HeaderLoginFormProps {
    onSuccess?: () => void
}

export default function HeaderLoginForm({ onSuccess }: HeaderLoginFormProps) {
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
            },
            onError(error) {
                toast.error(t("invalidCredentials"))
            },
        })
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
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative flex items-center" >
                                        {seePassword ? (
                                            <EyeOff
                                                className="absolute right-3 h-5 w-5 text-gray-400 cursor-pointer"
                                                onClick={() => setSeePassword(false)}
                                            />
                                        ) : (
                                            <Eye
                                                className="absolute right-3 h-5 w-5 text-gray-400 cursor-pointer"
                                                onClick={() => setSeePassword(true)}
                                            />
                                        )}
                                        <Input
                                            type={seePassword ? "text" : "password"}
                                            placeholder={t("password")}
                                            {...field}
                                            className="lg:h-16 h-14 bg-gray-100 rounded-xs "
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

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
                            disabled={loginMutation.isPending}
                        >
                            {loginMutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                t("login")
                            )}
                        </Button>
                    </div>
                </form>
            </Form>

            {/* Forgot password */}
            <div className="flex justify-end mt-2 mb-5">
                <Link
                    href="/forgot-password"
                    className="text-black/70 hover:underline"
                >
                    {t("forgotPassword")}?
                </Link>
            </div>

            {/* Sign up link */}
            <Button
                type="button"
                variant={'outline'}
                className="w-full text-lg rounded-none h-14 text-black/50"
                hasEffect
                disabled={loginMutation.isPending}
                onClick={() => {
                    router.push('/sign-up')
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
