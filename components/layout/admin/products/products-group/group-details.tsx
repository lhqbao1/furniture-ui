import React from 'react'
import { useFormContext } from 'react-hook-form'
import SelectProductAttributes from './select-attributes'
import { useAtom } from 'jotai'
import { currentProductGroup } from '@/store/product-group'
import ListVariantOption from './list-variant-options'

const GroupDetails = () => {
    const [currentGroup, setCurrentGroup] = useAtom(currentProductGroup)

    return (
        <div className='flex flex-col items-start gap-6 w-full'>
            <div className="grid grid-cols-6 w-full gap-8">
                <p className='col-span-1 text-right'>Group name:</p>
                <div className='flex gap-4 items-center'>
                    <span className='font-semibold col-span-5'>{currentGroup ? currentGroup : 'None'}</span>
                </div>
            </div>
            <div className='w-full space-y-6'>
                <SelectProductAttributes />
                <ListVariantOption />
            </div>
        </div>
    )
}

export default GroupDetails