import React from 'react'
import CheckOutPageClient from './page-client'

export const metadata = {
    robots: {
        index: false,
        follow: false,
        nocache: true,
    },
}

const CartPage = () => {
    return (
        <CheckOutPageClient />
    )
}

export default CartPage