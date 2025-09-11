"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import PhoneInput from "react-phone-input-2"
import "react-phone-input-2/lib/style.css"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useSignUp } from "@/features/auth/hook"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Eye, EyeOff, Key, Loader2 } from "lucide-react"

const formSchema = z.object({
  email: z.string().email("Invalid email"),
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  phone_number: z.string().min(6, "Invalid phone"),
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
  confirmPassword: z.string().min(1, "Confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export default function SignUpForm() {
  const [seePassword, setSeePassword] = React.useState(false)

  const signUp = useSignUp()
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    signUp.mutate({
      email: values.email,
      password: values.password,
      phone_number: values.phone_number,
      first_name: values.first_name,
      last_name: values.last_name
    }, {
      onSuccess: (data) => {
        form.reset()
        toast.success("Sign up successful! Please log in.")
        router.push("/login")
      },
      onError: (error) => {
        toast.error("Failed to sign up. Please try again.")
      }
    })
  }

  return (
    <div className="w-full mt-10 p-20">
      <div className="flex flex-col items-center mb-12 gap-3">
        {/* Logo giả */}
        <Image
          src={'/new-logo.svg'}
          width={100}
          height={100}
          alt=""
          unoptimized
        />
        <h1 className="text-3xl font-semibold text-secondary text-center font-libre flex gap-1">
          <span>Welcome to</span>
          <span className="text-primary">Prestige Home</span>
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile</FormLabel>
                <FormControl>
                  <PhoneInput
                    country={'de'} // default Germany
                    value={field.value}
                    onChange={(phone) => field.onChange(phone)}
                    inputStyle={{ fontSize: '16px', borderRadius: 6, boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", borderColor: '#e5e5e5' }}
                  />
                  {/* <Input placeholder="+49" {...field} /> */}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="">First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
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
                <FormLabel>Password</FormLabel>
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
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
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

          <div className="col-span-1 md:col-span-2 flex justify-center mt-4">
            <Button type="submit" className="bg-primary/90 hover:bg-primary lg:px-12 px-4 py-6 text-lg" hasEffect>
              {signUp.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : 'Create Account'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
