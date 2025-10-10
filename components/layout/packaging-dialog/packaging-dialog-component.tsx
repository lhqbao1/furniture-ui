"use client"

import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { getCheckOutByCheckOutId } from "@/features/checkout/api"
import { formatDate } from "@/lib/date-formated"
import { PackagingDialogTable } from "./packaging-dialog-table"
import { packagingColumns } from "./packaging-dialog-columns"
import { useTranslations } from "next-intl"

interface PackagingDialogComponentProps {
    checkoutId: string
    invoiceId?: string
}

export default function PackagingDialogComponent({ checkoutId, invoiceId }: PackagingDialogComponentProps) {
    const t = useTranslations("packaging")
    const tGlobal = useTranslations()
    const { data: checkout, isLoading: isCheckoutLoading, isError: isCheckoutError } = useQuery({
        queryKey: ["checkout-id", checkoutId],
        queryFn: () => getCheckOutByCheckOutId(checkoutId as string),
        enabled: !!checkoutId,
    })
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
                <span>{checkout?.user.first_name} {checkout?.user.last_name}</span>
                <span>{checkout?.shipping_address.city}</span>
                <span>{checkout?.shipping_address.address_line}</span>
                <span>{checkout?.user.user_code}</span>
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
                    <div>{checkout?.user.first_name} {checkout?.user.last_name}</div>
                    <div>{checkout?.shipping_address.city}</div>
                    <div>{checkout?.shipping_address.address_line}</div>
                    <div>{checkout?.user.user_code}</div>
                </div>

                <div className="col-span-1">
                    <div>{t("shipTo")}</div>
                    <div>{checkout?.user.first_name} {checkout?.user.last_name}</div>
                    <div>{checkout?.shipping_address.city}</div>
                    <div>{checkout?.shipping_address.address_line}</div>
                    <div>{checkout?.user.user_code}</div>
                </div>
            </div>

            <div className="w-full">
                <PackagingDialogTable data={checkout?.cart.items ?? []} columns={packagingColumns} />
            </div>

            {checkout?.note ?
                <div className="mt-10">
                    {tGlobal('note')}: {checkout?.note}
                </div> : ''
            }
        </div>
    )
}