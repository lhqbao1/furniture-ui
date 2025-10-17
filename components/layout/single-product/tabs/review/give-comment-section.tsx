'use client'
import { Star } from 'lucide-react'
import Image from 'next/image'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { getMe } from '@/features/auth/api'
import { Button } from '@/components/ui/button'
import CommentForm from './comment-form'

const GiveCommentSection = () => {
    const [rating, setRating] = useState(0)
    const t = useTranslations()

    const [userId, setUserId] = React.useState<string | null>(
        typeof window !== "undefined" ? localStorage.getItem("userId") : null
    );

    const handleRating = useCallback((index: number) => {
        setRating(index)
    }, [])

    const { data: user, isLoading: isLoadingUser, isError: isErrorUser } = useQuery({
        queryKey: ["me", userId],
        queryFn: () => getMe(),
        enabled: !!userId,
        retry: false,
    });

    if (!user) {
        return (
            <Button>Login to comment</Button>
        )
    }

    return (
        <div className='flex flex-col gap-4'>
            <div className='text-gray-600 text-lg font-bold'>{t('writeReview')}</div>
            <div className='flex justify-between items-center'>
                <div className='flex gap-2 items-center'>
                    <Image src={'/people.webp'} height={100} width={100} alt='' className='rounded-full size-16' unoptimized />
                    <div>
                        <p className='text-lg text-gray-600 font-bold'></p>
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
                    <p className='text-sm text-gray-600 font-semibold'>{t('yourRating')}</p>
                </div>
            </div>
            <CommentForm />
        </div>
    )
}

export default GiveCommentSection