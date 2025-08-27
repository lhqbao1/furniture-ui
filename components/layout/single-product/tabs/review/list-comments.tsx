'use client'
import ListStars from '@/components/shared/list-stars'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import CommentImageDialog from './comment-image-dialog'
import { CustomPagination } from '@/components/shared/custom-pagination'
import { Button } from '@/components/ui/button'
import { Comment } from '@/types/comment'

interface ListCommentsProps {
    showComments: boolean
    listComments: Comment[]
    showPic: boolean
}

const ListComments = ({ showComments, listComments, showPic }: ListCommentsProps) => {
    const textRefs = useRef<(HTMLDivElement | null)[]>([])
    const [expandedIndexes, setExpandedIndexes] = useState<number[]>([])
    const [showButtonIndexes, setShowButtonIndexes] = useState<number[]>([])

    const toggleExpand = (idx: number) => {
        setExpandedIndexes(prev =>
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        )
    }

    useEffect(() => {
        textRefs.current.forEach((el, idx) => {
            if (el) {
                const lineHeight = parseInt(getComputedStyle(el).lineHeight)
                const lines = el.scrollHeight / lineHeight
                if (lines > 5) {
                    setShowButtonIndexes(prev => [...prev, idx])
                }
            }
        })
    }, [])
    return (
        <div className='pt-0'>
            <Collapsible open={showComments}>
                <CollapsibleContent>
                    <div className='pt-0'>
                        {listComments.map((item, index) => (
                            <div key={index} className='border-b border-gray-300 pt-4 pb-6'>
                                <div className='flex justify-between items-center'>
                                    <div>
                                        <div className='flex items-center gap-2'>
                                            <p className='text-gray-600 font-bold'>{item.name}</p>
                                            {item.company && (
                                                <Image src={`/${item.company}`} width={40} height={40} alt='' />
                                            )}
                                        </div>
                                        <div className='flex gap-2'>
                                            <p className='text-secondary font-semibold text-sm'>{item.status}</p>
                                            <p className='text-gray-400 text-sm'>{item.date}</p>
                                        </div>
                                    </div>
                                    <div className='flex flex-row gap-1'>
                                        <ListStars rating={item.rating} />
                                    </div>
                                </div>

                                <div>
                                    <div
                                        ref={el => { textRefs.current[index] = el }}
                                        className={`mt-2 ${!expandedIndexes.includes(index) ? 'line-clamp-5' : ''}`}
                                    >
                                        {item.comment}
                                    </div>
                                    {showButtonIndexes.includes(index) && (
                                        <button
                                            className="text-primary mt-1 cursor-pointer font-bold text-sm"
                                            onClick={() => toggleExpand(index)}
                                        >
                                            {expandedIndexes.includes(index) ? 'See less' : 'Read more'}
                                        </button>
                                    )}

                                    {item.listImages && item.listImages?.length > 0 && showPic ?
                                        <CommentImageDialog listComments={listComments} comment={item} />

                                        : ''}
                                </div>

                                {item.reply && (
                                    <div className='pl-12 pt-2 relative'>
                                        <div className='flex gap-2 items-center'>
                                            <p className='text-gray-600 font-bold'>{item.reply.name}</p>
                                            <div className='flex gap-1 items-center'>
                                                <p className='text-secondary text-sm font-semibold'>{item.reply.role}</p>
                                                <Image src={'/logo.svg'} height={30} width={30} alt='' className='size-4' />
                                            </div>
                                        </div>
                                        <p>{item.reply.comment}</p>
                                        <div className='absolute w-6 h-14 left-4  border-l border-b top-0'></div>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className='py-6 text-center'>
                            <Button hasEffect className='rounded-full font-bold'>Load More</Button>
                        </div>
                        {/* <CustomPagination /> */}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}

export default ListComments