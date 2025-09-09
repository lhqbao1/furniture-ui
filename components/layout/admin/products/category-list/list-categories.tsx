'use client'
import { useDeleteCategory, useGetCategories } from '@/features/category/hook'
import React, { useState } from 'react'
import AddCategoryDrawer from './add-category-modal'
import { ChevronRight, CornerDownRight, Loader2, Pencil, Trash } from 'lucide-react'
import { CategoryResponse } from '@/types/categories'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"
import { useAtom } from 'jotai'
import { selectedCategoryAtom, selectedCategoryNameAtom } from '@/store/category'
import { toast } from 'sonner'

interface CategoryItemProps {
    category: CategoryResponse
    level?: number
    expandedIds: string[]
    setExpandedIds: React.Dispatch<React.SetStateAction<string[]>>
}

const CategoryItem: React.FC<CategoryItemProps> = ({
    category,
    level = 0,
    expandedIds,
    setExpandedIds
}) => {
    const [selectedCategory, setSelectedCategory] = useAtom(selectedCategoryAtom)
    const [selectedCategoryName, setSelectedCategoryName] = useAtom(selectedCategoryNameAtom)

    const deleteCategoryMutation = useDeleteCategory()

    const handleDeleteCategory = (id: string) => {
        deleteCategoryMutation.mutate(id, {
            onSuccess() {
                toast.success("Delete category successful")
            },
            onError() {
                toast.error("Delete category fail")
            },
        })
    }

    const hasChildren = category.children && category.children.length > 0
    const isSelectable = !hasChildren

    const handleClick = () => {
        if (isSelectable) {
            setSelectedCategory(category.id)
            setSelectedCategoryName(category.name)
        }
    }

    const isOpen = expandedIds.includes(category.id)
    const toggleOpen = (open: boolean) => {
        setExpandedIds((prev) =>
            open ? [...prev, category.id] : prev.filter((id) => id !== category.id)
        )
    }

    const activeClass =
        isSelectable && selectedCategory === category.id ? 'text-primary' : ''

    return (
        <div className={`flex flex-col pl-${category.level === 1 ? 0 : 7}`}>
            {hasChildren ? (
                <Collapsible open={isOpen} onOpenChange={toggleOpen}>
                    <CollapsibleTrigger asChild>
                        <div className="group gap-4 grid grid-cols-3 cursor-pointer pr-6">
                            <div className="flex items-center gap-1 col-span-2">
                                {category.level === 1 ? (
                                    <ChevronRight
                                        stroke="#51BE8C"
                                        className={`transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}
                                        size={18}
                                    />
                                ) : (
                                    <CornerDownRight
                                        stroke="#51BE8C"
                                        className={`transition-transform duration-300 ${isOpen ? "text-primary translate-x-1" : ""}`}
                                        size={18}
                                    />
                                )}
                                <div>{category.name}</div>
                            </div>
                            <div className="flex gap-2 col-span-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash size={18} className="cursor-pointer" onClick={() => handleDeleteCategory(category.id)} />
                                <Pencil size={18} className="cursor-pointer" />
                            </div>
                        </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <div className="flex flex-col mt-1">
                            {category.children!.map((child) => (
                                <CategoryItem
                                    key={child.id}
                                    category={child}
                                    expandedIds={expandedIds}
                                    setExpandedIds={setExpandedIds}
                                />
                            ))}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            ) : (
                <div
                    className={`group gap-4 grid grid-cols-3 cursor-pointer pr-6 ${activeClass}`}
                    onClick={handleClick}
                >
                    <div className="flex gap-1 items-center col-span-2">
                        <ChevronRight stroke="#51BE8C" size={18} />
                        {category.name}
                    </div>
                    <div className="flex gap-2 col-span-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash size={18} className="cursor-pointer" onClick={() => handleDeleteCategory(category.id)} />
                        <Pencil size={18} className="cursor-pointer" />
                    </div>
                </div>
            )}
        </div>
    )
}

const ListCategories = () => {
    const { data: categories, isLoading } = useGetCategories()
    const [expandedIds, setExpandedIds] = useState<string[]>([])

    const getAllCategoryIdsWithChildren = (items: CategoryResponse[]): string[] => {
        let ids: string[] = []
        items.forEach((item) => {
            if (item.children && item.children.length > 0) {
                ids.push(item.id)
                ids = [...ids, ...getAllCategoryIdsWithChildren(item.children)]
            }
        })
        return ids
    }

    const handleExpandAll = () => {
        if (!categories) return
        setExpandedIds(getAllCategoryIdsWithChildren(categories))
    }

    const handleCollapseAll = () => {
        setExpandedIds([])
    }

    return (
        <div className="space-y-8">
            <div className='space-y-2'>
                <AddCategoryDrawer />
                <div className='space-x-4 flex'>
                    <div className='text-sm hover:text-primary cursor-pointer' onClick={handleExpandAll}>Expand All</div>
                    <div className='text-sm hover:text-primary cursor-pointer' onClick={handleCollapseAll}>Collapse All</div>
                </div>
            </div>

            <div className='space-y-2'>
                {isLoading && <Loader2 className="animate-spin" />}
                {categories ? (
                    categories.map((item) => (
                        <CategoryItem
                            key={item.id}
                            category={item}
                            expandedIds={expandedIds}
                            setExpandedIds={setExpandedIds}
                        />
                    ))
                ) : (
                    'No category found'
                )}
            </div>
        </div>
    )
}

export default ListCategories
