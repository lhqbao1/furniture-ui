'use client'
import { useGetCategories } from '@/features/category/hook'
import React, { useState } from 'react'
import AddCategoryDrawer from './add-category-modal'
import { ChevronRight, CornerDownRight, Loader2 } from 'lucide-react'
import { CategoryResponse } from '@/types/categories'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { useAtom } from 'jotai'
import { selectedCategoryAtom } from '@/store/category'

interface CategoryItemProps {
    category: CategoryResponse
    level?: number
}

const CategoryItem: React.FC<CategoryItemProps> = ({ category, level = 0 }) => {
    const [selectedCategory, setSelectedCategory] = useAtom(selectedCategoryAtom)
    const hasChildren = category.children && category.children.length > 0

    // chỉ leaf category mới được select
    const isSelectable = !hasChildren

    const handleClick = () => {
        if (isSelectable) {
            setSelectedCategory(category.id)
        }
    }

    const activeClass = isSelectable && selectedCategory === category.id ? 'text-primary' : ''

    return (
        <div className={`flex flex-col pl-${category.level === 1 ? 0 : 6} mt-${level > 0 ? 2 : 0}`}>
            {hasChildren ? (
                <Collapsible>
                    <CollapsibleTrigger asChild>
                        <div className={`cursor-pointer flex items-center gap-1 hover:text-primary`}>
                            <ChevronRight
                                stroke="#51BE8C"
                                className="transition-transform duration-400"
                                size={18}
                            />
                            <div>{category.name}</div>
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className=''>
                        <div className="flex flex-col mt-1">
                            {category.children!.map((child) => (
                                <CategoryItem key={child.id} category={child} level={level + 1} />
                            ))}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            ) : (
                <div
                    className={`cursor-pointer flex items-center gap-1 hover:text-primary ${activeClass}`}
                    onClick={handleClick}
                >
                    <ChevronRight stroke="#51BE8C" size={18} />
                    {category.name}
                </div>
            )}
        </div>
    )
}


const ListCategories = () => {
    const { data: categories, isLoading, isError } = useGetCategories()
    return (
        <div className='space-y-4'>
            <AddCategoryDrawer />
            {isLoading && <Loader2 className='animate-spin' />}
            {categories ?
                categories.map((item) => (
                    <CategoryItem key={item.id} category={item} />
                ))
                : <div>No category found</div>
            }
        </div>
    )
}

export default ListCategories