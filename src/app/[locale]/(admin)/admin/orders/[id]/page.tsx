'use client'
import { orderDetailColumn } from '@/components/layout/admin/orders/order-details/columns'
import DocumentTable from '@/components/layout/admin/orders/order-details/document/document-table'
import OrderDeliveryOrder from '@/components/layout/admin/orders/order-details/order-delivery-order'
import OrderInformation from '@/components/layout/admin/orders/order-details/order-information'
import OrderDetailOverView from '@/components/layout/admin/orders/order-details/order-overview'
import OrderDetailUser from '@/components/layout/admin/orders/order-details/order-user'
import { ProductTable } from '@/components/layout/admin/products/products-list/product-table'
import AdminBackButton from '@/components/shared/admin-back-button'
import { useGetMainCheckOutByMainCheckOutId } from '@/features/checkout/hook'
import { getInvoiceByCheckOut } from '@/features/invoice/api'
import { formatDate, formatDateTime } from '@/lib/date-formated'
import { CartItem } from '@/types/cart'
import { CheckOutMain } from '@/types/checkout'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'

function extractCartItemsFromMain(checkOutMain: CheckOutMain): CartItem[] {
    if (!checkOutMain?.checkouts) return []

    return checkOutMain.checkouts.flatMap((checkout) =>
        checkout.cart.items.flatMap((cartGroup) => cartGroup)
    )
}


const OrderDetails = () => {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const params = useParams<{ id: string }>()  // type-safe
    const checkoutId = params?.id
    // const { data: order, isLoading, isError } = useGetCheckOutByCheckOutId(checkoutId)
    const { data: order, isLoading, isError } = useGetMainCheckOutByMainCheckOutId(checkoutId)
    const { data: invoice, isLoading: isLoadingInvoice, isError: isErrorInvoice } = useQuery({
        queryKey: ["invoice-checkout", checkoutId],
        queryFn: () => getInvoiceByCheckOut(checkoutId as string),
        enabled: !!checkoutId,
        retry: false
    })

    if (isLoading) return <div>Loading...</div>
    if (isError) return <div>Error loading order</div>
    if (!order) return <div>Error loading order</div>

    return (
        <div className='space-y-12 pb-20'>
            <AdminBackButton />
            <div className='grid grid-cols-4 gap-12'>
                <OrderDetailOverView
                    order={order}
                    created_at={formatDate(order.created_at)}
                    updated_at={formatDateTime(order.updated_at)}
                    status={order.status}

                />
                <OrderDetailUser user={order.checkouts[0].user} shippingAddress={order.checkouts[0].shipping_address} invoiceAddress={order.checkouts[0].invoice_address} />
            </div>
            <ProductTable
                data={extractCartItemsFromMain(order)}
                columns={orderDetailColumn}
                page={page}
                setPage={setPage}
                pageSize={pageSize}
                setPageSize={setPageSize}
                totalItems={extractCartItemsFromMain(order).length}
                totalPages={Math.ceil(extractCartItemsFromMain(order).length / pageSize)}
                hasPagination={false}
                hasCount={false}
                hasHeaderBackGround
            />
            <OrderInformation
                language={order.checkouts[0].user.language ?? ''}
                sub_total={order.total_amount_item}
                shipping_amount={order.total_shipping}
                discount_amount={order.voucher_amount + order.coupon_amount}
                tax={(((((invoice?.total_amount_item ?? 0) + (invoice?.total_shipping ?? 0))) + (invoice?.voucher_amount ?? 0)) / 1.19 * 0.19)}
                total_amount={order.total_amount}
                payment_method={order.payment_method}
                entry_date={order.created_at}
                is_Ebay={order.marketplace_order_id ? true : false}
            />
            <OrderDeliveryOrder
                data={order.checkouts}
            />
            {order.status !== "Pending" ?
                <div className='flex gap-12'>
                    <DocumentTable order={order} invoiceCode={invoice?.invoice_code} />
                    {/* <DocumentTable /> */}
                </div>
                : ''}
        </div>
    )
}

export default OrderDetails