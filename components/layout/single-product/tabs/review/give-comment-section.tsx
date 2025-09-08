'use client'
import { Star } from 'lucide-react'
import Image from 'next/image'
import React, { useCallback, useMemo, useState } from 'react'
import CommentForm from './comment-form'

const GiveCommentSection = () => {
    const [rating, setRating] = useState(0)

    const handleRating = useCallback((index: number) => {
        setRating(index)
    }, [])

    return (
        <div className='flex flex-col gap-4'>
            <div className='text-gray-600 text-lg font-bold'>Write review</div>
            <div className='flex justify-between items-center'>
                <div className='flex gap-2 items-center'>
                    <Image src={'/people.webp'} height={100} width={100} alt='' className='rounded-full size-16' />
                    <div>
                        <p className='text-lg text-gray-600 font-bold'>Tom Hank</p>
                        <p className='text-sm text-secondary font-semibold'>Purchased</p>
                    </div>
                </div>

                <div>
                    <div className="flex flex-row gap-1">
                        {[1, 2, 3, 4, 5].map((item, idx) => (
                            <button key={item} onClick={() => handleRating(idx + 1)} className="focus:outline-none">
                                <Star
                                    stroke="#f15a24"
                                    fill={idx < rating ? "#f15a24" : "none"}
                                    className="w-6 h-6"
                                />
                            </button>
                        ))}
                    </div>
                    <p className='text-sm text-gray-600 font-semibold'>Your rating</p>
                </div>
            </div>
            {/* <CommentForm /> */}
        </div>
    )
}

export default GiveCommentSection