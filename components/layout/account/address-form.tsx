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
                        toast.success("Invoice address updated successfully")
                        form.reset()
                        setOpen(false)
                    },
                    onError: () => {
                        toast.error("Failed to update invoice address")
                    },
                }
            )
        } else if (currentAddress) {
            // update normal address
            updateAddressMutation.mutate(
                { addressId: currentAddress.id, address: data },
                {
                    onSuccess: () => {
                        toast.success("Address updated successfully")
                        form.reset()
                        setOpen(false)
                    },
                    onError: () => {
                        toast.error("Failed to update address")
                    },
                }
            )
        } else if (isInvoice) {
            // create invoice address
            createInvoiceAddressMutation.mutate(data, {
                onSuccess: () => {
                    toast.success("Invoice address created successfully")
                    form.reset()
                    setOpen(false)
                },
                onError: () => {
                    toast.error("Failed to create invoice address")
                },
            })
        } else {
            // create normal address
            createAddressMutation.mutate(data, {
                onSuccess: () => {
                    toast.success("Address created successfully")
                    form.reset()
                    setOpen(false)
                },
                onError: () => {
                    toast.error("Failed to create address")
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
                        <FormItem>
                            <FormLabel>Address Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Home / Office" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="recipient_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Recipient Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Full name" {...field} />
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
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="address_line"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address Line</FormLabel>
                            <FormControl>
                                <Input placeholder="Street, Building, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                                <Input placeholder="City" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                                <Input placeholder="State" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="postal_code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Postal Code</FormLabel>
                            <FormControl>
                                <Input placeholder="Postal code" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                                <Input placeholder="Country" {...field} />
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
                        ) : 'Save Address'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}
