'use client'
import { Star } from 'lucide-react'
import Image from 'next/image'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { getMe } from '@/features/auth/api'
import { Button } from '@/components/ui/button'
import CommentForm from './comment-form'

interface GiveCommentSectionProps {
    productId: string;
}

const GiveCommentSection = ({ productId }: GiveCommentSectionProps) => {
    const t = useTranslations()

    const [userId, setUserId] = React.useState<string | null>(
        typeof window !== "undefined" ? localStorage.getItem("userId") : null
    );

    // const { data: user, isLoading: isLoadingUser, isError: isErrorUser } = useQuery({
    //     queryKey: ["me", userId],
    //     queryFn: () => getMe(),
    //     enabled: !!userId,
    //     retry: false,
    // });

    // if (!user) {
    //     return (
    //         <div className='flex justify-start'><Button>Login to comment</Button></div>
    //     )
    // }

    return (
        <div className='flex flex-col gap-4'>
            <div className='text-gray-600 text-lg font-bold'>{t('writeReview')}</div>
            <div className='flex justify-between items-center'>
                {/* <div className='flex gap-2 items-center'>
                    <Image src={'/people.webp'} height={100} width={100} alt='' className='rounded-full size-16' unoptimized />
                    <div>
                        <p className='text-lg text-gray-600 font-bold'></p>
                        <p className='text-sm text-secondary font-semibold'>Purchased</p>
                    </div>
                </div> */}
            </div>
            <CommentForm productId={productId} userId={userId ?? ''} />
        </div>
    )
}

export default GiveCommentSection