'use client'
import { orderDetailColumn } from '@/components/layout/admin/orders/order-details/columns'
import DocumentTable from '@/components/layout/admin/orders/order-details/document/document-table'
import OrderInformation from '@/components/layout/admin/orders/order-details/order-information'
import OrderDetailOverView from '@/components/layout/admin/orders/order-details/order-overview'
import OrderDetailUser from '@/components/layout/admin/orders/order-details/order-user'
import PaymentTable from '@/components/layout/admin/orders/order-details/payment/payment-table'
import { ProductTable } from '@/components/layout/admin/products/products-list/product-table'
import { useGetCheckOutByCheckOutId } from '@/features/checkout/hook'
import { formatDateTime } from '@/lib/date-formated'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'

const OrderDetails = () => {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const params = useParams<{ id: string }>()  // type-safe
    const checkoutId = params?.id
    const { data: order, isLoading, isError } = useGetCheckOutByCheckOutId(checkoutId)

    if (isLoading) return <div>Loading...</div>
    if (isError) return <div>Error loading order</div>
    if (!order) return <div>Error loading order</div>

    return (
        <div className='space-y-12 pb-20'>
            <div className='flex gap-14 items-center'>
                <OrderDetailOverView
                    orderId={order?.id}
                    created_at={formatDateTime(order.created_at)}
                    updated_at={formatDateTime(order.updated_at)}
                    status={order.status}
                />
                <OrderDetailUser user={order.user} shippingAddress={order.shipping_address} invoiceAddress={order.invoice_address} />
            </div>
            <ProductTable
                data={order.cart.items}
                columns={orderDetailColumn}
                hasBackground
                page={page}
                setPage={setPage}
                pageSize={pageSize}
                setPageSize={setPageSize}
                totalItems={order.cart.items.length}
                totalPages={Math.ceil(order.cart.items.length / pageSize)}
            />
            <OrderInformation language={order.user.language ?? ''} sub_total={order.total_amount_item} shipping_amount={order.total_shipping} discount_amount={order.voucher_amount + order.coupon_amount} tax={order.total_vat} total_amount={order.total_amount} />
            <div className='flex gap-12'>
                <DocumentTable />
                {/* <PaymentTable /> */}
            </div>
        </div>
    )
}

export default OrderDetails