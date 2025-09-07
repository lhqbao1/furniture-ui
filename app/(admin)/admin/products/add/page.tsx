
import ListDE from '@/components/layout/admin/products/products-form/list-de'
import React from 'react'
import ProductAddClient from './product-add-client'
import { Button } from '@/components/ui/button'

const AddProduct = () => {
    return (
        <div className='grid grid-cols-12 gap-6'>
            <div className='col-span-12 flex flex-col gap-6'>
                <ListDE />
                <ProductAddClient />
            </div>
        </div>
    )
}

export default AddProduct