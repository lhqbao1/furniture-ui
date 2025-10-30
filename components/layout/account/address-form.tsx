"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { addressDefaultValues, AddressFormValues, addressSchema } from "@/lib/schema/address"
import { useCreateAddress, useCreateInvoiceAddress, useUpdateAddress, useUpdateInvoiceAddress } from "@/features/address/hook"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Address } from "@/types/address"
import { useEffect } from "react"
import { useTranslations } from "next-intl"

interface AddressFormProps {
    setOpen: (open: boolean) => void
    open: boolean
    userId: string
    currentAddress?: Address
    isInvoice?: boolean
}

export default function AddressForm({ setOpen, open, userId, currentAddress, isInvoice }: AddressFormProps) {
    const createAddressMutation = useCreateAddress()
    const updateAddressMutation = useUpdateAddress()
    const createInvoiceAddressMutation = useCreateInvoiceAddress()
    const updateInvoiceAddressMutation = useUpdateInvoiceAddress()
    const t = useTranslations()
    const form = useForm<AddressFormValues>({
        resolver: zodResolver(addressSchema),
        defaultValues: addressDefaultValues,
    })

    useEffect(() => {
        if (currentAddress) {
            form.reset(currentAddress) // update lại form values khi user có data
        }
    }, [currentAddress, form])

    const onSubmit = (data: AddressFormValues) => {
        if (userId) {
            data.user_id = userId
        }

        if (currentAddress && isInvoice === true) {
            // update invoice address
            updateInvoiceAddressMutation.mutate(
                { addressId: currentAddress.id, address: data },
                {
                    onSuccess: () => {
                        toast.success(t('invoiceAddressUpdateSuccess'))
                        form.reset()
                        setOpen(false)
                    },
                    onError: () => {
                        toast.error(t('invoiceAddressUpdateFail'))
                    },
                }
            )
        } else if (currentAddress) {
            // update normal address
            updateAddressMutation.mutate(
                { addressId: currentAddress.id, address: data },
                {
                    onSuccess: () => {
                        toast.success(t('shippingAddressUpdateSuccess'))
                        form.reset()
                        setOpen(false)
                    },
                    onError: () => {
                        toast.error(t('shippingAddressUpdateFail'))
                    },
                }
            )
        } else if (isInvoice) {
            // create invoice address
            createInvoiceAddressMutation.mutate(data, {
                onSuccess: () => {
                    toast.success(t('invoiceAddressCreateSuccess'))
                    form.reset()
                    setOpen(false)
                },
                onError: () => {
                    toast.error(t('invoiceAddressCreateFail'))
                },
            })
        } else {
            // create normal address
            createAddressMutation.mutate(data, {
                onSuccess: () => {
                    toast.success(t('shippingAddressCreateSuccess'))
                    form.reset()
                    setOpen(false)
                },
                onError: () => {
                    toast.error(t('shippingAddressCreateFail'))
                },
            })
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid grid-cols-2 gap-6"
            >
                <FormField
                    control={form.control}
                    name="name_address"
                    render={({ field }) => (
                        <FormItem className="col-span-2 lg:col-span-1">
                            <FormLabel>{t('addressName')}</FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="recipient_name"
                    render={({ field }) => (
                        <FormItem className="col-span-2 lg:col-span-1">
                            <FormLabel>{t('recipient')}</FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                        <FormItem className="col-span-2 lg:col-span-1">
                            <FormLabel>{t('phone_number')}</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="address_line"
                    render={({ field }) => (
                        <FormItem className="col-span-2 lg:col-span-1">
                            <FormLabel>{t('addressLine')}</FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                        <FormItem className="col-span-2 lg:col-span-1">
                            <FormLabel>{t('city')}</FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="postal_code"
                    render={({ field }) => (
                        <FormItem className="col-span-2 lg:col-span-1">
                            <FormLabel>{t('postalCode')}</FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                        <FormItem className="col-span-2 lg:col-span-1">
                            <FormLabel>{t('country')}</FormLabel>
                            <FormControl>
                                <Input placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="col-span-2 flex justify-center">
                    <Button
                        type="button"
                        onClick={() => onSubmit(form.getValues())}
                        className="bg-secondary hover:bg-secondary w-full lg:w-fit"
                        disabled={createAddressMutation.isPending || updateAddressMutation.isPending}
                    >
                        {createAddressMutation.isPending || updateAddressMutation.isPending || createInvoiceAddressMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : t('save')}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
