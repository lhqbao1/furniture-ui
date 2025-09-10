'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUploadStaticFile } from '@/features/file/hook'
import { useSendMail } from '@/features/mail/hook'
import { useGetUserById } from '@/features/users/hook'
import { useAtom } from 'jotai'
import { checkOutIdAtom, paymentIdAtom } from '@/store/payment'
import { getCheckOutByCheckOutId } from '@/features/checkout/api'
import { getInvoiceByCheckOut } from '@/features/invoice/api'
import { useQuery } from '@tanstack/react-query'
import { InvoicePDF } from '@/components/layout/pdf/file'
import { pdf } from '@react-pdf/renderer'
import Image from 'next/image'
import { useCapturePayment } from '@/features/payment/hook'

const OrderPlaced = () => {
    const router = useRouter()
    const [counter, setCounter] = useState(5)
    const [userId, setUserId] = useState<string | null>(null)
    const [checkoutId, setCheckOutId] = useAtom(checkOutIdAtom)
    const [paymentId, setPaymentId] = useAtom(paymentIdAtom)

    const capturePaymentMutation = useCapturePayment()
    const uploadStaticFileMutation = useUploadStaticFile()
    const sendMailMutation = useSendMail()

    // Lấy userId từ localStorage
    useEffect(() => {
        const id = localStorage.getItem('userId')
        if (id) setUserId(id)
    }, [])

    const { data: checkout, isLoading: isCheckoutLoading } = useQuery({
        queryKey: ["checkout-id", checkoutId],
        queryFn: async () => {
            if (!checkoutId || !paymentId) return null;

            // 1. Capture payment trước
            await capturePaymentMutation.mutateAsync(paymentId);

            // 2. Sau đó fetch checkout
            return getCheckOutByCheckOutId(checkoutId);
        },
        enabled: !!checkoutId && !!paymentId, // chỉ chạy khi có checkoutId và paymentId
    });

    const { data: invoice } = useQuery({
        queryKey: ["invoice-checkout", checkoutId],
        queryFn: () => getInvoiceByCheckOut(checkoutId as string),
        enabled: !!checkout, // chỉ fetch khi checkout đã có dữ liệu
    });

    // Gọi hook trực tiếp
    const { data: user } = useGetUserById(userId || '')



    // Luồng xử lý khi có user
    useEffect(() => {
        const process = async () => {
            if (!checkout || !invoice || !user) return

            try {
                const doc = <InvoicePDF checkout={checkout} invoice={invoice} />
                const asPdf = pdf(doc)
                const blob = await asPdf.toBlob()

                // 2. upload file
                const file = new File([blob], 'invoice.pdf', { type: 'application/pdf' })
                const formData = new FormData()
                formData.append('files', file)
                const uploadRes = await uploadStaticFileMutation.mutateAsync(formData)

                // 3. Send mail
                await sendMailMutation.mutateAsync({
                    to_email: user.email,
                    attachment_url: uploadRes.results[0].url,
                    checkout_id: checkout.checkout_code,
                    first_name: user.first_name ?? ''
                })
            } catch (err) {
                console.error(err)
            }
        }
        process()
    }, [checkout, invoice, user])

    // Redirect về home sau 5s
    useEffect(() => {
        if (counter <= 0) {
            router.push('/')
            return
        }
        const timer = setTimeout(() => setCounter(prev => prev - 1), 1000)
        return () => clearTimeout(timer)
    }, [counter, router])

    return (
        <div className='w-full min-h-screen flex flex-col justify-center items-center gap-12 -translate-y-10'>
            <div className="px-5 py-6 flex flex-col items-center gap-3">
                <Image
                    src="/new-logo.png"
                    alt="Prestige Home logo"
                    width={100}
                    height={100}
                    priority
                    className="w-auto h-[80px]"
                />
                <div className="font-libre text-2xl flex gap-1">
                    <span className="text-secondary text-[40px] font-semibold">Prestige</span>
                    <span className="text-primary text-[40px] font-semibold">Home</span>
                </div>
            </div>
            <div className="relative flex flex-col items-center justify-center bg-white text-center w-fit h-fit px-40 py-8">

                <div className="absolute top-0 left-0 w-40 h-32 bg-secondary clip-triangle-top-left" />
                <div className="absolute bottom-0 right-0 w-40 h-32 bg-primary clip-triangle-bottom-right" />

                <h1 className="text-6xl font-libre text-gray-700 mb-6 italic">Thank You</h1>

                <p className="text-gray-600 text-lg">
                    We are happy to let you know that your order has been successfully placed.
                </p>
                <p className="text-gray-600 text-lg mt-2">
                    We will send you another email with tracking information as soon as your order ships.
                </p>
                <p className="text-gray-600 text-lg mt-2">
                    Thank you for shopping with us!
                </p>

                <p className="text-primary text-base mt-6">
                    We will redirect you to home after <span className="font-semibold text-secondary">{counter}</span> seconds.
                </p>
            </div>
        </div>
    )
}

export default OrderPlaced


