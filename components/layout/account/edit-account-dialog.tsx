"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ChevronDownIcon, Loader2 } from "lucide-react"
import { accountDefaultValues, AccountFormValues, accountSchema } from "@/lib/schema/account"
import { useUpdateUser } from "@/features/users/hook"
import { User } from "@/types/user"
import { useTranslations } from "next-intl"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface EditUserDialogProps {
    setOpen: (open: boolean) => void
    open: boolean
    currentUser?: User
}

export default function EditUserDialog({ setOpen, open, currentUser }: EditUserDialogProps) {
    const updateUserMutation = useUpdateUser()
    const t = useTranslations()
    const form = useForm<AccountFormValues>({
        resolver: zodResolver(accountSchema),
        defaultValues: currentUser ? currentUser : accountDefaultValues
    })

    useEffect(() => {
        if (currentUser) {
            form.reset(currentUser)
        }
    }, [currentUser, form])

    const handleSubmit = (data: AccountFormValues) => {
        updateUserMutation.mutate({
            id: currentUser?.id ?? '',
            user: {
                ...data,
                avatar_url: data.avatar_url || undefined,
                date_of_birth: data.date_of_birth ?? undefined, // chuyển null thành undefined
            }
        }, {
            onSuccess(data, variables, context) {
                toast.success(t('updateUserSuccess'))
                setOpen(false)
            },
            onError(error, variables, context) {
                toast.error(t('updateUserError'))
            },
        })
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(
                (values) => {
                    handleSubmit(values)
                },
                (errors) => {
                    toast.error("Please check the form for errors")
                }
            )}
                className="grid grid-cols-2 gap-6"
            >
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('email')}</FormLabel>
                            <FormControl>
                                <Input type="email" {...field} />
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
                            <FormLabel>{t('phone_number')}</FormLabel>
                            <FormControl>
                                <Input type="tel" {...field} />
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
                            <FormLabel>{t('first_name')}</FormLabel>
                            <FormControl>
                                <Input type="text" {...field} />
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
                            <FormLabel>{t('last_name')}</FormLabel>
                            <FormControl>
                                <Input type="text" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="col-span-2 flex justify-center">
                    <Button type="submit" disabled={updateUserMutation.isPending}>
                        {updateUserMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : <div>{t('submit')}</div>}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
