import React from 'react'
import OrderPlacedWrapper from './page-client'

export const metadata = {
    robots: {
        index: false,
        follow: false,
        nocache: true,
    },
}

const OrderPlacePage = () => {
    return (
        <OrderPlacedWrapper />
    )
}

export default OrderPlacePage