'use client'
import React, { useState } from 'react'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { useGetCheckOutMainByUserIdAdmin } from '@/features/checkout/hook'
import { BadgeEuro, HeartPlus, ShoppingCart, SquareCheckBig } from 'lucide-react'
import { ProductTable } from '../products/products-list/product-table'
import { customerOrderColumns, orderColumns } from '../orders/order-list/column'

interface ListOrderProps {
    userId: string
}

const ListOrder = ({ userId }: ListOrderProps) => {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(50)

    const { data: checkouts, isLoading, isError } = useGetCheckOutMainByUserIdAdmin(userId)
    return (
        <Card>
            <CardHeader className='grid grid-cols-4 gap-0.5'>
                <div className='flex gap-3 items-center'>
                    <SquareCheckBig className='text-secondary size-14' />
                    <div>
                        <div className='text-3xl font-semibold text-secondary text-start'>{checkouts?.length}</div>
                        <div className='text-gray-600 text-sm'>Orders placed</div>
                    </div>
                </div>
                <div className='flex gap-3 items-center'>
                    <ShoppingCart className='text-secondary size-14' />
                    <div>
                        <div className='text-3xl font-semibold text-secondary text-start'>{checkouts?.length}</div>
                        <div className='text-gray-600 text-sm'>Items in cart</div>
                    </div>
                </div>
                <div className='flex gap-3 items-center'>
                    <HeartPlus className='text-secondary size-14' />
                    <div>
                        <div className='text-3xl font-semibold text-secondary text-start'>{checkouts?.length}</div>
                        <div className='text-gray-600 text-sm'>Items in wishlist</div>
                    </div>
                </div>
                <div className='flex gap-3 items-center'>
                    <BadgeEuro className='text-secondary size-14' />
                    <div>
                        <div className='text-3xl font-semibold text-secondary text-start'>
                            €{checkouts?.reduce((sum, item) => sum + (item.total_amount || 0), 0).toLocaleString('de-DE', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </div>
                        <div className='text-gray-600 text-sm'>Total spent</div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ProductTable
                    data={checkouts ? checkouts : []}
                    columns={customerOrderColumns}
                    page={page}
                    setPage={setPage}
                    pageSize={pageSize}
                    setPageSize={setPageSize}
                    totalItems={checkouts?.length ?? 0}
                    totalPages={1}
                    hasBackground
                    hasPagination={false}
                    hasCount={false}
                />
            </CardContent>
        </Card>
    )
}

export default ListOrder