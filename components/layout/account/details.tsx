'use client'
import React, { useState } from 'react'
import { useFormContext } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { User } from '@/types/user'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import AddressForm from './address-form'
import AddressList from './address-list'
import { useGetInvoiceAddressByUserId } from '@/features/address/hook'
import InvoiceAddress from './invoice-address'
import { useTranslations } from 'next-intl'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AccountDetailsProps {
    user: User
}

const AccountDetails = ({ user }: AccountDetailsProps) => {
    const t = useTranslations()
    const form = useFormContext()
    const [openAddressDialog, setOpenAddressDialog] = useState(false)
    const { data: invoiceAddress, isLoading, isError } = useGetInvoiceAddressByUserId(user.id)

    return (
        <div className='space-y-6' >
            <div className="grid grid-cols-2 gap-4">
                <FormField name="first_name" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('firstName')}</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="last_name" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('lastName')}</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>


            <div className="grid grid-cols-2 gap-4">
                <FormField name="email" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('email')}</FormLabel>
                        <FormControl><Input type="email" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="phone_number" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('phone')}</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>

            {/* Addresses */}
            <div className='space-y-4'>
                <div className='flex gap-3 items-center'>
                    <span>{t('shippingAddress')}</span>
                    <div className="flex justify-center items-center">
                        <Dialog open={openAddressDialog} onOpenChange={setOpenAddressDialog}>
                            <Button onClick={() => setOpenAddressDialog(true)} type='button' className="bg-secondary hover:bg-secondary">{t('addShippingAddress')}</Button>
                            <DialogContent className='lg:w-[800px]'>
                                <DialogHeader>
                                    <DialogTitle>{t('addShippingAddress')}</DialogTitle>
                                    <AddressForm setOpen={setOpenAddressDialog} open={openAddressDialog} userId={user.id} />
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                <AddressList userId={user.id} />
            </div>


            <div className='space-y-4 lg:w-1/2'>
                <div className='flex gap-3 items-center'>
                    <span>{t('invoiceAddress')}</span>
                    {!invoiceAddress ?
                        <div className="flex justify-center items-center">
                            <Dialog open={openAddressDialog} onOpenChange={setOpenAddressDialog}>
                                <Button onClick={() => setOpenAddressDialog(true)} type='button' className="bg-secondary hover:bg-secondary">{t('addInvoiceAddress')}</Button>
                                <DialogContent className='lg:w-[800px]'>
                                    <DialogHeader>
                                        <DialogTitle>{t('addInvoiceAddress')}</DialogTitle>
                                        <AddressForm setOpen={setOpenAddressDialog} open={openAddressDialog} userId={user.id} isInvoice={true} />
                                    </DialogHeader>
                                </DialogContent>
                            </Dialog>
                        </div>
                        : ''}
                </div>
                <InvoiceAddress userId={user.id} />
            </div>

            {/* Preferences */}
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t('language')}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger className='border'>
                                        <SelectValue placeholder="Select language" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="en">{t('english')}</SelectItem>
                                    <SelectItem value="de">{t('german')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField name="date_of_birth" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>{t('dateOfBirth')}</FormLabel>
                        <FormControl>
                            <Input type="date" {...field} value={field.value ?? ''} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>

            {/* Notifications */}
            <FormField name="promotions" control={form.control} render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} className='data-[state=checked]:bg-gray-400' /></FormControl>
                    <FormLabel className="mb-0">{t('receivePromotions')}</FormLabel>
                </FormItem>
            )} />
        </div >
    )
}

export default AccountDetails