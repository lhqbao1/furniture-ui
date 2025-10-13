"use client"

import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { getCheckOutByCheckOutId, getMainCheckOutByMainCheckOutId } from "@/features/checkout/api"
import { formatDate } from "@/lib/date-formated"
import { PackagingDialogTable } from "./packaging-dialog-table"
import { packagingColumns } from "./packaging-dialog-columns"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { getInvoiceByCheckOut } from "@/features/invoice/api"

interface PackagingDialogComponentProps {
    checkoutId: string
    invoiceId?: string
}

export default function PackagingDialogComponent({ checkoutId, invoiceId }: PackagingDialogComponentProps) {
    const t = useTranslations("packaging")
    const tGlobal = useTranslations()
    const { data: checkout, isLoading: isCheckoutLoading, isError: isCheckoutError } = useQuery({
        queryKey: ["checkout-id", checkoutId],
        queryFn: () => getMainCheckOutByMainCheckOutId(checkoutId as string),
        enabled: !!checkoutId,
    })

    const { data: invoice, isLoading: isInvoiceLoading, isError: isInvoiceError } = useQuery({
        queryKey: ["invoice-checkout", checkoutId],
        queryFn: () => getInvoiceByCheckOut(checkoutId as string),
        enabled: !!checkoutId,
        retry: false
    })


    const flattenedCartItems = useMemo(() => {
        if (!invoice?.main_checkout?.checkouts) return []

        // Flatten toàn bộ items trong tất cả các checkout
        return invoice.main_checkout.checkouts.flatMap(checkout => {
            // Nếu checkout.cart là mảng (CartResponse)
            if (Array.isArray(checkout.cart)) {
                return checkout.cart.flatMap(cartItem => cartItem.items ?? [])
            }

            // Nếu checkout.cart là object (CartResponseItem)
            return checkout.cart?.items ?? []
        })
    }, [invoice])
    return (
        <div id="invoice-table" className="flex flex-col gap-6 items-start w-[794px] h-screen overflow-y-scroll py-4 px-8 relative">
            <div className="flex justify-between max-w-full">
                <div>
                    <Image
                        src="/invoice-logo.png"
                        height={100}
                        width={100}
                        alt=""
                    />
                </div>
                <div className="flex flex-1 flex-col items-end">
                    <h1 className="uppercase text-secondary font-bold text-4xl">{t('title')}</h1>
                    <span>{t('subtitle')} - PKG001</span>
                </div>
            </div>
            <div className="flex flex-col items-start gap-1">
                <span>{checkout?.checkouts[0]?.user.first_name} {checkout?.checkouts[0]?.user.last_name}</span>
                <span>{checkout?.checkouts[0]?.shipping_address.city}</span>
                <span>{checkout?.checkouts[0]?.shipping_address.address_line}</span>
                <span>{checkout?.checkouts[0]?.user.user_code}</span>
            </div>
            <div className="w-full flex justify-between border-y-2 border-gray-400">
                <div className="col-span-1">
                    <div className="font-bold text-secondary">{t("packageNumber")}</div>
                    <div>PKG001</div>
                </div>
                <div className="col-span-1">
                    <div className="font-bold text-secondary">{t("orderDate")}</div>
                    <div>{formatDate(checkout?.created_at ?? new Date())}</div>
                </div>
                <div className="col-span-1">
                    <div className="font-bold text-secondary">{t("salesOrder")}</div>
                    <div className="text-end">{checkout?.checkout_code}</div>
                </div>

            </div>

            <div className="grid grid-cols-2 w-full gap-6">
                <div className="col-span-1">
                    <div>{t("billTo")}</div>
                    <div>{checkout?.checkouts[0]?.user.first_name} {checkout?.checkouts[0]?.user.last_name}</div>
                    <div>{checkout?.checkouts[0]?.shipping_address.city}</div>
                    <div>{checkout?.checkouts[0]?.shipping_address.address_line}</div>
                    <div>{checkout?.checkouts[0]?.user.user_code}</div>
                </div>

                <div className="col-span-1">
                    <div>{t("shipTo")}</div>
                    <div>{checkout?.checkouts[0]?.user.first_name} {checkout?.checkouts[0]?.user.last_name}</div>
                    <div>{checkout?.checkouts[0]?.shipping_address.city}</div>
                    <div>{checkout?.checkouts[0]?.shipping_address.address_line}</div>
                    <div>{checkout?.checkouts[0]?.user.user_code}</div>
                </div>
            </div>

            <div className="w-full">
                <PackagingDialogTable data={flattenedCartItems} columns={packagingColumns} />
            </div>

            {checkout?.note ?
                <div className="mt-10">
                    {tGlobal('note')}: {checkout?.note}
                </div> : ''
            }
        </div>
    )
}