import React, { useState } from 'react'
import { ProductTable } from '../../products/products-list/product-table'
import { CheckOut } from '@/types/checkout'
import { orderChildColumns, orderColumns } from '../order-list/column'

interface OrderDeliveryOrderProps {
    data: CheckOut[]
}

const OrderDeliveryOrder = ({ data }: OrderDeliveryOrderProps) => {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(100)
    return (
        <ProductTable
            data={data ? data : []}
            columns={orderChildColumns}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalItems={data.length ?? 0}
            totalPages={1}
            hasBackground
            hasExpanded
            hasPagination={false}
            hasCount={false}
        />
    )
}

export default OrderDeliveryOrder