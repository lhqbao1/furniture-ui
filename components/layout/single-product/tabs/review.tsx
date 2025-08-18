import { CustomPagination } from '@/components/shared/custom-pagination'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Plus, Star } from 'lucide-react'
import Image from 'next/image'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import YouTube, { YouTubeProps } from "react-youtube"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import CommentForm from './review/comment-form'
import { Comment } from '@/types/comment'
import CommentImageDialog from './review/comment-image-dialog'
import { listComments } from '@/data/data'

const reviewCount = [
    { title: 5, percent: 70 },
    { title: 4, percent: 18 },
    { title: 3, percent: 10 },
    { title: 2, percent: 0 },
    { title: 1, percent: 2 }
]



const ProductReviewTab = () => {
    const [selectedRate, setSelectedRate] = useState<number>()
    const [expandedIndexes, setExpandedIndexes] = useState<number[]>([])
    const [showButtonIndexes, setShowButtonIndexes] = useState<number[]>([])
    const textRefs = useRef<(HTMLDivElement | null)[]>([])
    const [rating, setRating] = useState(0)

    const [videos, setVideos] = useState([
        "wQZQD5VIOoQ",
        "PNKb4AadnpM",
        "dQw4w9WgXcQ",
        "kXYiU_JCYtU",
        "3JZ_D3ELwOQ",
        "9bZkp7q19f0",
        "L_jWHffIx5E",
        "eY52Zsg-KVI",
        "C0DPdy98e4c",
    ])

    // Memoize options tránh re-render không cần thiết
    const mainVideoOpts = useMemo<YouTubeProps["opts"]>(() => ({
        width: "100%",
        height: "100%",
        playerVars: { autoplay: 1, mute: 1 }
    }), [])

    const sideVideoOpts = useMemo<YouTubeProps["opts"]>(() => ({
        width: "100%",
        height: "100%",
        playerVars: { modestbranding: 1, rel: 0, showinfo: 0, control: 0 }
    }), [])

    // useCallback tránh tạo function mới mỗi lần render
    const handleSwap = useCallback((index: number) => {
        setVideos(prev => {
            const newVideos = [...prev]
            const temp = newVideos[0]
            newVideos[0] = newVideos[index]
            newVideos[index] = temp
            return newVideos
        })
    }, [])

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

    const toggleExpand = (idx: number) => {
        setExpandedIndexes(prev =>
            prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
        )
    }

    return (
        <div className='grid grid-cols-12 gap-8 xl:pt-4 pt-0'>
            {/* LEFT: Reviews */}
            <div className='col-span-7 flex flex-col gap-6'>
                {/* Review main */}
                <div className='grid grid-cols-12 gap-4'>
                    <div className='col-span-2 flex flex-col items-center justify-center'>
                        <h3 className='flex flex-row gap-1'>4.8 <Star /></h3>
                        <p className='text-center'><span className='text-primary font-semibold'>120</span> happy customer</p>
                        <p className='text-gray-500'>70 reviews</p>
                    </div>

                    <div className='col-span-6'>
                        {reviewCount.map((item, index) => (
                            <div key={index} className='flex flex-row gap-2 items-center'>
                                <div className='flex gap-1 items-center'>
                                    <p className='min-w-2.5'>{item.title}</p>
                                    <Star className='text-primary' stroke='#f15a24' fill='#f15a24' size={20} />
                                </div>
                                <div className="h-1.5 w-full bg-gray-300 relative overflow-hidden rounded-full">
                                    <div
                                        style={{ width: `${item.percent}%` }}
                                        className="absolute top-0 left-0 h-full bg-secondary rounded-full"
                                    />
                                </div>
                                <p className='text-gray-600 font-semibold xl:w-4'>{item.percent}%</p>
                            </div>
                        ))}
                    </div>

                    <div className='col-span-4'>
                        <div className='relative'>
                            {[20, 21, 22].map((item, index) => (
                                <div
                                    key={index}
                                    className='absolute xl:left-8 left:4 top-5'
                                    style={{ transform: `rotate(${-[(index + 1) * 10]}deg)` }}
                                >
                                    <Image
                                        src={`/${item}.png`}
                                        width={100}
                                        height={100}
                                        alt=''
                                        className='size-full'
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <div className='grid grid-cols-12 gap-8 border-b border-gray-300 pb-6'>
                    <div className='col-span-6 flex flex-row justify-between'>
                        <p>All</p>
                        {[...reviewCount].reverse().map((item, index) => (
                            <div key={index} className='flex gap-1'>
                                <p>{item.title}</p>
                                <Star
                                    stroke='#f15a24'
                                    onClick={() => setSelectedRate(item.title)}
                                    fill={selectedRate === item.title ? "#f15a24" : "white"}
                                />
                            </div>
                        ))}
                    </div>
                    <div className='col-span-6 flex gap-8'>
                        <div className="flex flex-row-reverse items-center gap-2 col-span-6">
                            <Checkbox id="pic" defaultChecked />
                            <Label htmlFor="pic">pictures/video</Label>
                        </div>
                        <div className="flex flex-row-reverse items-center gap-2 col-span-6">
                            <Checkbox id="comments" defaultChecked />
                            <Label htmlFor="comments">comments</Label>
                        </div>
                    </div>
                </div>

                {/* List comments */}
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
                                    {reviewCount.map((star, i) => (
                                        <Star
                                            key={i}
                                            size={20}
                                            fill={star.title <= item.rating ? '#f15a24' : 'white'}
                                            stroke='#f15a24'
                                        />
                                    ))}
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

                                {item.listImages && item.listImages?.length > 0 ?
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
                    <CustomPagination />
                </div>
            </div>

            {/* RIGHT: Videos + Write Review */}
            <div className="col-span-5 flex flex-col gap-6">
                <div className="w-full aspect-video">
                    <YouTube
                        className="w-full h-full rounded-lg"
                        iframeClassName="rounded-lg"
                        videoId={videos[0]}
                        opts={mainVideoOpts}
                    />
                </div>

                <div className='flex justify-center xl:pb-6 pb-4 border-b border-gray-300'>
                    <Carousel opts={{ align: "start", loop: true }} className='w-3/4'>
                        <CarouselContent>
                            {videos.slice(1).map((id, idx) => (
                                <CarouselItem
                                    key={idx}
                                    className="basis-1/3 cursor-pointer"
                                    onClick={() => handleSwap(idx + 1)}
                                >
                                    <div className="aspect-video w-full rounded-md overflow-hidden">
                                        <YouTube
                                            className="w-full h-full"
                                            iframeClassName="rounded-md"
                                            videoId={id}
                                            opts={sideVideoOpts}
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className='text-primary border-primary' />
                        <CarouselNext className='text-primary border-primary' />
                    </Carousel>
                </div>

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
                                    <button key={item} onClick={() => setRating(idx + 1)} className="focus:outline-none">
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
                    <CommentForm />
                </div>
            </div>
        </div>
    )
}

export default ProductReviewTab
