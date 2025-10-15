import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Address } from '@/types/address'
import { User } from '@/types/user'
import React from 'react'

interface OrderDetailUserProps {
    user: User
    shippingAddress: Address
    invoiceAddress: Address
}

const OrderDetailUser = ({ user, shippingAddress, invoiceAddress }: OrderDetailUserProps) => {
    const initials = `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()

    return (
        <>
            <div className='col-span-1 pt-2 pb-6 px-3 rounded-sm border space-y-2.5'>
                <h4 className='font-bold'>Customer</h4>
                <div className='flex items-start gap-2.5'>
                    <div className='text-sm'>
                        <div>{user.first_name} {user.last_name}</div>
                        <div>{user.email}</div>
                        <div>{user.phone_number}</div>
                    </div>
                </div>
            </div>
            <div className='col-span-1 py-2 px-3 rounded-sm border space-y-2.5 flex-1'>
                <h4 className='font-bold'>Invoice address</h4>
                <div className='space-y-2.5'>
                    <div className='text-sm'>
                        <div>{invoiceAddress.address_line}</div>
                        <div>{invoiceAddress.city}</div>
                        <div>{invoiceAddress.country}</div>
                    </div>
                </div>
            </div>
            <div className='col-span-1 py-2 px-3 rounded-sm border space-y-2.5 flex-1'>
                <h4 className='font-bold'>Shipping address</h4>
                <div className='space-y-2.5'>
                    <div className='text-sm'>
                        <div>{shippingAddress.recipient_name}</div>
                        <div>{shippingAddress.address_line}</div>
                        <div className='flex gap-1'>
                            <div>{shippingAddress.postal_code}</div>
                            -
                            <div>{shippingAddress.city}</div>
                        </div>
                        <div>{shippingAddress.country}</div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default OrderDetailUser