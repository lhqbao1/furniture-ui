import { CheckOut, CheckOutMain } from '@/types/checkout'
import { ArrowRight } from 'lucide-react'
import React from 'react'

interface OrderDetailOverViewProps {
    created_at: string,
    updated_at: string,
    status: string,
    order: CheckOutMain
}

const OrderDetailOverView = ({ created_at, updated_at, status, order }: OrderDetailOverViewProps) => {
    return (
        <div className='space-y-1 col-span-1'>
            <div className='flex gap-1 text-sm font-bold'>
                <div>Order ID:</div>
                <div>{order.checkout_code}</div>
            </div>
            <div className='flex gap-1 text-sm font-bold'>
                <div>Ext order:</div>
                <div>{order.marketplace_order_id ? order.marketplace_order_id : ""}</div>
            </div>
            <div className='flex gap-1 text-sm'>
                <div>Created:</div>
                <div>{created_at}</div>
            </div>
            <div className='flex gap-1 text-sm'>
                <div>Last update:</div>
                <div>{updated_at}</div>
            </div>
            <div className='space-y-2 mt-2'>
                <div className='flex items-center justify-between text-sm py-1 px-2 border rounded-md font-bold cursor-pointer'>
                    <div className='flex gap-1'>
                        <div>Status:</div>
                        <div>{status}</div>
                    </div>
                    <ArrowRight size={16} />
                </div>
                <div className='flex items-center justify-between text-sm py-1 px-2 border rounded-md font-bold cursor-pointer'>
                    <div className='flex gap-1'>
                        <div>Chanel:</div>
                        <div translate='no' className='capitalize'>{order.from_marketplace ?? "Prestige Home"}</div>
                    </div>
                    <ArrowRight size={16} />
                </div>
                <div className='flex items-center justify-between text-sm py-1 px-2 border rounded-md font-bold cursor-pointer'>
                    <div className='flex gap-1'>
                        <div>Payment Method:</div>
                        <div translate='no' className='capitalize'>{order.payment_method}</div>
                    </div>
                    <ArrowRight size={16} />
                </div>
            </div>
        </div>
    )
}

export default OrderDetailOverView