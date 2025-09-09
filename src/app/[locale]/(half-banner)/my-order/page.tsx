import OrderList from '@/components/layout/my-order/order-list'
import React from 'react'

const MyOrder = () => {

    return (
        <div className='min-h-screen overflow-scroll w-full py-8 space-y-6'>
            <h1 className='section-header'>My Order</h1>
            <OrderList />
        </div>
    )
}

export default MyOrder