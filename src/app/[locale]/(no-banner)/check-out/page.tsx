'use client'

import AddressSelector from '@/components/layout/checkout/shipping'
import Image from 'next/image'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import PaymentMethodSelector from '@/components/layout/checkout/method'
import ProductVoucher from '@/components/shared/product-voucher'
import { Textarea } from '@/components/ui/textarea'
import { useCreateAddress, useCreateInvoiceAddress, useGetAddressByUserId, useGetInvoiceAddressByUserId } from '@/features/address/hook'
import { toast } from 'sonner'
import { useGetCartItems, useSyncLocalCart } from '@/features/cart/hook'
import CartTable from '@/components/layout/cart/cart-table'
import { useCreateCheckOut } from '@/features/checkout/hook'
import { useCreatePayment } from '@/features/payment/hook'
import { useAtom } from 'jotai'
import { checkOutIdAtom, paymentIdAtom } from '@/store/payment'
import { useRouter } from 'next/navigation'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import AddressSkeleton from '@/components/layout/checkout/address-skeleton'
import { useTranslations } from 'next-intl'
import { Voucher } from '@/types/voucher'
import z from 'zod'
import CheckOutInvoiceAddress from '@/components/layout/checkout/invoice-address'
import { CheckOutShippingAddress } from '@/components/layout/checkout/shipping-address'
import { CheckOutPassword } from '@/components/layout/checkout/password'
import { useCartLocal } from '@/hooks/cart'
import { useGetUserById } from '@/features/users/hook'
import { useQuery } from '@tanstack/react-query'
import { User } from '@/types/user'
import { getUserById } from '@/features/users/api'
import { getAddressByUserId, getInvoiceAddressByUserId } from '@/features/address/api'
import { getCartItems } from '@/features/cart/api'
import { CartLocalTable } from '@/components/layout/cart/cart-local-table'
import { useCheckMailExist, useLogin, useLoginOtp, useSignUp } from '@/features/auth/hook'
import { OtpDialog } from '@/components/layout/checkout/otp-dialog'

export interface CartItem {
    id: number
    name: string
    color: string
    size: string
    unitPrice: number
    quantity: number
    imageUrl: string
}

export default function CheckOutPage() {
    const [userId, setUserId] = useState<string>("")
    const [isCreatePassword, setIsCreatePassword] = useState<boolean>(false)
    const [paymentId, setPaymentId] = useAtom(paymentIdAtom)
    const [checkout, setCheckOut] = useAtom(checkOutIdAtom)
    const [otpEmail, setOtpEmail] = useState<string>("")
    const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({})
    const [openOtpDialog, setOpenOTPDialog] = useState(false)
    const t = useTranslations()

    const router = useRouter()
    const { updateStatus } = useCartLocal()

    const checkOutBreadcrumb = [
        { label: t('wishlist'), icon: 'wishlist.svg', url: '/wishlist' },
        { label: t('cart'), icon: 'cart.svg', url: '/cart' },
        { label: t('checkout'), icon: 'checkout.svg', url: '/checkout' },
        { label: t('tracking'), icon: 'tracking.svg', url: '/' },
    ]

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
        gender: z.string().min(1, { message: t('gender_required') }),
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


    // SSR-safe: chỉ đọc localStorage sau khi client mounted
    useEffect(() => {
        const storedId = localStorage.getItem("userId")
        if (storedId) setUserId(storedId)
    }, [])

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

    const { cart: localCart, addToCartLocal, updateCart } = useCartLocal();
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
    const createPaymentMutation = useCreatePayment()
    const createUserAccountMutation = useSignUp()
    const createInvoiceAddressMutation = useCreateInvoiceAddress()
    const createShippingAddressMutation = useCreateAddress()
    const loginMutation = useLogin()
    const syncLocalCartMutation = useSyncLocalCart();
    const checkMailExistMutation = useCheckMailExist();
    const loginOtpMutation = useLoginOtp()

    const handleOtpSuccess = (verifiedUserId: string) => {
        setUserId(verifiedUserId)
        // ở đây bạn có thể tiếp tục sync cart, redirect, v.v.
    }


    // const [selectedVoucher, setSelectedVoucher] = useState<number>()

    // const handleSelectVoucher = useCallback((item: number) => {
    //     setSelectedVoucher(item)
    // }, [])

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
            terms: false,

            first_name: "",
            last_name: "",
            invoice_address_line: "",
            invoice_postal_code: "",
            invoice_city: "",
            email: "",
            phone_number: "",
            gender: "",
            invoice_address_additional: "",


            shipping_address_line: "",
            shipping_postal_code: "",
            shipping_city: "",

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
                let userId = user?.id
                let invoiceAddressId = invoiceAddress?.id
                let shippingAddressId = addresses?.find(a => a.is_default)?.id

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
                                password: data.password ? data.password : 'Guest@12345',
                            })
                            userId = newUser.id

                            // Sau khi tạo account thành công → gọi login
                            const loginRes = await loginMutation.mutateAsync({
                                username: data.email,
                                password: data.password ? data.password : 'Guest@12345',
                            })

                            // Lưu token + userId vào localStorage
                            localStorage.setItem("access_token", loginRes.access_token)
                            localStorage.setItem("userId", loginRes.id)

                            // Sync local cart
                            syncLocalCartMutation.mutate()
                            userId = loginRes.id
                        }
                    }
                }

                // Nếu chưa có invoice address thì tạo mới
                if (!invoiceAddressId) {
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
                const checkout = await createCheckOutMutation.mutateAsync({
                    ...data,
                    // user_id: userId,
                    invoice_address_id: invoiceAddressId,
                    shipping_address_id: shippingAddressId,

                })
                toast.success("Place order successful")
                setCheckOut(checkout.id)

                // Tạo payment
                const payment = await createPaymentMutation.mutateAsync({
                    checkout_id: checkout.id,
                })

                toast.success("Place payment successful")
                setPaymentId(payment.payment_id)
                router.push(payment.approve_url)
            } catch (error) {
                toast.error(t('orderFail'))
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
                className='flex flex-col gap-8 section-padding'
            >
                {/* Breadcrumb */}
                {/* <div className='flex justify-center items-center lg:gap-12 gap-3 border-b pb-3'>
                    {checkOutBreadcrumb.map((item, index) => (
                        <Link href={item.url} key={index} className='flex flex-col gap-2 items-center justify-center'>
                            <Image src={`/${item.icon}`} width={50} height={50} alt='' className='size-12' />
                            <div className='font-semibold text-lg text-secondary'>{item.label}</div>
                        </Link>
                    ))}
                </div> */}
                <h2 className='section-header'>{t('order')}</h2>

                {/* Main container */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 lg:px-52 md:px-14 px-4'>

                    {/* Shipping Address */}
                    {/* <div className='col-span-1 space-y-4 lg:space-y-12'>
                        <div className='space-y-4'>
                            <div className='text-base font-semibold'>{t('shippingAddress')}</div>
                            <AddressSelector addresses={addresses ? addresses : []} name="shipping_address_id" />
                        </div>
                        <div className='space-y-4'>
                            <div className='text-base font-semibold'>{t('invoiceAddress')}</div>
                            {!invoiceAddress ? <AddressSkeleton /> :
                                <Card
                                    className={`cursor-pointer transition border-secondary border-2`}
                                >
                                    <CardHeader className="flex items-center gap-2">
                                        <Label
                                            className="text-lg font-semibold cursor-pointer"
                                        >
                                            {invoiceAddress.name_address}
                                        </Label>
                                    </CardHeader>
                                    <CardContent className="text-sm text-muted-foreground space-y-1 pl-7">
                                        <p>{invoiceAddress.address_line}</p>
                                        <p>{invoiceAddress.city}</p>
                                        <p>{invoiceAddress.country}</p>
                                        {invoiceAddress.recipient_name && (
                                            <p>Recipient: {invoiceAddress.recipient_name}</p>
                                        )}
                                        {invoiceAddress.phone_number && <p>{invoiceAddress.phone_number}</p>}
                                    </CardContent>
                                </Card>
                            }
                        </div>

                        <PaymentMethodSelector />
                    </div> */}
                    <div className='col-span-1 space-y-4 lg:space-y-12'>
                        <CheckOutShippingAddress />
                        <CheckOutInvoiceAddress />
                        {userId ? '' : <CheckOutPassword isCreatePassword={isCreatePassword} setIsCreatePassword={setIsCreatePassword} />}
                    </div>

                    {/* Table cart and total */}
                    <div className='col-span-1 space-y-4 lg:space-y-4'>
                        {/* <CartTable
                            cart={
                                cartItems
                                    ? {
                                        ...cartItems,
                                        items: cartItems.items.filter((item) => item.is_active)
                                    }
                                    : undefined
                            }
                            isLoadingCart={isLoadingCart}
                            isCheckout
                            localQuantities={localQuantities}
                            setLocalQuantities={setLocalQuantities}
                        /> */}

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

                        {/* <div className='space-y-3'>
                            <div className="text-lg font-semibold">{t('selectVoucher')}</div>
                            <div className='lg:flex lg:flex-row grid grid-cols-1 gap-2'>
                                {vouchers.map((item, index) => {
                                    return (
                                        <ProductVoucher item={item} key={index} isSelected={selectedVoucher === item.id} onSelect={() => handleSelectVoucher(item.id)} />
                                    )
                                })}
                            </div>
                        </div> */}

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
                                    <span className='col-span-3 text-right'>{t('shipping')}</span>
                                    <span className='text-right col-span-2'>€5.95</span>
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
                                                5.95 -
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
                        <FormField
                            control={form.control}
                            name="terms" // chỉ dùng cho validation, không map vào schema gửi lên backend
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex flex-row gap-2 mt-4 items-center">
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={(checked) => field.onChange(checked)}
                                        />
                                        <FormLabel className="text-sm flex flex-row">
                                            <span className='space-x-2'>
                                                {t('byPlacing')}
                                                <span className='pl-2'>
                                                    <Link href="/policy" className="text-secondary underline">
                                                        {t('termCondition')}
                                                    </Link>
                                                </span>
                                            </span>
                                        </FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />
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
            </form>
        </FormProvider>
    )
}
