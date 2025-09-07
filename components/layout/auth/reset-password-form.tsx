'use client'
import React, { useState } from 'react'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForgotPassword, useResetPassword } from '@/features/auth/hook'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { OtpInput } from './otp-input'

const formSchema = z.object({
    email: z.string().email("Invalid email address"),
    code: z.string().min(6, "Code must be at least 6 characters long"),
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

const ResetPasswordForm = () => {
    const router = useRouter()
    const [showPass, setShowPass] = useState(false)
    const resetPasswordMutation = useResetPassword()

    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            code: "",
            password: "",
        },
    })

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        resetPasswordMutation.mutate({ email: values.email, code: values.code, new_password: values.password }, {
            onSuccess: (data) => {
                toast.success("Successful, Please login with your new password.")
                router.push('/login')
            },
            onError: (error) => {
                toast.error("Failed to reset password. Please check your inputs or try again later.")
            },
        })
    }

    return (
        <div className="p-6 bg-white rounded-2xl lg:w-3/4 w-full">
            <h2 className="text-2xl font-bold mb-6 lg:text-start text-center">Reset Password</h2>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your email</FormLabel>
                                <FormControl>
                                    <Input placeholder="example@gmail.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>OTP</FormLabel>
                                <FormControl>
                                    <OtpInput value={field.value} onChange={field.onChange} />
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
                                <FormLabel>New password</FormLabel>
                                <FormControl>
                                    <div className='relative'>
                                        <Input type={showPass ? 'text' : 'password'} placeholder="" {...field} />
                                        <Button type="button" variant="link" className="absolute top-0 right-0 text-secondary" onClick={() => setShowPass(!showPass)}>
                                            {showPass ? <EyeOff /> : <Eye />}
                                        </Button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full bg-secondary/95 hover:bg-secondary" hasEffect>
                        {resetPasswordMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : 'Submit'}

                    </Button>
                </form>
            </Form>
        </div>

    )
}

export default ResetPasswordForm