import AddProductForm from '@/components/layout/admin/products/products-add/add-product-form'
import ListDE from '@/components/layout/admin/products/products-add/list-de'
import React from 'react'

const AddProduct = () => {
    return (
        <div className='grid grid-cols-12 gap-6'>
            <div className='col-span-12 flex flex-col gap-6'>
                <ListDE />
                <AddProductForm />
            </div>

        </div>
    )
}

export default AddProduct