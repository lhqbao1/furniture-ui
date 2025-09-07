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

interface AccountDetailsProps {
    user: User
}

const AccountDetails = ({ user }: AccountDetailsProps) => {
    const form = useFormContext()
    const [openAddressDialog, setOpenAddressDialog] = useState(false)
    const { data: invoiceAddress, isLoading, isError } = useGetInvoiceAddressByUserId(user.id)

    return (
        <div className='space-y-6' >
            <div className="grid grid-cols-2 gap-4">
                <FormField name="first_name" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="last_name" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>


            <div className="grid grid-cols-2 gap-4">
                <FormField name="email" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input type="email" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="phone_number" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>

            {/* Addresses */}
            <div className='space-y-4'>
                <div className='flex gap-3 items-center'>
                    <span>Shipping Address</span>
                    <div className="flex justify-center items-center">
                        <Dialog open={openAddressDialog} onOpenChange={setOpenAddressDialog}>
                            <Button onClick={() => setOpenAddressDialog(true)} type='button' className="bg-secondary hover:bg-secondary">Add shipping address</Button>
                            <DialogContent className='lg:w-[800px]'>
                                <DialogHeader>
                                    <DialogTitle>Add Shipping Address</DialogTitle>
                                    <AddressForm setOpen={setOpenAddressDialog} open={openAddressDialog} userId={user.id} />
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                <AddressList userId={user.id} />
            </div>


            <div className='space-y-4'>
                <div className='flex gap-3 items-center'>
                    <span>Invoice Address</span>
                    {!invoiceAddress ?
                        <div className="flex justify-center items-center">
                            <Dialog open={openAddressDialog} onOpenChange={setOpenAddressDialog}>
                                <Button onClick={() => setOpenAddressDialog(true)} type='button' className="bg-secondary hover:bg-secondary">Add invoice address</Button>
                                <DialogContent className='lg:w-[800px]'>
                                    <DialogHeader>
                                        <DialogTitle>Add Invoice Address</DialogTitle>
                                        <AddressForm setOpen={setOpenAddressDialog} open={openAddressDialog} userId={user.id} isInvoice />
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
                <FormField name="language" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Language</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField name="date_of_birth" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
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
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="mb-0">Receive Promotions</FormLabel>
                </FormItem>
            )} />
        </div >
    )
}

export default AccountDetails