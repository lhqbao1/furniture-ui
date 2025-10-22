'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import PaymentMethodSelector from '@/components/layout/checkout/method'
import { Textarea } from '@/components/ui/textarea'
import { useCreateAddress, useCreateInvoiceAddress, useUpdateInvoiceAddress } from '@/features/address/hook'
import { toast } from 'sonner'
import { useSyncLocalCart } from '@/features/cart/hook'
import CartTable from '@/components/layout/cart/cart-table'
import { useCreateCheckOut, useCreateCheckOutManual } from '@/features/checkout/hook'
import { useTranslations } from 'next-intl'
import z from 'zod'
import CheckOutInvoiceAddress from '@/components/layout/checkout/invoice-address'
import { useCartLocal } from '@/hooks/cart'
import { useQuery } from '@tanstack/react-query'
import { User } from '@/types/user'
import { getUserById } from '@/features/users/api'
import { getAddressByUserId, getInvoiceAddressByUserId } from '@/features/address/api'
import { getCartItems } from '@/features/cart/api'
import { useCheckMailExist, useLogin, useSignUpGuess } from '@/features/auth/hook'
import { OtpDialog } from '@/components/layout/checkout/otp-dialog'
import { calculateShipping, checkShippingType, normalizeCartItems } from '@/hooks/caculate-shipping'
import BankDialog from '@/components/layout/checkout/bank-dialog'
import ProductSearch from '@/components/shared/product-search'
import { CheckOutUserInformation } from '@/components/layout/checkout/admin-user-information'
import CheckOutShippingAddress from '@/components/layout/checkout/shipping-address'
import CartLocalTable from '@/components/layout/cart/cart-local-table'
import DownloadInvoiceButton from '@/components/layout/pdf/download-invoice-button'
import { AdminManualCreateOrder } from '@/components/layout/admin/orders/order-create/manual-create-order'
import { ProductManual } from '@/components/layout/pdf/manual-invoice'
import { mapToSupplierCarts } from '@/hooks/map-cart-to-supplier'
import { useAtom } from 'jotai'
import { checkOutIdAtom } from '@/store/payment'
import { checkoutDefaultValues, CreateOrderFormValues, CreateOrderSchema } from '@/lib/schema/checkout'
import { manualCheckoutDefaultValues, ManualCreateOrderFormValues, ManualCreateOrderSchema } from '@/lib/schema/manual-checkout'
import ManualCheckOutShippingAddress from '@/components/layout/admin/orders/order-create/shipping-address'

export interface CartItem {
    id: number
    name: string
    color: string
    size: string
    unitPrice: number
    quantity: number
    imageUrl: string
}

export default function CreateCheckoutpage() {
    const [listProducts, setListProducts] = useState<ProductManual[]>([])

    const t = useTranslations()
    const schema = ManualCreateOrderSchema(t)
    const createOrderManualMutation = useCreateCheckOutManual()

    const form = useForm<ManualCreateOrderFormValues>({
        resolver: zodResolver(schema),
        defaultValues: manualCheckoutDefaultValues
    })

    function handleSubmit(values: z.infer<typeof schema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
    }

    return (
        <FormProvider {...form}>
            <form
                onSubmit={form.handleSubmit(
                    (values) => {
                        handleSubmit(values)
                    },
                    (errors) => {
                        console.log(errors)
                        toast.error(t('checkFormError'))
                    }
                )}
                className='flex flex-col gap-8 pb-12'
            >
                <h2 className='section-header'>Create Order</h2>

                {/* Main container */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12'>
                    {/* User information and address */}
                    <div className='col-span-1 space-y-4 lg:space-y-12'>
                        {/* <AdminManualCreateOrder /> */}
                        <CheckOutUserInformation isAdmin />
                        <ManualCheckOutShippingAddress isAdmin />
                        <CheckOutInvoiceAddress isAdmin />
                    </div>

                    {/* Table cart and total */}
                    <div className='col-span-1 space-y-4 lg:space-y-4'>
                        <ProductSearch isAdmin setListProducts={setListProducts} />
                        <div className='flex lg:justify-end justify-center gap-2'>
                            <Button type="submit" className='text-lg lg:w-1/3 w-1/2 py-6'>{t('continue')}</Button>
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    )
}
