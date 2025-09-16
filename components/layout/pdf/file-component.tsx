"use client"

import { invoiceColumns } from "./column"
import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { getCheckOutByCheckOutId } from "@/features/checkout/api"
import { getInvoiceByCheckOut } from "@/features/invoice/api"
import { FileTable } from "./table"
import { check } from "zod"

interface InvoiceTableProps {
    checkoutId: string
    invoiceId?: string
}

export default function InvoiceTable({ checkoutId, invoiceId }: InvoiceTableProps) {
    const { data: checkout, isLoading: isCheckoutLoading, isError: isCheckoutError } = useQuery({
        queryKey: ["checkout-id", checkoutId],
        queryFn: () => getCheckOutByCheckOutId(checkoutId as string),
        enabled: !!checkoutId, // chỉ chạy khi có id
    })

    const { data: invoice, isLoading: isInvoiceLoading, isError: isInvoiceError } = useQuery({
        queryKey: ["invoice-checkout", checkoutId],
        queryFn: () => getInvoiceByCheckOut(checkoutId as string),
        enabled: !!checkoutId, // chỉ chạy khi có id
    })

    return (
        <div id="invoice-table" className="flex flex-col gap-6 items-start w-[794px] h-screen overflow-y-scroll p-12 pb-4 relative">
            <Image
                src="/invoice-logo.png"
                height={100}
                width={100}
                alt=""
            />
            <div className="flex justify-between gap-8 w-full">
                <div className="flex flex-col gap-1">
                    <span>{checkout?.user.first_name} {checkout?.user.last_name}</span>
                    <span>{checkout?.shipping_address.city}</span>
                    <span>{checkout?.shipping_address.address_line}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <span>Invoice ID: {invoice?.invoice_code}</span>
                    <span>
                        Invoice date: {checkout?.created_at
                            ? new Date(checkout.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })
                            : ""}
                    </span>
                    <span>Customer ID: {checkout?.user.id.slice(0.7)}</span>
                </div>
            </div>
            <div className="text-center w-full space-y-4">
                <h2 className="text-3xl text-secondary font-bold">Invoice</h2>
                <FileTable columns={invoiceColumns} data={checkout?.cart.items ?? []} voucher={invoice?.voucher_amount} coupon={invoice?.coupon_amount} />
            </div>

            <div className="flex flex-col items-end w-full space-y-2">
                <div className="flex gap-3 justify-end">
                    <div>Total net amount</div>
                    <div>
                        €{
                            (checkout?.total_amount_item ?? 0)
                            - (checkout?.total_vat ?? 0)
                            - (checkout?.voucher_amount ?? 0)
                            - (checkout?.coupon_amount ?? 0)
                        }
                    </div>
                </div>
                <div className="flex gap-3 justify-end">
                    <div>Total VAT </div>
                    <div>€{checkout?.total_vat}</div>
                </div><div className="flex gap-3 justify-end">
                    <div>Shipping cost</div>
                    <div>€{checkout?.total_shipping}</div>
                </div><div className="flex gap-3 justify-end bg-secondary/20 p-2 rounded-sm">
                    <div className="font-bold">Invoice amount</div>
                    <div>€{checkout?.total_amount}</div>
                </div><div className="flex gap-3 justify-end">
                    <div className="font-bold">Amount Due</div>
                    <div>€{checkout?.total_amount}</div>
                </div><div className="flex gap-3 justify-end">
                    <div>Payment (PayPal Checkout) from 04/29/2025</div>
                    <div>€{checkout?.total_amount}</div>
                </div><div className="flex gap-3 justify-end">
                    <div>Open Amount</div>
                    <div>€00.00</div>
                </div>
            </div>

            <div className="flex justify-between mt-20 w-full">
                <div className="space-y-1">
                    <div className="font-semibold">Prestige Home GmbH</div>
                    <div>Greifswalder Straße 226, 10405 Berlin.</div>
                    <div>Tel: info@prestige-home.de</div>
                </div>
                <div className="space-y-1">
                    <div className="font-semibold">Chief Executive Office</div>
                    <div>Thuy Duong Nguyen</div>
                    <div>Tax code: DE454714336</div>
                </div>
            </div>

            <div className="absolute right-0 top-0">
                <Image
                    src={'/Vector1.png'}
                    height={160}
                    width={160}
                    alt=""
                    unoptimized
                />
                <Image
                    src={'/Vector2.png'}
                    height={160}
                    width={160}
                    alt=""
                    unoptimized
                />
            </div>

            <div className="absolute left-0 bottom-0">
                <Image
                    src={'/Vector3.png'}
                    height={160}
                    width={160}
                    alt=""
                    unoptimized
                />
                <Image
                    src={'/Vector4.png'}
                    height={160}
                    width={160}
                    alt=""
                    unoptimized
                />
            </div>
        </div>
    )
}