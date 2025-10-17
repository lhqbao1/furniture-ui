import { formatDateTime } from '@/lib/date-formated'
import { User } from '@/types/user'
import React from 'react'

interface OrderInformationProps {
    payment_method?: string
    language: string
    external_id?: string
    warehouse?: string
    referrer?: string
    owner?: User
    order_type?: string
    shipping_profile?: string
    package_number?: string
    entry_date?: Date
    client?: string
    sub_total?: number
    shipping_amount?: number
    discount_amount?: number
    tax?: number
    total_amount?: number
    is_Ebay?: boolean
}

const OrderInformation = ({
    payment_method,
    language,
    external_id,
    warehouse,
    referrer,
    owner,
    order_type,
    shipping_profile,
    package_number,
    entry_date,
    client,
    sub_total,
    shipping_amount,
    discount_amount,
    tax,
    total_amount,
    is_Ebay = false
}: OrderInformationProps) => {
    return (
        <div className="grid grid-cols-2 gap-10">
            <div className="space-y-3 col-span-1">
                <div className="grid grid-cols-10 items-center gap-2">
                    <div className="text-right col-span-2">Payment Method:</div>
                    <div className="rounded-sm border px-2 py-1 w-full col-span-6 capitalize">
                        {payment_method ?? 'eBay Payment'}
                    </div>
                </div>

                <div className="grid grid-cols-10 items-center gap-2">
                    <div className="text-right col-span-2">Language:</div>
                    <div className="rounded-sm border px-2 py-1 w-full col-span-6">
                        {language ?? 'None'}
                    </div>
                </div>
                <div className="grid grid-cols-10 items-center gap-2">
                    <div className="text-right col-span-2">Order type:</div>
                    <div className="rounded-sm border px-2 py-1 w-full col-span-6">
                        {order_type ?? 'Sales order'}
                    </div>
                </div>
            </div>

            <div className='space-y-3 col-span-1'>
                <div className='grid grid-cols-3'>
                    <div className='text-end col-span-2'>Sub total</div>
                    <div className='text-end'>
                        €{sub_total?.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
                <div className='grid grid-cols-3'>
                    <div className='text-end col-span-2'>Shipping</div>
                    <div className='text-end'>
                        €{((shipping_amount ?? 0) + (discount_amount ?? 0))?.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
                <div className='grid grid-cols-3'>
                    <div className='text-end col-span-2'>Discount</div>
                    <div className='text-end'>
                        €{is_Ebay ? '00,00' : discount_amount?.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                </div>
                <div className='grid grid-cols-3'>
                    <div className='text-end col-span-2'>VAT</div>
                    <div className='text-end'>
                        €{tax}
                    </div>
                </div>
                <div className='text-end text-2xl text-primary font-bold'>
                    <div className=''>Total €{total_amount?.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
            </div>
        </div>
    )
}

export default OrderInformation
