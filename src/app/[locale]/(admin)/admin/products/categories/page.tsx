import CategoryAdd from '@/components/layout/admin/products/category-list/category-add'
import ListCategories from '@/components/layout/admin/products/category-list/list-categories'
import React from 'react'

const CategoryPage = async () => {
    return (
        <div className='w-full min-h-screen grid grid-cols-12 gap-2'>
            <div className='col-span-3'>
                <ListCategories />
            </div>
            <div className='col-span-9'>
                <CategoryAdd />
            </div>
        </div>
    )
}

export default CategoryPage