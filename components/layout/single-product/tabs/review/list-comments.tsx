'use client'
import ListStars from '@/components/shared/list-stars'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import Image from 'next/image'
import React, { useEffect, useRef, useState } from 'react'
import CommentImageDialog from './comment-image-dialog'
import { Button } from '@/components/ui/button'
import { Comment } from '@/types/comment'
import { useTranslations } from 'next-intl'
import { useGetReviewsByProduct } from '@/features/review/hook'
import { formatDate, formatDateTime } from '@/lib/date-formated'

interface ListCommentsProps {
    showComments: boolean
    showPic: boolean
    productId: string
}

const ListComments = ({ showComments, showPic, productId }: ListCommentsProps) => {
    const t = useTranslations()
    const textRefs = useRef<(HTMLDivElement | null)[]>([])
    const [expandedIndexes, setExpandedIndexes] = useState<number[]>([])
    const [showButtonIndexes, setShowButtonIndexes] = useState<number[]>([])
    const { data: listComments, isLoading, isError } = useGetReviewsByProduct(productId)


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

    if (!listComments || isLoading) return <div>Loading...</div>
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
                                            <p className='text-gray-600 font-bold'>Customer</p>
                                            {/* {item.company && (
                                                <Image src={`/${item.company}`} width={40} height={40} alt='' unoptimized />
                                            )} */}
                                        </div>
                                        <div className='flex gap-2'>
                                            <p className='text-secondary font-semibold text-sm'>Purchased</p>
                                            <p className='text-gray-400 text-sm'>{formatDateTime(item.created_at)}</p>
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

                                    {item.static_files && item.static_files?.length > 0 && showPic ?
                                        <CommentImageDialog listComments={listComments} comment={item} />
                                        : ''}
                                </div>

                                {item.replies && (
                                    <div className='pl-12 pt-2 relative'>
                                        <div className='flex gap-2 items-center'>
                                            <p className='text-gray-600 font-bold'>{item.replies[0].comment}</p>
                                            <div className='flex gap-1 items-center'>
                                                <Image src={'/logo.svg'} height={30} width={30} alt='' className='size-4' unoptimized />
                                            </div>
                                        </div>
                                        <p>{item.replies[0].comment}</p>
                                        <div className='absolute w-6 h-14 left-4  border-l border-b top-0'></div>
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className='py-6 text-center'>
                            {/* <Button hasEffect className='rounded-full font-bold'>{t('loadMore')}</Button> */}
                        </div>
                        {/* <CustomPagination /> */}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    )
}

export default ListComments