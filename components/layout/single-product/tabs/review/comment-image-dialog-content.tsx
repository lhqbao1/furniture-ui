import ListStars from '@/components/shared/list-stars'
import { Button } from '@/components/ui/button'
import { Comment } from '@/types/comment'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import React, { useCallback, useState } from 'react'

interface CommentImageDialogContentProps {
    comment: Comment
    onNext: () => void
    onPrev: () => void
}

const CommentImageDialogContent = ({ comment, onNext, onPrev }: CommentImageDialogContentProps) => {
    const [selectedIdx, setSelectedIdx] = useState(0)
    const listImages = comment.listImages || []

    const handleSelect = (index: number) => {
        setSelectedIdx(index)
    }

    return (
        <div className="grid grid-cols-12 gap-6 h-full">
            {/* LEFT */}
            <div className="lg:col-span-8 col-span-12 bg-gray-100 rounded-lg overflow-hidden flex flex-col justify-center items-center relative">
                <Image
                    src={`/${listImages[selectedIdx]}`}
                    alt=""
                    width={500}
                    height={500}
                    className="object-cover"
                    unoptimized
                />

                {/* Nút điều hướng */}
                <Button
                    variant={'default'}
                    onClick={onPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-primary text-white px-3 py-5 rounded-full"
                    hasEffect
                >
                    <ArrowLeft />
                </Button>
                <Button
                    onClick={onNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-3 py-5 rounded-full"
                    hasEffect
                    variant={'default'}
                >
                    <ArrowRight />
                </Button>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-4 col-span-12 shadow-lg p-6 rounded-lg flex flex-col gap-2 overflow-auto">
                {/* Info */}
                <div className="flex items-center gap-2">
                    <p className="font-bold text-lg">{comment.name}</p>
                    <Image
                        src={comment.company ? `/${comment.company}` : "/amazon.png"}
                        alt=""
                        width={40}
                        height={40}
                        unoptimized
                    />
                </div>
                <ListStars rating={comment.rating} />
                <p className='text-sm line-clamp-10'>{comment.comment}</p>

                {/* Thumbnails */}
                <div className="grid grid-cols-4 gap-3 pt-4">
                    {listImages.map((image, index) => (
                        <div
                            key={index}
                            className={`
                                col-span-1 p-1 relative rounded-sm cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl
                                ${selectedIdx === index ? 'ring-1 ring-primary ring-offset-3 ring-offset-white' : 'bg-white shadow-sm'}
                              `}
                            onClick={() => handleSelect(index)}
                        >
                            <Image
                                src={`/${image}`}
                                alt=""
                                width={100}
                                height={100}
                                className="rounded-sm"
                                unoptimized
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}


export default CommentImageDialogContent