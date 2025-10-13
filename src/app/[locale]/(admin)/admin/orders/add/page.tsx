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
import { useCreateCheckOut } from '@/features/checkout/hook'
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
    const [userId, setUserId] = useState<string>("")
    const [otpEmail, setOtpEmail] = useState<string>("")
    const [openBankDialog, setOpenBankDialog] = useState(false)
    const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({})
    const [openOtpDialog, setOpenOTPDialog] = useState(false)
    const [listProducts, setListProducts] = useState<ProductManual[]>([])
    const [checkout, setCheckOut] = useAtom(checkOutIdAtom)
    const t = useTranslations()
    const schema = CreateOrderSchema(t)
    const { updateStatus } = useCartLocal()


    const { data: user } = useQuery<User>({
        queryKey: ["user", userId],
        queryFn: () => getUserById(userId),
        enabled: !!userId,
    })

    const { data: addresses } = useQuery({
        queryKey: ["address-by-user", userId],
        queryFn: () => getAddressByUserId(userId),
        retry: false,
        enabled: !!userId,
    })

    const { data: invoiceAddress } = useQuery({
        queryKey: ["invoice-address-by-user", userId],
        queryFn: () => getInvoiceAddressByUserId(userId),
        retry: false,
        enabled: !!userId,
    })

    const { cart: localCart } = useCartLocal();
    const { data: cartItems, isLoading: isLoadingCart } = useQuery({
        queryKey: ["cart-items", userId],
        queryFn: async () => {
            const data = await getCartItems()
            // Có thể sort theo thời gian tạo của từng giỏ hàng nếu cần
            data.sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
            return data
        },
        enabled: !!userId,
        retry: false
    })

    const createCheckOutMutation = useCreateCheckOut()
    const createUserAccountMutation = useSignUpGuess()
    const createInvoiceAddressMutation = useCreateInvoiceAddress()
    const editInvoiceAddressMutation = useUpdateInvoiceAddress()
    const createShippingAddressMutation = useCreateAddress()
    const loginMutation = useLogin()
    const syncLocalCartMutation = useSyncLocalCart();
    const checkMailExistMutation = useCheckMailExist();


    const hasServerCart = Array.isArray(cartItems) && cartItems.length > 0;

    const normalizedItems = normalizeCartItems(
        hasServerCart
            ? cartItems.flatMap((group) => group.items)
            : localCart,
        hasServerCart
    );

    const shippingCost = calculateShipping(normalizedItems)
    const hasOtherCarrier = checkShippingType(normalizedItems)

    const handleOtpSuccess = (verifiedUserId: string) => {
        setUserId(verifiedUserId)
        // ở đây bạn có thể tiếp tục sync cart, redirect, v.v.
    }

    const form = useForm<CreateOrderFormValues>({
        resolver: zodResolver(schema),
        defaultValues: checkoutDefaultValues,
    })

    useEffect(() => {
        const defaults: Partial<CreateOrderFormValues> = {}

        if (user) {
            defaults.first_name = user.first_name ?? ""
            defaults.last_name = user.last_name ?? ""
            defaults.email = user.email ?? ""
        }

        if (invoiceAddress) {
            defaults.invoice_address_line = invoiceAddress.address_line ?? ""
            defaults.invoice_postal_code = invoiceAddress.postal_code ?? ""
            defaults.invoice_city = invoiceAddress.city ?? ""
            defaults.invoice_address_id = invoiceAddress.id
        }

        if (addresses && addresses.length > 0) {
            const shippingAddress = addresses.find(a => a.is_default)

            if (shippingAddress) {
                defaults.shipping_address_line = shippingAddress.address_line ?? ""
                defaults.shipping_postal_code = shippingAddress.postal_code ?? ""
                defaults.shipping_city = shippingAddress.city ?? ""
                defaults.shipping_address_id = shippingAddress.id
                defaults.phone_number = shippingAddress.phone_number ?? ""
            }
        }

        if (Object.keys(defaults).length > 0) {
            form.reset({
                ...form.getValues(),
                ...defaults,
            })
        }
    }, [user, invoiceAddress, addresses, form])


    //Assign cart_id into form values
    useEffect(() => {
        if (invoiceAddress?.id) {
            form.setValue("invoice_address_id", invoiceAddress.id)
        }
    }, [cartItems, invoiceAddress, form])


    const handleSubmit = useCallback(
        async (data: CreateOrderFormValues) => {
            try {
                let userId = user?.id
                let invoiceAddressId = invoiceAddress?.id
                let shippingAddressId = addresses?.find(a => a.is_default)?.id
                const invoiceAddressCountry = invoiceAddress?.country;

                if (data.email && !userId) {
                    const exists = await checkMailExistMutation.mutateAsync(data.email)

                    if (!exists) {
                        // Email đã tồn tại -> yêu cầu xác minh OTP
                        setOtpEmail(data.email)
                        setOpenOTPDialog(true)
                        return
                    } else {
                        // Nếu chưa có user thì tạo mới
                        if (!userId) {
                            const newUser = await createUserAccountMutation.mutateAsync({
                                first_name: data.first_name,
                                last_name: data.last_name,
                                email: data.email,
                                phone_number: data.phone_number,
                            })
                            userId = newUser.id

                            // Lưu token + userId vào localStorage
                            localStorage.setItem("access_token", newUser.access_token)
                            localStorage.setItem("userIdGuest", newUser.id)

                            // Sync local cart
                            syncLocalCartMutation.mutate()
                        }
                    }
                }

                // Nếu chưa có invoice address thì tạo mới
                if (!invoiceAddressCountry || invoiceAddressCountry === "" || !invoiceAddressId) {
                    const newInvoice = await createInvoiceAddressMutation.mutateAsync({
                        user_id: userId ?? '',
                        recipient_name: data.first_name + data.last_name,
                        postal_code: data.invoice_postal_code,
                        phone_number: data.phone_number,
                        address_line: data.invoice_address_line,
                        city: data.invoice_city,
                        country: data.invoice_city,
                        name_address: "Invoice",
                        state: data.invoice_city
                    })
                    invoiceAddressId = newInvoice.id
                } else {
                    if (data.invoice_address_line !== invoiceAddress?.address_line ||
                        data.invoice_postal_code !== invoiceAddress?.postal_code ||
                        data.invoice_city !== invoiceAddress?.city ||
                        data.phone_number !== invoiceAddress?.phone_number) {
                        const newInvoice = await editInvoiceAddressMutation.mutateAsync({
                            addressId: invoiceAddressId,
                            address: {
                                user_id: userId ?? '',
                                recipient_name: data.first_name + data.last_name,
                                postal_code: data.invoice_postal_code,
                                phone_number: data.phone_number,
                                address_line: data.invoice_address_line,
                                city: data.invoice_city,
                                country: data.invoice_city,
                                name_address: "Invoice",
                                state: data.invoice_city
                            }
                        })
                        invoiceAddressId = newInvoice.id
                    }
                }

                // Nếu chưa có shipping address thì tạo mới
                if (!shippingAddressId) {
                    const newShipping = await createShippingAddressMutation.mutateAsync({
                        user_id: userId ?? '',
                        recipient_name: data.first_name + data.last_name,
                        postal_code: data.invoice_postal_code,
                        phone_number: data.phone_number,
                        address_line: data.invoice_address_line,
                        city: data.shipping_city,
                        country: data.shipping_city,
                        name_address: "Rechnung",
                        is_default: true,
                        state: data.shipping_city
                    })
                    shippingAddressId = newShipping.id
                } else {
                    if (data.shipping_address_line !== addresses?.find(a => a.is_default)?.address_line ||
                        data.shipping_postal_code !== addresses?.find(a => a.is_default)?.postal_code ||
                        data.shipping_city !== addresses?.find(a => a.is_default)?.city ||
                        data.phone_number !== addresses?.find(a => a.is_default)?.phone_number) {

                        const newShipping = await createShippingAddressMutation.mutateAsync({
                            user_id: userId ?? '',
                            recipient_name: data.first_name + data.last_name,
                            postal_code: data.shipping_postal_code,
                            phone_number: data.phone_number,
                            address_line: data.shipping_address_line,
                            city: data.shipping_city,
                            country: data.shipping_city,
                            name_address: "Rechnung",
                            is_default: true,
                            state: data.shipping_city
                        })
                        shippingAddressId = newShipping.id
                    }
                }

                // // Tạo checkout
                const checkout = await createCheckOutMutation.mutateAsync({
                    ...data,
                    invoice_address_id: invoiceAddressId,
                    shipping_address_id: shippingAddressId,
                    supplier_carts: mapToSupplierCarts(cartItems ?? []),
                    note: data.note,
                    total_shipping: shippingCost
                })
                toast.success(t('orderSuccess'))
                setCheckOut(checkout.id)

            } catch (error) {
                toast.error(t('orderFail'))
                // localStorage.removeItem("userIdGuest")
                // localStorage.removeItem("access_token")
                form.reset()
                console.error(error)
            }
        },
        [user, invoiceAddress, addresses]
    )


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
                        <CheckOutUserInformation setUserId={setUserId} isAdmin />
                        <CheckOutShippingAddress isAdmin />
                        <CheckOutInvoiceAddress isAdmin />
                    </div>

                    {/* Table cart and total */}
                    <div className='col-span-1 space-y-4 lg:space-y-4'>
                        <ProductSearch isAdmin setListProducts={setListProducts} />
                        {
                            cartItems ? (<CartTable
                                isLoadingCart={isLoadingCart}
                                cart={
                                    cartItems
                                        ? cartItems.map((group) => ({
                                            ...group,
                                            items: group.items.filter((item) => item.is_active),
                                        }))
                                        : undefined
                                }
                                localQuantities={localQuantities}
                                setLocalQuantities={setLocalQuantities}
                                isCheckout
                            />) :
                                (
                                    <CartLocalTable
                                        data={localCart}
                                        onToggleItem={(product_id, is_active) =>
                                            updateStatus({ product_id, is_active })
                                        }
                                        onToggleAll={(is_active) => {
                                            localCart.forEach(item => updateStatus({ product_id: item.product_id, is_active }))
                                        }}
                                        isCheckout
                                    />
                                )
                        }

                        <div className='space-y-4 py-5 border-y-2'>
                            <div className='font-bold text-base'>{t('selectPayment')}</div>
                            <PaymentMethodSelector />
                        </div>
                        <div className='flex lg:justify-end justify-center gap-2'>
                            <Button type="submit" className='text-lg lg:w-1/3 w-1/2 py-6'>{t('continue')}</Button>
                        </div>
                    </div>
                </div>

                <OtpDialog
                    open={openOtpDialog}
                    onOpenChange={setOpenOTPDialog}
                    email={otpEmail}
                    onSuccess={handleOtpSuccess}
                />

                <BankDialog
                    open={openBankDialog}
                    onOpenChange={setOpenBankDialog}
                />
            </form>
        </FormProvider>
    )
}
