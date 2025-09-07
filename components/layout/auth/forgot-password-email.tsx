'use client'
import React from 'react'
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
import { useForgotPassword } from '@/features/auth/hook'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

const formSchema = z.object({
    email: z.string().email("Invalid email address"),
})

const ForgotPasswordEmail = () => {
    const router = useRouter()
    const forgotPasswordMutation = useForgotPassword()
    // 1. Define your form.
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
        },
    })

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof formSchema>) {
        forgotPasswordMutation.mutate(values.email, {
            onSuccess: (data) => {
                console.log("Forgot password request successful:", data)
                toast.success("Successful, You will receive password reset instructions.")
                router.push('/reset-password')
            },
            onError: (error) => {
                console.error("Forgot password request failed:", error)
                toast.error("Failed to send reset instructions. Please check you email or try again later.")
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
                    <Button type="submit" className="w-full bg-secondary/95 hover:bg-secondary" disabled={forgotPasswordMutation.isPending} hasEffect>
                        {forgotPasswordMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : 'Submit'}

                    </Button>
                </form>
            </Form>
        </div>

    )
}

export default ForgotPasswordEmail