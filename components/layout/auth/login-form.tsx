"use client"

import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Chrome, Facebook, Mail, Key } from "lucide-react"
import Link from "next/link"

const formSchema = z.object({
    email: z
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

export default function LoginForm() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log("Login:", values)
        // TODO: gọi API login hoặc next-auth
    }

    return (
        <div className="p-6 bg-white rounded-2xl lg:w-3/4 w-full">
            <h2 className="text-2xl font-bold mb-6 lg:text-start text-center">Log In</h2>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="email"
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
                                        <Input type="password" placeholder="Password" {...field} className="pl-12 py-3 h-fit" />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full bg-secondary/95 hover:bg-secondary" hasEffect>
                        Log In
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
                <Link href="/signup" className="text-secondary font-medium hover:underline">
                    Sign Up
                </Link>
            </p>
        </div>
    )
}
