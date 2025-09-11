"use client"

import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Chrome, Facebook, Mail, Key, Loader2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useLogin, useLoginAdmin } from "@/features/auth/hook"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"
import { useState } from "react"

const formSchema = z.object({
    username: z
        .string()
        .min(1, "Email is required")
        .email("Invalid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .refine((val) => /[a-z]/.test(val), {
            message: "Password must contain at least one lowercase letter",
        })
        .refine((val) => /[A-Z]/.test(val), {
            message: "Password must contain at least one uppercase letter",
        })
        .refine((val) => /\d/.test(val), {
            message: "Password must contain at least one number",
        }),
})

interface LoginFormProps {
    isAdmin?: boolean
}

export default function LoginForm({ isAdmin = false }: LoginFormProps) {
    // const [userId, setUserId] = useAtom(userIdAtom)
    const [seePassword, setSeePassword] = useState(false)
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    })

    const loginMutation = useLogin()
    const loginAdminMutation = useLoginAdmin()

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        if (isAdmin) {
            loginAdminMutation.mutate(values, {
                onSuccess: (data) => {
                    // Giả sử backend trả về token
                    const token = data.access_token
                    localStorage.setItem("admin_access_token", token)
                    router.push("/admin/orders/list")
                    localStorage.setItem("userId", data.id)

                    // Có thể lưu userId nếu cần
                    // setUserId(data.id)
                    toast.success("Logged in successfully")

                },
                onError(error, variables, context) {
                    toast.error(error.message)
                },
            })
        } else {
            loginMutation.mutate(values, {
                onSuccess: (data) => {
                    // Giả sử backend trả về token
                    const token = data.access_token

                    localStorage.setItem("access_token", token)
                    router.push("/")
                    localStorage.setItem("userId", data.id)

                    // Có thể lưu userId nếu cần
                    // setUserId(data.id)
                    toast.success("Logged in successfully")

                },
                onError(error, variables, context) {
                    toast.error(error.message)
                },
            })
        }

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
                <h1 className="text-3xl font-semibold text-secondary text-center font-libre flex gap-2">
                    <span>Welcome to</span>
                    <span className="text-primary">Prestige Home</span>
                </h1>
            </div>

            {/* <h2 className="text-2xl font-bold mb-6 lg:text-start text-center">Log In</h2> */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                        <Input placeholder="Your email" {...field} className="pl-12 py-3 h-fit" />
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

                    <Button
                        type="submit"
                        className="w-full bg-secondary/95 hover:bg-secondary"
                        hasEffect
                        disabled={loginMutation.isPending}
                    >
                        {loginMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : 'Log In'}

                    </Button>
                </form>
            </Form>

            {/* Forgot password */}
            <div className="flex justify-end mt-2">
                <Link href="/forgot-password" className="text-sm text-secondary hover:underline">
                    Forgot password?
                </Link>
            </div>

            {/* Divider */}
            <div className="flex items-center my-6">
                <div className="flex-grow h-px bg-gray-300"></div>
                <span className="px-2 text-sm text-gray-500">or</span>
                <div className="flex-grow h-px bg-gray-300"></div>
            </div>

            {/* Social login */}
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    className="flex-1 flex items-center gap-2 cursor-pointer"
                >
                    <Chrome className="h-5 w-5 text-primary" />
                    Google
                </Button>
                <Button
                    variant="outline"
                    className="flex-1 flex items-center gap-2 cursor-pointer"
                >
                    <Facebook className="h-5 w-5 text-primary " />
                    Facebook
                </Button>
            </div>

            {/* Sign up link */}
            <p className="text-sm text-center mt-6">
                Don’t have an account?{" "}
                <Link href="/sign-up" className="text-secondary font-medium hover:underline">
                    Sign Up
                </Link>
            </p>
        </div>
    )
}
