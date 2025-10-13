'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Textarea } from '@/components/ui/textarea'
import { useCreateAddress, useCreateInvoiceAddress, useUpdateInvoiceAddress } from '@/features/address/hook'
import { toast } from 'sonner'
import { useSyncLocalCart } from '@/features/cart/hook'
import { useCreateCheckOut } from '@/features/checkout/hook'
import { useCreatePayment } from '@/features/payment/hook'
import { useAtom } from 'jotai'
import { checkOutIdAtom, paymentIdAtom } from '@/store/payment'
import { Checkbox } from '@/components/ui/checkbox'
import { useLocale, useTranslations } from 'next-intl'
// import CheckOutInvoiceAddress from '@/components/layout/checkout/invoice-address'
import { useCartLocal } from '@/hooks/cart'
import { useQuery } from '@tanstack/react-query'
import { User } from '@/types/user'
import { getUserById } from '@/features/users/api'
import { getAddressByUserId, getInvoiceAddressByUserId } from '@/features/address/api'
import { getCartItems } from '@/features/cart/api'
// import { CartLocalTable } from '@/components/layout/cart/cart-local-table'
import { useCheckMailExist, useSignUpGuess } from '@/features/auth/hook'
import { OtpDialog } from '@/components/layout/checkout/otp-dialog'
// import { CheckOutUserInformation } from '@/components/layout/checkout/user-information'
import { calculateShipping, checkShippingType, normalizeCartItems } from '@/hooks/caculate-shipping'
import BankDialog from '@/components/layout/checkout/bank-dialog'
import dynamic from 'next/dynamic'
import { SectionSkeleton } from '@/components/layout/checkout/section-skeleton'
import StripeLayout from '@/components/shared/stripe/stripe'
import { Loader2 } from 'lucide-react'
import { Link, useRouter } from '@/src/i18n/navigation'
import { checkoutDefaultValues, CreateOrderFormValues, CreateOrderSchema } from '@/lib/schema/checkout'
import { mapToSupplierCarts } from '@/hooks/map-cart-to-supplier'
const CartTable = dynamic(() => import('@/components/layout/cart/cart-table'), { ssr: false })
const CartLocalTable = dynamic(() => import('@/components/layout/cart/cart-local-table'), { ssr: false })


const CheckOutShippingAddress = dynamic(
    () => import('@/components/layout/checkout/shipping-address').then(m => m.default),
    {
        ssr: false,
        loading: () => <SectionSkeleton />
    }
)
const CheckOutUserInformation = dynamic(
    () => import('@/components/layout/checkout/user-information').then(m => m.default),
    {
        ssr: false,
        loading: () => <SectionSkeleton />
    }
)


const CheckOutInvoiceAddress = dynamic(
    () => import('@/components/layout/checkout/invoice-address').then(m => m.default),
    {
        ssr: false,
        loading: () => <SectionSkeleton />
    }
)
export interface CartItem {
    id: number
    name: string
    color: string
    size: string
    unitPrice: number
    quantity: number
    imageUrl: string
}

export const metadata = {
    robots: {
        index: false,
        follow: false,
        nocache: true,
    },
}

export default function CheckOutPageClient() {
    const [userId, setUserId] = useState<string>("")
    const [userIdLogin, setUserIdLogin] = useState<string>("")
    const [paymentId, setPaymentId] = useAtom(paymentIdAtom)
    const [checkout, setCheckOut] = useAtom(checkOutIdAtom)
    const [otpEmail, setOtpEmail] = useState<string>("")
    const [openBankDialog, setOpenBankDialog] = useState(false)
    const [localQuantities, setLocalQuantities] = useState<Record<string, number>>({})
    const [openOtpDialog, setOpenOTPDialog] = useState(false)
    const t = useTranslations()
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [total, setTotal] = useState<number>(0);
    const [openCardDialog, setOpenCardDialog] = useState(false)
    const schema = CreateOrderSchema(t)

    const locale = useLocale()

    useEffect(() => {
        const hasReloaded = sessionStorage.getItem("checkout_reloaded")
        if (!hasReloaded) {
            sessionStorage.setItem("checkout_reloaded", "true")
            setTimeout(() => {
                window.location.reload()
            }, 500)
        }
    }, [])

    const router = useRouter()
    const { updateStatus } = useCartLocal()


    // SSR-safe: chỉ đọc localStorage sau khi client mounted
    useEffect(() => {
        const storedId = localStorage.getItem("userIdGuest")
        const storedIdLogin = localStorage.getItem("userId")
        if (storedIdLogin) setUserIdLogin(storedIdLogin)
        if (storedId) setUserId(storedId)
    }, [])

    const { data: user } = useQuery<User>({
        queryKey: ["user", userIdLogin ? userIdLogin : userId],
        queryFn: () => getUserById(userIdLogin ? userIdLogin : userId),
        enabled: !!(userIdLogin ? userIdLogin : userId),
        retry: false,
    })

    const { data: addresses } = useQuery({
        queryKey: ["address-by-user", userIdLogin ? userIdLogin : userId],
        queryFn: () => getAddressByUserId(userIdLogin ? userIdLogin : userId),
        retry: false,
        enabled: !!(userIdLogin ? userIdLogin : userId),
    })

    const { data: invoiceAddress } = useQuery({
        queryKey: ["invoice-address-by-user", userIdLogin ? userIdLogin : userId],
        queryFn: () => getInvoiceAddressByUserId(userIdLogin ? userIdLogin : userId),
        retry: false,
        enabled: !!(userIdLogin ? userIdLogin : userId),
    })

    const { cart: localCart } = useCartLocal();
    const { data: cartItems, isLoading: isLoadingCart } = useQuery({
        queryKey: ["cart-items", userIdLogin ? userIdLogin : userId],
        queryFn: async () => {
            const data = await getCartItems()
            // Có thể sort theo thời gian tạo của từng giỏ hàng nếu cần
            data.sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
            return data
        },
        enabled: !!(userIdLogin ? userIdLogin : userId),
        retry: false
    })

    const createCheckOutMutation = useCreateCheckOut()
    const createPaymentMutation = useCreatePayment()
    const createUserAccountMutation = useSignUpGuess()
    const createInvoiceAddressMutation = useCreateInvoiceAddress()
    const createShippingAddressMutation = useCreateAddress()
    const syncLocalCartMutation = useSyncLocalCart(true);
    const checkMailExistMutation = useCheckMailExist();
    const editInvoiceAddressMutation = useUpdateInvoiceAddress()

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
        setUserIdLogin(verifiedUserId)
    }

    const form = useForm<CreateOrderFormValues>({
        resolver: zodResolver(schema),
        defaultValues: checkoutDefaultValues
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

    const couponAmount = form.watch('coupon_amount')
    const voucherAmount = form.watch('voucher_amount')

    //Assign cart_id into form values
    useEffect(() => {
        if (cartItems && cartItems?.length > 0) {
            console.log(cartItems)
        }

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
                    console.log('none')
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
                    console.log('yes')
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

                if (data.payment_method !== "bank") {
                    // Tạo payment
                    const payment = await createPaymentMutation.mutateAsync({
                        checkout_id: checkout.id,
                        pay_channel: data.payment_method,
                    })

                    setPaymentId(payment.payment_order_id)
                    if (data.payment_method === "paypal") {
                        router.push(payment.approve_url, { locale })
                    } else {
                        if (data.payment_method === "card") {
                            setOpenCardDialog(true)
                        }
                        // createPaymentIntent(data.payment_method as PaymentMethod);
                        setTotal(payment.amount)
                        setClientSecret(payment.clientSecret);
                    }
                }

                if (data.payment_method === "bank") {
                    setOpenBankDialog(true)
                }
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
                className='flex flex-col gap-8 section-padding'
            >
                <h2 className='section-header'>{t('order')}</h2>

                {/* Main container */}
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-12 lg:px-52 md:px-14 px-4'>

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
                    </div> */}

                    <div className='col-span-1 space-y-4 lg:space-y-12'>
                        <CheckOutUserInformation isLogin={userIdLogin ? true : false} />
                        <CheckOutShippingAddress key={`shipping-${userId}`} />
                        <CheckOutInvoiceAddress key={`invoice-${userId}`} />
                        {/* {userId ? '' : <CheckOutPassword isCreatePassword={isCreatePassword} setIsCreatePassword={setIsCreatePassword} />} */}
                    </div>

                    {/* Table cart and total */}
                    {/* Order summary 

                    */}
                    <div className='col-span-2 space-y-4 lg:space-y-4'>
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
                                            cartItems && Array.isArray(cartItems) && cartItems.length > 0
                                                ? cartItems
                                                    .flatMap((group) => group.items) // gom tất cả items trong từng supplier cart
                                                    .filter((item) => item.is_active)
                                                    .reduce((total, item) => total + (item.final_price ?? 0), 0)
                                                : localCart
                                                    ?.filter((item) => item.is_active)
                                                    .reduce(
                                                        (total, item) => total + (item.item_price ?? 0) * (item.quantity ?? 1),
                                                        0
                                                    ) ?? 0
                                        ).toLocaleString("de-DE", {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        })}
                                    </span>
                                </div>
                                <div className='grid grid-cols-5'>
                                    <span className='col-span-3 text-right'>{hasOtherCarrier ? t('shippingSpedition') : t('shipping')}</span>
                                    <span className='text-right col-span-2'>€{shippingCost.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                                                (
                                                    (Array.isArray(cartItems) && cartItems.length > 0
                                                        ? cartItems
                                                            .flatMap((group) => group.items) // gộp tất cả CartItem từ các supplier
                                                            .filter((item) => item.is_active)
                                                            .reduce((total, item) => total + (item.final_price ?? 0), 0)
                                                        : localCart
                                                            ?.filter((item) => item.is_active)
                                                            .reduce(
                                                                (total, item) =>
                                                                    total + (item.item_price ?? 0) * (item.quantity ?? 1),
                                                                0
                                                            ) ?? 0
                                                    ) +
                                                    (shippingCost ?? 0) -
                                                    (couponAmount ?? 0) -
                                                    (voucherAmount ?? 0)
                                                ).toLocaleString("de-DE", {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })
                                            )
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className='space-y-4 py-5 border-y-2'>
                            {/* <PaymentMethodSelector /> */}
                            <StripeLayout
                                clientSecret={clientSecret}
                                setClientSecret={setClientSecret}
                                total={total ?? undefined}
                                setTotal={setTotal}
                                openDialog={openCardDialog}
                                setOpenDialog={setOpenCardDialog}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="terms"
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
                                                    <Link href={`/agb`} className="text-secondary underline">
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
                            <Button
                                type="submit"
                                className='text-lg lg:w-1/3 w-1/2 py-6'
                                disabled={
                                    createCheckOutMutation.isPending
                                        || createInvoiceAddressMutation.isPending
                                        || createPaymentMutation.isPending
                                        || createShippingAddressMutation.isPending
                                        || createUserAccountMutation.isPending
                                        ? true : false
                                }
                            >{
                                    createCheckOutMutation.isPending
                                        || createInvoiceAddressMutation.isPending
                                        || createPaymentMutation.isPending
                                        || createShippingAddressMutation.isPending
                                        || createUserAccountMutation.isPending
                                        ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
                                        t('continue')}</Button>
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
