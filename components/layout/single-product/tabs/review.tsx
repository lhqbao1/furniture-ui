
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Star } from 'lucide-react'
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
import { allProducts, listComments } from '@/data/data'
import ListComments from './review/list-comments'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import GiveCommentSection from './review/give-comment-section'

const reviewCount = [
    { title: 5, percent: 70 },
    { title: 4, percent: 18 },
    { title: 3, percent: 10 },
    { title: 2, percent: 0 },
    { title: 1, percent: 2 }
]

const ProductReviewTab = () => {
    const [selectedRate, setSelectedRate] = useState<number>()
    const [showPic, setShowPic] = React.useState(true)
    const [showComments, setShowComments] = React.useState(true)

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

    return (
        <div className='grid grid-cols-12 lg:gap-28 gap-8 xl:pt-4 pt-0'>
            {/* LEFT: Reviews */}
            <div className='lg:col-span-7 col-span-12 flex flex-col gap-6'>
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
                        <Dialog>
                            <DialogTrigger asChild>
                                <div className='relative cursor-pointer'>
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
                            </DialogTrigger>
                            <DialogContent className='h-[90vh] w-[90vw] overflow-y-scroll py-6'>
                                <DialogHeader>
                                    <DialogTitle className='text-xl text-primary font-bold'>List Images</DialogTitle>
                                    <DialogDescription className='grid grid-cols-5 gap-6 w-full h-full pt-4'>
                                        {allProducts.map((item, index) => {
                                            return (
                                                <div key={index}>
                                                    <Image
                                                        src={item.image}
                                                        height={200}
                                                        width={200}
                                                        alt=''
                                                        className='w-full object-cover shadow-sm rounded-xl'
                                                    />
                                                </div>
                                            )

                                        })}

                                    </DialogDescription>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>
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
                            <Checkbox
                                id="pic"
                                checked={showPic}
                                onCheckedChange={(val) => setShowPic(!!val)}
                            />
                            <Label htmlFor="pic">pictures/video</Label>
                        </div>
                        <div className="flex flex-row-reverse items-center gap-2 col-span-6">
                            <Checkbox
                                id="comments"
                                checked={showComments}
                                onCheckedChange={(val) => setShowComments(!!val)}
                            />
                            <Label htmlFor="comments">comments</Label>
                        </div>
                    </div>
                </div>

                {/* List comments */}
                <ListComments listComments={listComments} showComments={showComments} showPic={showPic} />

            </div>

            {/* RIGHT: Videos + Write Review */}
            <div className="md:col-span-5 col-span-12 flex flex-col gap-6">
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

                <GiveCommentSection />
            </div>
        </div>
    )
}

export default ProductReviewTab
