'use client'
import { getCheckOutByUserId } from '@/features/checkout/api'
import { useQuery } from '@tanstack/react-query'
import React, { useEffect, useState } from 'react'
import { MyOrderDataTable } from './table'
import { useMyOrderTableColumns } from './columns'

const OrderList = () => {
    const [userId, setUserId] = useState<string | null>(null)

    // Lấy userId từ localStorage
    useEffect(() => {
        const storedUserId = localStorage.getItem('userId')
        setUserId(storedUserId)
    }, [])

    const { data: order, isLoading, isError } = useQuery({
        queryKey: ["checkout-user-id", userId],
        queryFn: () => getCheckOutByUserId(userId ?? ''),
        enabled: !!userId,
        retry: false,
    })

    const columns = useMyOrderTableColumns()


    return (
        <div className='lg:w-1/2 mx-auto space-y-6'>
            {order?.map((item, index) => {
                return (
                    <div key={index}>
                        <MyOrderDataTable columns={columns} data={item.cart.items} orderData={item} />
                    </div>
                )
            })}
        </div>
    )
}

export default OrderList