import React from 'react'
import CartPageClient from './page-client'

export const metadata = {
    robots: {
        index: false,
        follow: false,
        nocache: true,
    },
}

const CartPage = () => {
    return (
        <CartPageClient />
    )
}

export default CartPage