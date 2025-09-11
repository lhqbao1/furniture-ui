'use client'
import { listDE } from '@/data/data'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'

const ListDE = () => {
    const [selected, setSelected] = useState<number>(1)

    const handleSetSelected = (id: number) => {
        setSelected(id)
    }

    return (
        <div>
            <div className='flex flex-row items-end gap-0 border-b'>
                {listDE.map((item, index) => {
                    const isSelected = item.id === selected
                    return (
                        <div key={item.id} className='flex justify-center items-end' onClick={() => handleSetSelected(item.id)}>
                            {!item.text ?
                                <div className={cn('px-4 py-2',
                                    isSelected && 'border-t border-r border-l'
                                )}>
                                    <Image
                                        src={item.icon}
                                        alt=''
                                        width={60}
                                        height={40}
                                        className=''
                                        unoptimized
                                    />
                                </div>
                                :
                                <div className={cn('flex gap-1 items-center px-4 py-2',
                                    isSelected && 'border-t border-r border-l'
                                )}>
                                    <Image
                                        src={item.icon}
                                        alt=''
                                        width={60}
                                        height={30}
                                        className={`${item.id === 1 || item.id === 2 ? 'w-5 h-4' : ''}`}
                                        unoptimized
                                    />
                                    <span className={cn('text-sm', isSelected && 'text-primary')}>{item.text}</span>
                                </div>
                            }
                        </div>
                    )
                })}
                <div className='flex justify-center translate-x-1/2 -translate-y-1/3 border rounded-md'><Plus size={20} stroke='gray' /></div>
            </div>
            <div className='italic text-gray-400 text-sm mt-2'>Translated from Default DE</div>
        </div>
    )
}

export default ListDE