'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
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
import { useCreatePayment } from '@/features/payment/hook'
import { useAtom } from 'jotai'
import { checkOutIdAtom, paymentIdAtom } from '@/store/payment'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import z from 'zod'
import CheckOutInvoiceAddress from '@/components/layout/checkout/invoice-address'
import { CheckOutPassword } from '@/components/layout/checkout/password'
import { useCartLocal } from '@/hooks/cart'
import { useQuery } from '@tanstack/react-query'
import { User } from '@/types/user'
import { getUserById } from '@/features/users/api'
import { getAddressByUserId, getInvoiceAddressByUserId } from '@/features/address/api'
import { getCartItems } from '@/features/cart/api'
import { useCheckMailExist, useLogin, useLoginOtp, useSignUp, useSignUpGuess } from '@/features/auth/hook'
import { OtpDialog } from '@/components/layout/checkout/otp-dialog'
import { calculateShipping, checkShippingType, normalizeCartItems } from '@/hooks/caculate-shipping'
import BankDialog from '@/components/layout/checkout/bank-dialog'
import ProductSearch from '@/components/shared/product-search'
import { CheckOutUserInformation } from '@/components/layout/checkout/admin-user-information'
import CheckOutShippingAddress from '@/components/layout/checkout/shipping-address'
import CartLocalTable from '@/components/layout/cart/cart-local-table'

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
    const t = useTranslations()

    const { updateStatus } = useCartLocal()

    const CreateOrderSchema = z.object({
        shipping_address_id: z.string().optional(),
        invoice_address_id: z.string().optional(),
        cart_id: z.string().optional(),
        payment_method: z.string().min(1, "You need to choose payment method"),
        note: z.string().optional().nullable(),
        coupon_amount: z.number().optional().nullable(),
        voucher_amount: z.number().optional().nullable(),
        terms: z.boolean().refine(val => val === true),

        first_name: z.string().min(1, { message: t('first_name_required') }),
        last_name: z.string().min(1, { message: t('last_name_required') }),
        invoice_address_line: z.string().min(1, { message: t('last_name_required') }),
        invoice_postal_code: z.string().min(1, { message: t('last_name_required') }),
        invoice_city: z.string().min(1, { message: t('last_name_required') }),
        invoice_address_additional: z.string().optional(),
        shipping_address_additional: z.string().optional(),
        gender: z.string().optional().nullable(),
        email: z
            .string()
            .min(1, t('emailRequired'))
            .email(t('invalidEmail')),
        phone_number: z
            .string()
            .min(6, { message: t('phone_number_short') })
            .refine((val) => /^\+?[0-9]+$/.test(val), {
                message: t('phone_number_invalid'),
            }),

        shipping_address_line: z.string().min(1, { message: t('last_name_required') }),
        shipping_postal_code: z.string().min(1, { message: t('last_name_required') }),
        shipping_city: z.string().min(1, { message: t('last_name_required') }),


        password: z
            .string()
            .optional()
            .refine((val) => !val || val.length >= 8, { message: "Password must be at least 8 characters" })
            .refine((val) => !val || /[a-z]/.test(val), { message: "Password must include a lowercase letter" })
            .refine((val) => !val || /[A-Z]/.test(val), { message: "Password must include an uppercase letter" })
            .refine((val) => !val || /\d/.test(val), { message: "Password must include a number" }),

        confirmPassword: z
            .string()
            .optional()
    }).refine((data) => {
        if (!data.password && !data.confirmPassword) return true; // guest checkout
        return data.password === data.confirmPassword;
    }, {
        message: "Confirm password does not match",
        path: ["confirmPassword"],
    });

    type CreateOrderFormValues = z.infer<typeof CreateOrderSchema>

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
            // Sort theo created_at giảm dần (mới nhất lên trước)
            data.items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            return data
        },
        enabled: !!userId,
        retry: true
    })

    const createCheckOutMutation = useCreateCheckOut()
    const createUserAccountMutation = useSignUpGuess()
    const createInvoiceAddressMutation = useCreateInvoiceAddress()
    const editInvoiceAddressMutation = useUpdateInvoiceAddress()
    const createShippingAddressMutation = useCreateAddress()
    const loginMutation = useLogin()
    const syncLocalCartMutation = useSyncLocalCart();

    const handleOtpSuccess = (verifiedUserId: string) => {
        setUserId(verifiedUserId)
        // ở đây bạn có thể tiếp tục sync cart, redirect, v.v.
    }

    const form = useForm<CreateOrderFormValues>({
        resolver: zodResolver(CreateOrderSchema),
        defaultValues: {
            shipping_address_id: "",
            invoice_address_id: "",
            cart_id: "",
            payment_method: "paypal",
            note: "",
            coupon_amount: 0,
            voucher_amount: 0,
            terms: true,

            first_name: "",
            last_name: "",
            email: "",
            phone_number: "",
            gender: "",

            invoice_address_line: "",
            invoice_postal_code: "",
            invoice_city: "",
            invoice_address_additional: "",


            shipping_address_line: "",
            shipping_postal_code: "",
            shipping_city: "",
            shipping_address_additional: "",

            password: "Guest@12345",
            confirmPassword: "Guest@12345",
        },
    })

    useEffect(() => {
        const defaults: Partial<CreateOrderFormValues> = {}

        if (user) {
            defaults.first_name = user.first_name ?? ""
            defaults.last_name = user.last_name ?? ""
            defaults.email = user.email ?? ""
            defaults.phone_number = user.phone_number ?? ""
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
            }
        }

        if (Object.keys(defaults).length > 0) {
            form.reset({
                ...form.getValues(), // giữ nguyên các field khác
                ...defaults,         // override field có data
            })
        }
    }, [user, invoiceAddress, addresses, form])


    const couponAmount = form.watch('coupon_amount')
    const voucherAmount = form.watch('voucher_amount')

    //Assign cart_id into form values
    useEffect(() => {
        if (cartItems?.id) {
            form.setValue("cart_id", cartItems.id)
        }
        if (invoiceAddress?.id) {
            form.setValue("invoice_address_id", invoiceAddress.id)
        }
    }, [cartItems, invoiceAddress, form])


    const handleSubmit = useCallback(
        async (data: CreateOrderFormValues) => {
            try {
                // Nếu password hoặc confirmPassword rỗng thì gán Guest@12345
                if (!data.password) data.password = "Guest@12345";
                if (!data.confirmPassword) data.confirmPassword = "Guest@12345";
                let userId = user?.id;
                let invoiceAddressId = invoiceAddress?.id;
                const invoiceAddressCountry = invoiceAddress?.country;
                let shippingAddressId = addresses?.find(a => a.is_default)?.id

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
                    localStorage.setItem("userId", newUser.id)

                    // Sync local cart
                    syncLocalCartMutation.mutate()
                    userId = newUser.id
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

                // Đợi cartItems
                if (!cartItems?.id) {
                    const latestCart = await getCartItems()
                    if (!latestCart?.id) {
                        toast.error("Cart not found")
                        return
                    }
                    data.cart_id = latestCart.id
                } else {
                    data.cart_id = cartItems.id
                }

                // Tạo checkout
                await createCheckOutMutation.mutateAsync({
                    ...data,
                    // user_id: userId,
                    invoice_address_id: invoiceAddressId,
                    shipping_address_id: shippingAddressId,

                })
                toast.success("Place order successful")
            } catch (error) {
                toast.error(t('orderFail'))
                console.error(error)
            }
        },
        [user, invoiceAddress, addresses]
    )

    const normalizedItems = normalizeCartItems(cartItems && cartItems.items.length > 0 ? cartItems.items : localCart, cartItems && cartItems.items.length > 0 ? true : false)
    const shippingCost = calculateShipping(normalizedItems)
    const hasOtherCarrier = checkShippingType(normalizedItems)

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
                        <CheckOutUserInformation setUserId={setUserId} isAdmin />
                        <CheckOutShippingAddress isAdmin />
                        <CheckOutInvoiceAddress isAdmin />
                    </div>

                    {/* Table cart and total */}
                    <div className='col-span-1 space-y-4 lg:space-y-4'>
                        <ProductSearch isAdmin />
                        {
                            cartItems ? (<CartTable
                                isLoadingCart={isLoadingCart}
                                cart={
                                    cartItems
                                        ? {
                                            ...cartItems,
                                            items: cartItems.items.filter((item) => item.is_active)
                                        }
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

                        <div className='grid grid-cols-2 gap-6 items-start'>
                            {/*Checkout note and term */}
                            <div className='col-span-2 lg:col-span-1'>
                                <FormField
                                    name='note'
                                    control={form.control}
                                    render={({ field }) => (
                                        <FormItem className='space-y-1 lg:space-y-1'>
                                            <FormLabel className="text-lg font-semibold">{t('note')}</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    className='min-h-20'
                                                    {...field}
                                                    value={field.value ?? ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/*Checkout total */}
                            <div className='text-sm space-y-2 col-span-2 lg:col-span-1'>
                                <div className='grid grid-cols-5'>
                                    <span className='col-span-3 text-right'>{t('subTotalInclude')}</span>
                                    <span className='text-right col-span-2'>
                                        €{(
                                            (cartItems?.items && cartItems.items.length > 0
                                                ? cartItems.items
                                                    .filter((item) => item.is_active)
                                                    .reduce((total, item) => total + item.final_price, 0)
                                                : localCart
                                                    ?.filter((item) => item.is_active)
                                                    .reduce(
                                                        (total, item) => total + (item.item_price ?? 0) * (item.quantity ?? 1),
                                                        0
                                                    )) ?? 0
                                        ).toFixed(2)}
                                    </span>
                                </div>
                                <div className='grid grid-cols-5'>
                                    <span className='col-span-3 text-right'>{hasOtherCarrier ? t('shippingSpedition') : t('shipping')}</span>
                                    <span className='text-right col-span-2'>€{shippingCost}</span>
                                </div>
                                <div className='grid grid-cols-5'>
                                    <span className='col-span-3 text-right'>{t('discount')}</span>
                                    <span className='text-right col-span-2'>€0</span>
                                </div>
                                <div className='grid grid-cols-5 text-xl text-primary font-bold'>
                                    <span className='col-span-3 text-right'>{t('total')}</span>
                                    <span className='text-right col-span-2'>
                                        €{
                                            (
                                                (cartItems?.items && cartItems.items.length > 0
                                                    ? cartItems.items
                                                        .filter((item) => item.is_active === true)
                                                        .reduce((total, item) => total + item.final_price, 0)
                                                    : localCart
                                                        ?.filter((item) => item.is_active === true)
                                                        .reduce(
                                                            (total, item) => total + (item.item_price ?? 0) * (item.quantity ?? 1),
                                                            0
                                                        ) ?? 0) +
                                                shippingCost -
                                                (couponAmount ?? 0) -
                                                (voucherAmount ?? 0)
                                            ).toFixed(2)
                                        }

                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className='space-y-4 py-5 border-y-2'>
                            <div className='font-bold text-base'>{t('selectPayment')}</div>
                            <PaymentMethodSelector />
                        </div>
                        <div className='flex lg:justify-end justify-center'>
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
