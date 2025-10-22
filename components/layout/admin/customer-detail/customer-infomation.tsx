'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { formatDateTime } from '@/lib/date-formated'
import { useUpdateUser, useUpdateUserAdmin } from '@/features/users/hook'
import { Customer } from '@/types/user'

// 🧩 Zod schema
const customerSchema = z.object({
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phone_number: z.string().min(1, 'Phone number is required'),
    language: z.string().min(1, 'Language is required'),
})

type CustomerFormValues = z.infer<typeof customerSchema>

interface CustomerInformationProps extends CustomerFormValues {
    created_at: string
    currentUser: Customer
    user_code: string
}

const CustomerInformation = ({
    first_name,
    last_name,
    email,
    phone_number,
    language,
    user_code,
    created_at,
    currentUser
}: CustomerInformationProps) => {
    const [isEditing, setIsEditing] = useState(false)
    const updateCustomer = useUpdateUserAdmin()

    const form = useForm<CustomerFormValues>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            first_name,
            last_name,
            email,
            phone_number,
            language,
        },
    })

    const handleSendMail = () => {
        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`
        window.open(gmailUrl, '_blank')
    }

    const onSubmit = async (data: CustomerFormValues) => {
        await updateCustomer.mutateAsync({
            id: currentUser.id,
            user: {
                ...currentUser,
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                phone_number: data.phone_number,
                language: data.language
            }
        })
        setIsEditing(false)
    }

    return (
        <div className="px-4 py-3 border rounded-xl space-y-3">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <div className='space-y-2'>
                        <FormLabel>Customer ID</FormLabel>
                        <div className="border rounded-md p-2 text-sm text-muted-foreground">
                            {user_code}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="first_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First name</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={!isEditing}
                                            {...field}
                                        />
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
                                    <FormLabel>Last name</FormLabel>
                                    <FormControl>
                                        <Input
                                            disabled={!isEditing}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <div className="flex items-center gap-2">
                                    <FormControl>
                                        <Input
                                            disabled={!isEditing}
                                            {...field}
                                        />
                                    </FormControl>
                                    <Mail
                                        onClick={handleSendMail}
                                        className="w-4 h-4 cursor-pointer text-secondary"
                                    />
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone number</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={!isEditing}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="language"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Language</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={!isEditing}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className='space-y-2'>
                        <FormLabel>Joined at</FormLabel>
                        <div className="border rounded-md p-2 text-sm text-muted-foreground">
                            {formatDateTime(new Date(created_at))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3">
                        {isEditing ? (
                            <>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    disabled={updateCustomer.isPending}
                                    onClick={() => {
                                        form.reset()
                                        setIsEditing(false)
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {updateCustomer.isPending ? <Loader2 className="animate-spin" /> : 'Save'}
                                </Button>
                            </>
                        ) : (
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setIsEditing(true)}
                            >
                                Edit
                            </Button>
                        )}
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default CustomerInformation
