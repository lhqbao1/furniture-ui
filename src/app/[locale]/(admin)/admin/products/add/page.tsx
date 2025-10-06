import React from 'react'
import ProductAddClient from './product-add-client'

const AddProduct = () => {
    return (
        <div className='grid grid-cols-12 gap-6'>
            <div className='col-span-12 flex flex-col gap-6'>
                <ProductAddClient />
            </div>
        </div>
    )
}

export default AddProduct