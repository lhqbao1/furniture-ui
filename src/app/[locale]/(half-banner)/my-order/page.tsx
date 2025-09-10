import OrderList from '@/components/layout/my-order/order-list'
import { useTranslations } from 'next-intl'
import React from 'react'

const MyOrder = () => {
    const t = useTranslations()
    return (
        <div className='min-h-screen overflow-scroll w-full py-8 space-y-6'>
            <h1 className='section-header'>{t('myOrder')}</h1>
            <OrderList />
        </div>
    )
}

export default MyOrder