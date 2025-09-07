'use client'
import { useGetUserById, useUpdateUser } from '@/features/users/hook'
import React, { useEffect, useState } from 'react'
import AccountSkeleton from './skeleton'
import AccountAvatar from './avatar'
import AccountDetails from './details'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { accountDefaultValues, AccountFormValues, accountSchema } from '@/lib/schema/account'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const AccountForm = () => {
    const [userId, setUserId] = useState<string>("")
    const updateUserMutation = useUpdateUser()

    // SSR-safe: chỉ đọc localStorage sau khi client mounted
    useEffect(() => {
        const storedId = localStorage.getItem("userId")
        if (storedId) setUserId(storedId)
    }, [])

    const { data: user, isLoading, isError } = useGetUserById(userId)

    const form = useForm({
        resolver: zodResolver(accountSchema),
        defaultValues: user || accountDefaultValues,
    })

    useEffect(() => {
        if (user) {
            form.reset(user) // update lại form values khi user có data
        }
    }, [user, form])

    const handleSubmit = (data: AccountFormValues) => {
        if (data.date_of_birth) {
            data.date_of_birth = new Date(data.date_of_birth).toISOString()
        } else {
            data.date_of_birth = null
        }
        // call API update user
        updateUserMutation.mutate({ id: userId, user: data }, {
            onSuccess(data, variables, context) {
                toast.success("User updated successfully")
            },
            onError(error, variables, context) {
                toast.error("Failed to update user")
            },
        })
    }

    if (isLoading) return <AccountSkeleton />
    if (isError) return <div className="text-red-500">❌ Failed to load user data.</div>
    if (!user) return <AccountSkeleton />
    return (
        <FormProvider {...form} >
            <form onSubmit={form.handleSubmit(
                (values) => {
                    handleSubmit(values)
                },
                (errors) => {
                    console.log(errors)
                    toast.error("Please check the form for errors")
                }
            )}>
                <div className="grid grid-cols-12 gap-4 lg:gap-12 py-2 lg:py-6">
                    <div className="col-span-12 lg:col-span-4">
                        <AccountAvatar user={user} />
                    </div>
                    <div className="col-span-12 lg:col-span-8">
                        <AccountDetails user={user} />
                    </div>
                </div>
                {/* Actions */}
                <div className="flex gap-2 justify-end pt-6">
                    <Button variant="destructive" type="button">Delete Account</Button>
                    {/* <Button variant="outline" type="button" className='bg-gray-400 text-white hover:bg-gray-400 hover:text-white'>Cancel</Button> */}
                    <Button type="submit" disabled={updateUserMutation.isPending}>
                        {updateUserMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : 'Submit'}
                    </Button>
                </div>
            </form>
        </FormProvider>

    )
}

export default AccountForm